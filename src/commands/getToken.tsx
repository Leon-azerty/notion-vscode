import * as vscode from 'vscode';

// Commande pour récupérer et afficher le token (démo, à éviter en prod)
export const getToken = (secretStorage: vscode.SecretStorage) => {
  let getTokenCommand = vscode.commands.registerCommand(
    'NotionVsCode.getToken',
    async () => {
      const token = await secretStorage.get('apiToken');
      if (token) {
        vscode.window.showInformationMessage(`Votre token: ${token}`);
      } else {
        vscode.window.showWarningMessage('Aucun token stocké.');
      }
    }
  );
  return getTokenCommand;
};
