import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

// Commande pour ouvrir la WebView
export const createWebviewPanel = (
  client: LanguageClient,
  context: vscode.ExtensionContext
) => {
  let webviewCommand = vscode.commands.registerCommand(
    'NotionVsCode.openPanel',
    () => {
      const panel = vscode.window.createWebviewPanel(
        'webview',
        'React',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      // Chargement du script et CSS de la WebView
      let scriptSrc = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'web', 'dist', 'index.js')
      );

      let cssSrc = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'web', 'dist', 'index.css')
      );

      panel.webview.html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <link rel="stylesheet" href="${cssSrc}" />
        </head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
          <script src="${scriptSrc}"></script>
        </body>
      </html>`;

      // Communication avec la WebView
      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'RetrieveBlock') {
          console.log('message', message);
          const token = await context.secrets.get('apiToken');
          const response = await client.sendRequest('custom/RetrieveBlock', {
            token: token,
            blockId: message.blockId,
          });
          panel.webview.postMessage({ response });
        } else if (message.command === 'GetNotionPageId') {
          console.log('GetNotionPageId, message : ', message);
          const response = await client.sendRequest('custom/GetNotionPageId', {
            query: message.query,
          });
          console.log('response from server', response);
          panel.webview.postMessage({
            response,
            type: 'NotionPagesName',
          });
        }
      });
    }
  );
  return webviewCommand;
};
