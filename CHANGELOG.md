# Change Log

All notable changes to the "combine-for-ai" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.2.1] - 2025-12-29

### Changed
- **Smarter folder dialog**: The recursive folder prompt now only appears when folders are actually selected. When selecting only files, the extension skips the prompt and combines files directly for a faster workflow.

## [0.2.0] - 2025-12-15

### Added
- **Recursive folder processing**: When combining files, you can now choose to recursively include all files in subfolders
- **Source Control integration**: New command to combine files from Git source control
  - Accessible from Source Control panel toolbar
  - Accessible from Command Palette ("Combine for AI")
  - Multi-select picker allows you to choose which changed files to combine
  - Shows both staged and unstaged changes
  - All files pre-selected by default for convenience

### Changed
- Improved user experience with interactive prompts for folder processing
- Optimized file collection for better performance with large directories

## [0.1.1] - Previous Release

- Initial release with basic file combining functionality