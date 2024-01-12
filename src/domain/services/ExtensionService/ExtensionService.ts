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

  public async writeExtensionsToJson(path: string) {
    if (path === "" || !path.endsWith(EXTENSION_LIST_FILE_EXT)) {
      throw new Error(`File path must end with '${EXTENSION_LIST_FILE_EXT}'`);
    }

    const allLocalExtensionsWithoutBuiltins: vscode.Extension<any>[] =
      vscode.extensions.all.filter(
        (ext) =>
          !ext.packageJSON.isBuiltin &&
          !ext.id.startsWith("undefined_publisher.")
      );

    const allLocalVsCExtensions: Extension[] =
      allLocalExtensionsWithoutBuiltins.map(
        (ext) =>
          new Extension({
            id: ext.id,
            name: ext.packageJSON.name,
            author: ext.packageJSON.publisher,
            description: ext.packageJSON.description,
          })
      );

    const allVscExtensions: Extension[] = (
      await Promise.allSettled(
        allLocalVsCExtensions.map((ext) =>
          this._marketplaceRepo.getExtensionById(ext.id)
        )
      )
    ).map((ext, index): Extension => {
      if (ext.status === "rejected") {
        return allLocalVsCExtensions[index];
      } else if (ext.status === "fulfilled") {
        return ext.value;
      }
      return allLocalVsCExtensions[index];
    });

    fs.writeFile(
      path,
      "[" + allVscExtensions.map((ext) => ext.toJSON()).join(",\n") + "]",
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  }

  public parseExtensionsFromJson(jsonStr: string): Extension[] {
    const extensions: Extension[] = JSON.parse(jsonStr).map((ext: any) =>
      Extension.fromJSON(JSON.stringify(ext))
    );

    return extensions
      .map(
        (ext: any) =>
          new Extension({
            name: ext.name,
            author: ext.author,
            description: ext.description,
            id: ext.id,
            iconSrc: ext.iconSrc,
          })
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
