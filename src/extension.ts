import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { ExtensionService } from "./domain/services/ExtensionService";
import { Extension } from "./domain/valueobjects";
import { MarketplaceRepo } from "./domain/valueobjects/Extension/repositories/marketplace";
import { EXTENSION_LIST_FILE_EXT, EXTENSION_NAME } from "./util/consts";

export function activate(context: vscode.ExtensionContext) {
  const marketplaceRepo = new MarketplaceRepo();
  const extensionService = new ExtensionService(marketplaceRepo);

  const cssPath = vscode.Uri.file(
    path.join(context.extensionPath, "src", "assets", "css", "styles.css")
  );
  const css = fs.readFileSync(cssPath.fsPath, "utf8");

  const currentDocument = vscode.window.activeTextEditor?.document;
  if (currentDocument?.fileName.endsWith(EXTENSION_LIST_FILE_EXT)) {
    openExtensionViewer(
      extensionService.parseExtensionsFromJson(currentDocument.getText()),
      css
    );
  }

  const extSubscriptions = [
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.${extensionService.writeExtensionsToJson.name}`,
      async () => {
        try {
          await extensionService.writeExtensionsToJson(
            `extensions.${EXTENSION_LIST_FILE_EXT}`
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
      if (document.uri.fsPath.endsWith(EXTENSION_LIST_FILE_EXT)) {
        openExtensionViewer(
          extensionService.parseExtensionsFromJson(document.getText()),
          css
        );
      }
    }),
  ];

  context.subscriptions.push(...extSubscriptions);
}

function openExtensionViewer(extensions: Extension[], css: string) {
  const panel = vscode.window.createWebviewPanel(
    "sharext",
    "ShareXt Viewer",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
    }
  );
  try {
    panel.webview.html = `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>ShareXt Viewer</title>
              <style>
                  ${css}
              </style>
          </head>
          <body>
         ${extensions.map((ext) => ext.html).join("")}
        
          </body>
          </html>`;
  } catch (e) {
    vscode.window.showErrorMessage(
      "Error reading file: " +
        (`message` in (e as Error) ? (e as Error).message : e)
    );
  }
}

export function deactivate() {}
