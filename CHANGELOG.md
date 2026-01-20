# Changelog

All notable changes to the "Rust Quick Run" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### Added
- Initial release of Rust Quick Run
- **Run File** command (`Ctrl+Shift+R`) - Compile and run current .rs file
- **Debug File** command (`F5`) - Compile with debug symbols and launch debugger
- **Build File** command (`Ctrl+Shift+B`) - Compile only, create executable
- **Check Syntax** command - Run syntax check without full compilation
- **Clean** command - Remove compiled files from output directory
- **Set Arguments** command - Configure command line arguments

### Features
- Status bar integration showing Rust version and quick action buttons
- CodeLens support with Run/Debug/Build links above `fn main()`
- Context menu integration for .rs files in editor and explorer
- Problems panel integration for compiler errors and warnings
- Cross-platform debugging support (Windows/macOS/Linux)
- Configurable output directory and optimization levels
- Auto-save before compilation option
- Terminal output with optional auto-clear

### Configuration Options
- `rustQuickRun.outputDirectory` - Custom output directory
- `rustQuickRun.optimizationLevel` - Compiler optimization level
- `rustQuickRun.showWarnings` - Toggle warning display
- `rustQuickRun.clearTerminalBeforeRun` - Clear terminal before each run
- `rustQuickRun.saveBeforeRun` - Auto-save before compilation
- `rustQuickRun.showCodeLens` - Toggle CodeLens display
- `rustQuickRun.commandLineArguments` - Program arguments

## [Unreleased]

### Planned
- Multiple file support (basic module compilation)
- Run history with quick access
- Custom rustc flags configuration
- Integration with rust-analyzer diagnostics
- Test runner integration
