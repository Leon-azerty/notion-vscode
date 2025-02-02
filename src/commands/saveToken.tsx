import * as vscode from 'vscode';

// Commande pour sauvegarder un token
export const saveToken = (secretStorage: vscode.SecretStorage) => {
  let saveTokenCommand = vscode.commands.registerCommand(
    'NotionVsCode.saveToken',
    async () => {
      const token = await vscode.window.showInputBox({
        prompt: 'Entrez votre token API',
        password: true,
      });
      if (token) {
        await secretStorage.store('apiToken', token);
        vscode.window.showInformationMessage('Token sauvegardé !');
      }
    }
  );
  return saveTokenCommand;
};
