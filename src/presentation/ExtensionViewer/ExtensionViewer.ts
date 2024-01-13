import path from "path";
import * as vscode from "vscode";
import { ExtensionService } from "../../domain/services/ExtensionService";

enum ExtensionViewerCommands {
  open = "openExtension",
  install = "installExtension",
}

export class ExtensionViewer {
  private static instance: ExtensionViewer | null = null;

  private readonly _extensionService: ExtensionService;
  private readonly _css: string;
  private readonly _viewColumn = vscode.ViewColumn.Beside;

  private _panel: vscode.WebviewPanel | undefined;
  private _sourceFile: vscode.Uri | undefined;
  private _isOpen = false;

  static init(extensionService: ExtensionService, css: string) {
    ExtensionViewer.instance = new ExtensionViewer(extensionService, css);
  }

  static getInstance(): ExtensionViewer {
    if (!ExtensionViewer.instance) {
      throw new Error("ExtensionViewer not initialized");
    }
    return ExtensionViewer.instance;
  }

  private constructor(extensionService: ExtensionService, css: string) {
    this._css = css;
    this._extensionService = extensionService;
  }

  private open() {
    this._panel = vscode.window.createWebviewPanel(
      "ext-viewer",
      `Extensions Viewer`,
      {
        viewColumn: this._viewColumn,
        preserveFocus: true,
      },
      {
        enableScripts: true,
      }
    );

    this._panel.webview.onDidReceiveMessage(
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

    this._panel.onDidDispose(() => {
      this._isOpen = false;
    });

    this._isOpen = true;
  }

  public close() {
    if (this._panel) {
      this._panel.dispose();
      this._isOpen = false;
    }
  }

  public async rerender(newSourceFile?: vscode.Uri) {
    if (newSourceFile && newSourceFile !== this._sourceFile) {
      this._sourceFile = newSourceFile;
    }

    if (!this._sourceFile) {
      throw new Error("Source file not set");
    }

    if (!this._isOpen) {
      this.open();
    }

    if (!this._panel) {
      throw new Error("Panel not set");
    }

    const extensions = await this._extensionService.parseExtensionsFromJson(
      this._sourceFile
    );
    const fileName = path.basename(this._sourceFile.fsPath).split(".")[0];
    this._panel.title = `Extensions Viewer | ${fileName}`;

    this._panel.webview.html = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ShareXt Viewer</title>
            <style>
                ${this._css}
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

    this._panel.reveal(this._viewColumn, true);
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  get sourceFile(): vscode.Uri | undefined {
    return this._sourceFile;
  }
}
