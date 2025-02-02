import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { clearToken } from './commands/clearToken';
import { createWebviewPanel } from './commands/createWebViewPanel';
import { getToken } from './commands/getToken';
import { saveToken } from './commands/saveToken';

let client: LanguageClient;

async function startLSPServer(
  context: vscode.ExtensionContext,
  secretStorage: vscode.SecretStorage
) {
  const serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc },
  };

  const token = await secretStorage.get('apiToken');

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'plaintext' }],
    initializationOptions: { token },
  };

  client = new LanguageClient(
    'myLspServer',
    'My LSP Server',
    serverOptions,
    clientOptions
  );
  console.log('client', client);
}

async function updateToken(secretStorage: vscode.SecretStorage) {
  const newToken = await secretStorage.get('apiToken');
  if (client) {
    client.sendNotification('workspace/didChangeToken', { token: newToken });
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const secretStorage = context.secrets;

  const storedToken = await secretStorage.get('apiToken');
  if (storedToken) {
    vscode.window.showInformationMessage('Token chargé avec succès !');
  } else {
    vscode.window.showInformationMessage(
      'Aucun token trouvé, veuillez en entrer un.'
    );
  }

  await startLSPServer(context, secretStorage);
  const outputChannel = vscode.window.createOutputChannel('LSP Logs');
  outputChannel.appendLine('🔹 LSP Server: Client Starting...');
  client.start();
  console.log('client', client);
  outputChannel.appendLine('🔹 LSP Server: Client Started succesfully...');

  const webviewCommand = createWebviewPanel(client, context);
  const saveTokenCommand = saveToken(secretStorage);
  const getTokenCommand = getToken(secretStorage);
  const clearTokenCommand = clearToken(secretStorage);

  context.subscriptions.push(
    webviewCommand,
    saveTokenCommand,
    getTokenCommand,
    clearTokenCommand
  );
}

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
