import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

// Commande pour ouvrir la WebView
export const createWebviewPanel = (
  client: LanguageClient,
  context: vscode.ExtensionContext
) => {
  let webviewCommand = vscode.commands.registerCommand(
    'NotionVsCode.openPanel',
    async () => {
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
        switch (message.command) {
          case 'init':
            const pages = await context.secrets.get('pages');
            console.log('pages du secrets', pages);
            if (pages) {
              console.log('pages, already fetched', pages);
              panel.webview.postMessage({
                response: JSON.parse(pages),
                type: 'NotionPagesName',
              });
            } else {
              console.log('pages, fetching');
              const response = (await client.sendRequest(
                'custom/GetNotionPageId'
              )) as Array<string>;
              console.log('response from server', response);
              await context.secrets.store('pages', JSON.stringify(response));
              console.log('send postMessafge to webview');
              panel.webview.postMessage({
                response,
                type: 'NotionPagesName',
              });
            }
            break;
          case 'RetrieveBlock':
            console.log('message', message);
            const token = await context.secrets.get('apiToken');
            const blocks = await client.sendRequest('custom/RetrieveBlock', {
              token: token,
              blockId: message.blockId,
            });
            panel.webview.postMessage({ response: blocks });
            break;
          case 'GetNotionPageId':
            console.log('GetNotionPageId, message : ', message);
            const pageId = (await client.sendRequest('custom/GetNotionPageId', {
              query: message.query,
            })) as Array<string>;
            console.log('response from server', pageId);
            await context.secrets.store('pages', JSON.stringify(pageId));
            panel.webview.postMessage({
              response: pageId,
              type: 'NotionPagesName',
            });
            break;
        }
      });
    }
  );
  return webviewCommand;
};
