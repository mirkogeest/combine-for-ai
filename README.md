# Combine for AI Extension

A powerful utility extension for Visual Studio Code and Cursor that quickly combines the content of multiple files into the clipboard for use with AI prompts.

## Features

### 🗂️ **Combine Files from Explorer**
- Select multiple files and/or folders in the File Explorer
- Right-click and choose "Combine for AI"
- Choose whether to process folders recursively or just direct files
- All file contents are copied to your clipboard, each preceded by its relative path

### 🔄 **Combine Source Control Changes**
- Combine changed files directly from Git source control
- Access from the Source Control panel toolbar or Command Palette
- Multi-select picker lets you choose which files to include
- See both staged and unstaged changes
- All files pre-selected by default for convenience

## Usage

### From Explorer:
1. Select one or more files or folders in the Explorer
2. Right-click on any selected item
3. Click "Combine for AI"
4. Choose recursive processing option if folders are selected
5. Paste the combined content into your AI prompt

### From Source Control:
1. Click the toolbar button in the Source Control panel, or
2. Open Command Palette (Ctrl/Cmd+Shift+P) and type "Combine for AI"
3. Select which changed files to include (or keep all selected)
4. Press Enter to combine
5. Paste the result into your AI prompt

## Output Format

Each file in the combined output is formatted as:

```
--- File: relative/path/to/file.ext ---

[file content here]

```

This format makes it easy for AI assistants to understand the structure and context of your codebase.

## Requirements

- Visual Studio Code 1.85.0 or higher
- For Source Control features: Git extension enabled (built-in with VS Code)

## Extension Settings

This extension doesn't require any configuration. Just install and use!

## Release Notes

### 0.2.0

- ✨ Added recursive folder processing with user choice
- ✨ Added Source Control integration to combine changed files
- ✨ Multi-select file picker for Source Control changes
- 🎨 Improved user experience with interactive prompts

### 0.1.1

- Initial release with basic file combining functionality

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/mirkogeest/combine-for-ai).

---

**Enjoy combining files for your AI prompts!** 🚀