import path from "path";
import * as vscode from "vscode";
import { ExtensionService } from "./domain/services";
import { MarketplaceRepo } from "./domain/valueobjects/Extension/repositories/MarketPlaceRepo";
import { ExtensionViewer } from "./presentation/ExtensionViewer";
import { css, EXTENSION_LIST_FILE_EXT, EXTENSION_NAME } from "./utils/consts";

export function activate(context: vscode.ExtensionContext) {
  // Initialize Repos and Services
  const marketplaceRepo = new MarketplaceRepo();
  const extensionService = new ExtensionService(marketplaceRepo);

  // Initialize ExtensionViewer
  ExtensionViewer.init(extensionService, css);

  let activeEditor = vscode.window.activeTextEditor;
  // Open ExtensionViewer if first file opened is an extensions JSON file
  if (activeEditor?.document.fileName.endsWith(EXTENSION_LIST_FILE_EXT)) {
    ExtensionViewer.getInstance().rerender(activeEditor.document.uri);
  }

  const rerenderOnExtsUpdate = vscode.extensions.onDidChange(() => {
    const viewer = ExtensionViewer.getInstance();
    if (viewer.isOpen) {
      vscode.window.showInformationMessage(
        "Extensions changed. Updating Extensions Viewer."
      );
      viewer.rerender();
    }
  });
  context.subscriptions.push(rerenderOnExtsUpdate);

  const rerenderOnJsonChange = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const document = event.document;
      if (document.uri.fsPath.endsWith(EXTENSION_LIST_FILE_EXT)) {
        ExtensionViewer.getInstance().rerender();
      }
    }
  );
  context.subscriptions.push(rerenderOnJsonChange);

  const rerenderOnFocusChange = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor?.document.fileName.endsWith(EXTENSION_LIST_FILE_EXT)) {
        ExtensionViewer.getInstance().rerender(editor.document.uri);
      }
    }
  );
  context.subscriptions.push(rerenderOnFocusChange);

  const rerenderOnJsonOpen = vscode.workspace.onDidOpenTextDocument(
    (document) => {
      if (document.uri.fsPath.endsWith(EXTENSION_LIST_FILE_EXT)) {
        ExtensionViewer.getInstance().rerender(document.uri);
      }
    }
  );
  context.subscriptions.push(rerenderOnJsonOpen);

  const closeOnJsonClose = vscode.workspace.onDidCloseTextDocument(
    (document) => {
      if (document.uri.fsPath.endsWith(EXTENSION_LIST_FILE_EXT)) {
        const viewer = ExtensionViewer.getInstance();
        if (viewer.sourceFile === document.uri) {
          ExtensionViewer.getInstance().close();
        }
      }
    }
  );
  context.subscriptions.push(closeOnJsonClose);

  const openViewer = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.openExtensionViewer`,
    () => {
      const currentDocument = vscode.window.activeTextEditor?.document;
      if (currentDocument?.fileName.endsWith(EXTENSION_LIST_FILE_EXT)) {
        ExtensionViewer.getInstance().rerender(currentDocument.uri);
      } else {
        vscode.window.showErrorMessage(
          `Please open a file ending with '.${EXTENSION_LIST_FILE_EXT}' to use this command.`
        );
      }
    }
  );
  context.subscriptions.push(openViewer);

  const writeExtensionsToJson = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.writeExtensionsToJson`,
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
          `Extensions list written to '${fileUri.fsPath}'`
        );
        const document = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(
          document,
          vscode.ViewColumn.One,
          false
        );

        vscode.commands.executeCommand(`${EXTENSION_NAME}.openExtensionViewer`);
      } catch (e) {
        vscode.window.showErrorMessage(
          "Error writing file: " +
            (`message` in (e as Error) ? (e as Error).message : e)
        );
      }
    }
  );
  context.subscriptions.push(writeExtensionsToJson);
}

export function deactivate() {}
