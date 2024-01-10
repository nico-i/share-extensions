import * as fs from "fs";
import * as vscode from "vscode";
import { SHARE_XT_EXTENSION } from "../../../util/consts";
import { ShareXtExtension } from "../../valueobjects";

export class ExportService {
  public writeExtensionsToJson(
    extensions: readonly vscode.Extension<any>[],
    path: string
  ) {
    if (path === "" || !path.endsWith(SHARE_XT_EXTENSION)) {
      throw new Error(`File path must end with '${SHARE_XT_EXTENSION}'`);
    }

    const extensionData = extensions
      .filter((ext) => ext.isActive)
      .map(
        (ext): ShareXtExtension =>
          new ShareXtExtension({
            id: ext.id,
            name: ext.packageJSON.displayName,
            author: ext.packageJSON.publisher,
            description: ext.packageJSON.description,
          })
      );

    fs.writeFile(path, JSON.stringify(extensionData, null, 2), (err) => {
      if (err) {
        throw err;
      }
    });
  }
}
