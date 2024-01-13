import * as fs from "fs";
import * as vscode from "vscode";
import { EXTENSION_LIST_FILE_EXT } from "../../../util/consts";
import { Extension } from "../../valueobjects";
import { MarketplaceRepo } from "../../valueobjects/Extension/repositories/marketplace";

export class ExtensionService {
  private readonly _marketplaceRepo: MarketplaceRepo;

  constructor(marketplaceRepo: MarketplaceRepo) {
    this._marketplaceRepo = marketplaceRepo;
  }

  /**
   * Writes a JSON file containing all installed extensions with their info from the marketplace to the given path.
   *
   * @param pathToOutputFile Path to write the JSON file to. Must end with EXTENSION_LIST_FILE_EXT
   * @returns The path to the file that was written
   */
  public async writeExtensionsToJson(
    pathToOutputFile: string
  ): Promise<string> {
    if (
      pathToOutputFile === "" ||
      !pathToOutputFile.endsWith(EXTENSION_LIST_FILE_EXT)
    ) {
      throw new Error(`File path must end with '${EXTENSION_LIST_FILE_EXT}'`);
    }
    const localRetrievalProgress = 10;
    const fetchingProgress = 80;
    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Creating extension list",
        cancellable: false,
      },
      async (progress) => {
        progress.report({
          increment: 0,
          message: "Retrieving local extensions...",
        });

        const allLocalExtsWithoutBuiltins: vscode.Extension<any>[] =
          vscode.extensions.all.filter(
            (ext) =>
              !ext.packageJSON.isBuiltin &&
              !ext.id.startsWith("undefined_publisher.")
          );

        const allLocalExts: Extension[] = allLocalExtsWithoutBuiltins.map(
          (ext) =>
            new Extension({
              id: ext.id,
              name: ext.packageJSON.name,
              author: ext.packageJSON.publisher,
              description: ext.packageJSON.description,
            })
        );

        progress.report({
          increment: localRetrievalProgress,
          message: "Fetching extension info from marketplace...",
        });

        const fetchIncrement = fetchingProgress / allLocalExts.length;
        const allExtPromises: PromiseSettledResult<Extension>[] =
          await Promise.allSettled(
            allLocalExts.map((ext) => {
              const extPromise = this._marketplaceRepo
                .getExtensionById(ext.id)
                .then((ext) => {
                  progress.report({
                    increment: fetchIncrement,
                    message: `Fetching info for '${ext.name}'...`,
                  });
                  return ext;
                });
              return extPromise;
            })
          );

        const allExts: Extension[] = allExtPromises.map(
          (ext, index): Extension => {
            if (ext.status === "rejected") {
              return allLocalExts[index];
            } else if (ext.status === "fulfilled") {
              return ext.value;
            }
            return allLocalExts[index];
          }
        );

        progress.report({
          increment: 100 - localRetrievalProgress - fetchingProgress,
          message: "Writing JSON file...",
        });

        fs.writeFileSync(
          pathToOutputFile,
          "[" + allExts.map((ext) => ext.toJSON()).join(",\n") + "]"
        );
        progress.report({ increment: 100 });
        return pathToOutputFile;
      }
    );
  }

  public async parseExtensionsFromJson(
    jsonStr: vscode.Uri
  ): Promise<Extension[]> {
    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Parsing extensions from JSON",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 });
        const file = fs.readFileSync(jsonStr.fsPath, "utf8");
        const extensions: Extension[] = JSON.parse(file).map((ext: any) =>
          Extension.fromJSON(JSON.stringify(ext))
        );

        extensions.forEach((ext: Extension) => {
          const isInstalled = vscode.extensions.all.some(
            (installedExt) =>
              !installedExt.packageJSON.isBuiltin && installedExt.id === ext.id
          );
          ext.installed = isInstalled;
          progress.report({
            increment: 80 / extensions.length,
            message: `Parsing '${ext.name}'...`,
          });
          return ext;
        });

        progress.report({ increment: 90, message: "Sorting extensions..." });
        const sortedExtensions = extensions.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        progress.report({ increment: 100 });
        return sortedExtensions;
      }
    );
  }
}
