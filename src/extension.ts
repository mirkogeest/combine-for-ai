import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

  // Command to combine selected files/folders
  const disposable = vscode.commands.registerCommand('combine-for-ai.combine', async (clickedUri: vscode.Uri, selectedUris: vscode.Uri[]) => {

    // When called from a context menu, VS Code passes the URI you clicked
    // and an array of all selected URIs. We only need the second argument.
    if (!selectedUris || selectedUris.length === 0) {
      vscode.window.showWarningMessage('No files selected.');
      return;
    }

    // Ask user if they want recursive processing
    const recursive = await vscode.window.showQuickPick(
      ['No - Only files', 'Yes - Include subfolders'],
      { placeHolder: 'Process folders recursively?' }
    );

    if (!recursive) {
      return; // User cancelled
    }

    const shouldRecurse = recursive.startsWith('Yes');

    // Collect all files from selected URIs (expanding folders)
    const allFiles = await collectFiles(selectedUris, shouldRecurse);

    if (allFiles.length === 0) {
      vscode.window.showWarningMessage('No files found to combine.');
      return;
    }

    await combineFiles(allFiles);
  });

  // Command to combine files from source control
  const scmDisposable = vscode.commands.registerCommand('combine-for-ai.combineSourceControl', async () => {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;

    if (!gitExtension) {
      vscode.window.showErrorMessage('Git extension not found. Please ensure Git is enabled in VS Code.');
      return;
    }

    const api = gitExtension.getAPI(1);

    if (api.repositories.length === 0) {
      vscode.window.showWarningMessage('No Git repository found in workspace.');
      return;
    }

    // Use the first repository (or let user choose if multiple)
    const repo = api.repositories[0];

    // Get changed files from the repository
    const changes = repo.state.workingTreeChanges || [];
    const staged = repo.state.indexChanges || [];

    if (changes.length === 0 && staged.length === 0) {
      vscode.window.showInformationMessage('No changed files in source control.');
      return;
    }

    // Build list of all available files with their status
    const fileItems: Array<{ label: string; description: string; uri: vscode.Uri; picked: boolean }> = [];

    changes.forEach((change: any) => {
      const relativePath = vscode.workspace.asRelativePath(change.uri, false);
      fileItems.push({
        label: relativePath,
        description: '(unstaged)',
        uri: change.uri,
        picked: true
      });
    });

    staged.forEach((change: any) => {
      const relativePath = vscode.workspace.asRelativePath(change.uri, false);
      // Check if already added from working tree changes
      if (!fileItems.find(item => item.uri.toString() === change.uri.toString())) {
        fileItems.push({
          label: relativePath,
          description: '(staged)',
          uri: change.uri,
          picked: true
        });
      }
    });

    // Let user select which files to combine
    const selectedItems = await vscode.window.showQuickPick(fileItems, {
      canPickMany: true,
      placeHolder: 'Select files to combine (all selected by default)',
      title: 'Source Control Files'
    });

    if (!selectedItems || selectedItems.length === 0) {
      return; // User cancelled or selected nothing
    }

    const filesToCombine = selectedItems.map(item => item.uri);
    await combineFiles(filesToCombine);
  });

  context.subscriptions.push(disposable, scmDisposable);
}

/**
 * Recursively collect all files from the given URIs
 */
async function collectFiles(uris: vscode.Uri[], recursive: boolean): Promise<vscode.Uri[]> {
  const files: vscode.Uri[] = [];

  for (const uri of uris) {
    try {
      const stat = await vscode.workspace.fs.stat(uri);

      if (stat.type === vscode.FileType.File) {
        files.push(uri);
      } else if (stat.type === vscode.FileType.Directory) {
        if (recursive) {
          // Recursively get all files in the directory
          const dirFiles = await getAllFilesInDirectory(uri);
          files.push(...dirFiles);
        } else {
          // Only get direct children
          const entries = await vscode.workspace.fs.readDirectory(uri);
          for (const [name, type] of entries) {
            if (type === vscode.FileType.File) {
              files.push(vscode.Uri.joinPath(uri, name));
            }
          }
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error accessing ${uri.fsPath}: ${error}`);
    }
  }

  return files;
}

/**
 * Recursively get all files in a directory
 */
async function getAllFilesInDirectory(dirUri: vscode.Uri): Promise<vscode.Uri[]> {
  const files: vscode.Uri[] = [];

  try {
    const entries = await vscode.workspace.fs.readDirectory(dirUri);

    for (const [name, type] of entries) {
      const fullPath = vscode.Uri.joinPath(dirUri, name);

      if (type === vscode.FileType.File) {
        files.push(fullPath);
      } else if (type === vscode.FileType.Directory) {
        // Recursively process subdirectories
        const subFiles = await getAllFilesInDirectory(fullPath);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error reading directory ${dirUri.fsPath}: ${error}`);
  }

  return files;
}

/**
 * Combine the given files and copy to clipboard
 */
async function combineFiles(fileUris: vscode.Uri[]): Promise<void> {
  let combinedContent = '';
  const fileCount = fileUris.length;

  // Await all file reading operations concurrently for better performance
  const fileProcessingPromises = fileUris.map(async (uri) => {
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
}

// This method is called when your extension is deactivated
export function deactivate() { }