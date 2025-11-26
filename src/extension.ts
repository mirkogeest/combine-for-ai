import * as vscode from 'vscode';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('combine-for-ai.combine', async (clickedUri: vscode.Uri, selectedUris: vscode.Uri[]) => {
    
    // When called from a context menu, VS Code passes the URI you clicked
    // and an array of all selected URIs. We only need the second argument.
    if (!selectedUris || selectedUris.length === 0) {
      vscode.window.showWarningMessage('No files selected.');
      return;
    }

    let combinedContent = '';
    const fileCount = selectedUris.length;

    // Await all file reading operations concurrently for better performance
    const fileProcessingPromises = selectedUris.map(async (uri) => {
      try {
        const relativePath = vscode.workspace.asRelativePath(uri, false);
        const fileContentBytes = await vscode.workspace.fs.readFile(uri);
        const fileContent = Buffer.from(fileContentBytes).toString('utf8');
        
        // Format the output for each file
        return `--- File: ${relativePath} ---\n\n${fileContent}\n\n`;

      } catch (error) {
        vscode.window.showErrorMessage(`Error reading file ${uri.fsPath}: ${error}`);
        return null; // Return null for failed files
      }
    });

    const results = await Promise.all(fileProcessingPromises);
    
    // Filter out any null results from read errors and join the content
    combinedContent = results.filter(content => content !== null).join('');

    if (combinedContent) {
      // Write the final string to the clipboard
      await vscode.env.clipboard.writeText(combinedContent.trim());
      vscode.window.showInformationMessage(`✅ Combined ${fileCount} file(s) for AI. Copied to clipboard!`);
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}