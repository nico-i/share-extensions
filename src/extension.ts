import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { ExtensionService } from "./domain/services/ExtensionService";
import { Extension } from "./domain/valueobjects/Extension/Extension";
import { MarketplaceRepo } from "./domain/valueobjects/Extension/repositories/marketplace";
import { EXTENSION_LIST_FILE_EXT, EXTENSION_NAME } from "./util/consts";

export function activate(context: vscode.ExtensionContext) {
  const marketplaceRepo = new MarketplaceRepo();
  const extensionService = new ExtensionService(marketplaceRepo);

  const cssPath = vscode.Uri.file(
    path.join(context.extensionPath, "src", "assets", "css", "styles.css")
  );
  const css = fs.readFileSync(cssPath.fsPath, "utf8");

  const subs = [
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (document.uri.fsPath.endsWith(EXTENSION_LIST_FILE_EXT)) {
        openExtensionViewer(
          extensionService.parseExtensionsFromJson(document.getText()),
          css
        );
      }
    }),
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.openExtensionViewer`,
      () => {
        const currentDocument = vscode.window.activeTextEditor?.document;
        if (currentDocument?.fileName.endsWith(EXTENSION_LIST_FILE_EXT)) {
          openExtensionViewer(
            extensionService.parseExtensionsFromJson(currentDocument.getText()),
            css
          );
        } else {
          vscode.window.showErrorMessage(
            `Please open a file ending with '.${EXTENSION_LIST_FILE_EXT}' to use this command.`
          );
        }
      }
    ),
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.${extensionService.writeExtensionsToJson.name}`,
      async () => {
        try {
          const workspaceFolders = vscode.workspace.workspaceFolders;

          if (!workspaceFolders) {
            vscode.window.showErrorMessage(
              "No workspace is open. Please open a directory to use this command."
            );
            return;
          }

          const workspacePath = workspaceFolders[0].uri.fsPath;
          const fullPath = path.join(
            workspacePath,
            `extensions.${EXTENSION_LIST_FILE_EXT}`
          );
          await extensionService.writeExtensionsToJson(fullPath);
          const fileUri = vscode.Uri.file(fullPath);
          vscode.window.showInformationMessage(
            `Extensions written to 'extensions.${EXTENSION_LIST_FILE_EXT}'. Opening file...`
          );
          vscode.window.showTextDocument(fileUri, {
            viewColumn: vscode.ViewColumn.Beside,
          });
        } catch (e) {
          vscode.window.showErrorMessage(
            "Error writing file: " +
              (`message` in (e as Error) ? (e as Error).message : e)
          );
        }
      }
    ),
  ];

  context.subscriptions.push(...subs);
}

enum ExtensionViewerCommands {
  open = "openExtension",
  install = "installExtension",
}

function openExtensionViewer(extensions: Extension[], css: string) {
  const panel = vscode.window.createWebviewPanel(
    "ext-viewer",
    "Extensions Viewer",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
    }
  );
  panel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.command) {
        case ExtensionViewerCommands.install:
          vscode.commands.executeCommand(
            "workbench.extensions.installExtension",
            message.id
          );
          return;
        case ExtensionViewerCommands.open:
          vscode.commands.executeCommand("extension.open", message.id);
          return;
      }
    },
    undefined,
    []
  );

  panel.webview.html = `
  <!DOCTYPE html>
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
    <script>
      const vscode = acquireVsCodeApi();
      document.querySelectorAll(".extension__container").forEach((el) => {
        el.addEventListener("click", () => {
          vscode.postMessage({
            command: "${ExtensionViewerCommands.open}",
            id: el.id,
          });
        });
      });
      document.querySelectorAll(".extension__install").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          vscode.postMessage({
            command: "${ExtensionViewerCommands.install}",
            id: el.attributes["data-ext-id"].value,
          });
        });
      });
    </script>
  </html>`;
}

export function deactivate() {}
