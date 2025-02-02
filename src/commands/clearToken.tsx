import * as vscode from 'vscode';

// Commande pour supprimer le token
export const clearToken = (secretStorage: vscode.SecretStorage) => {
  let clearTokenCommand = vscode.commands.registerCommand(
    'NotionVsCode.clearToken',
    async () => {
      await secretStorage.delete('apiToken');
      vscode.window.showInformationMessage('Token supprimé.');
    }
  );
  return clearTokenCommand;
};
