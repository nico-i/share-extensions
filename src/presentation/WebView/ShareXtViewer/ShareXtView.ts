import * as vscode from "vscode";

export class ShareXtView {
  _html: string;
  readonly title = "ShareXt Viewer";
  readonly viewType = "sharext";
  readonly viewColumn = vscode.ViewColumn.Beside;

  constructor(shareXtJSONDocument: vscode.TextDocument) {
    this._html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Sharex File</title>
        </head>
        <body>
            <h1>Content of the .sharex file:</h1>
            <pre>${shareXtJSONDocument.getText()}</pre>
        </body>
        </html>`;
  }

  get html(): string {
    return this._html;
  }
}
