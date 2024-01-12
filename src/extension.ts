import * as vscode from "vscode";
import { ExtensionService } from "./domain/services/ExtensionService";
import { MarketplaceRepo } from "./domain/valueobjects/VsCExtension/repositories/marketplace";
import { EXTENSION_NAME, SHARE_XT_EXTENSION } from "./util/consts";

export function activate(context: vscode.ExtensionContext) {
  const marketplaceRepo = new MarketplaceRepo();
  const extensionService = new ExtensionService(marketplaceRepo);

  const extSubscriptions = [
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.${extensionService.writeExtensionsToJson.name}`,
      async () => {
        try {
          await extensionService.writeExtensionsToJson(
            "extensions.sharext.json"
          );
        } catch (e) {
          vscode.window.showErrorMessage(
            "Error writing file: " +
              (`message` in (e as Error) ? (e as Error).message : e)
          );
        }
      }
    ),
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (document.uri.fsPath.endsWith(SHARE_XT_EXTENSION)) {
        const extensions = extensionService.parseExtensionsFromJson(
          document.getText()
        );

        const panel = vscode.window.createWebviewPanel(
          "sharext",
          "ShareXt Viewer",
          vscode.ViewColumn.Beside,
          {
            enableScripts: true,
          }
        );

        panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>My Webview</title>
        </head>
        <body>
            ${extensions.map((ext) => ext.html).join("")}
        </body>
        </html>`;
      }
    }),
  ];

  context.subscriptions.push(...extSubscriptions);
}

export function deactivate() {}
