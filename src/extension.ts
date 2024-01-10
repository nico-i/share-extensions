import * as vscode from "vscode";
import { ExportService } from "./domain/services/ExportService";
import { ShareXtView } from "./presentation";
import { EXTENSION_NAME, SHARE_XT_EXTENSION } from "./util/consts";

export function activate(context: vscode.ExtensionContext) {
  const exportService = new ExportService();

  const extSubscriptions = [
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.${exportService.writeExtensionsToJson.name}`,
      () => {
        try {
          exportService.writeExtensionsToJson(
            vscode.extensions.all,
            "extensions.sharext.json"
          );
        } catch (e) {
          vscode.window.showErrorMessage(
            "Error writing file: " +
              (`message` in (e as Error) ? (e as Error).message : e)
          );
        }
        vscode.window.showInformationMessage("Extensions list saved!");
      }
    ),
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (document.uri.fsPath.endsWith(SHARE_XT_EXTENSION)) {
        const shareXtView = new ShareXtView(document);

        const panel = vscode.window.createWebviewPanel(
          shareXtView.viewType,
          shareXtView.title,
          shareXtView.viewColumn,
          {}
        );
        panel.webview.html = shareXtView.html;
      }
	  
    }),
  ];

  context.subscriptions.push(...extSubscriptions);
}

export function deactivate() {}
