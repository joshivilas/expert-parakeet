# Rust Quick Run

Quickly compile, run, and debug individual Rust (.rs) files without needing Cargo or complex project setup. Perfect for beginners, quick prototyping, and learning Rust!

![Rust Quick Run Demo](images/demo.gif)

## Features

### 🚀 Quick Run
Compile and run your Rust file with a single command or keyboard shortcut.

### 🐛 Integrated Debugging
Debug your Rust programs with breakpoints, variable inspection, and step-through execution.

### 📝 Syntax Checking
Check your code for errors without compiling the full executable.

### 🎯 CodeLens Integration
Click "▶ Run" or "🐛 Debug" directly above your `main()` function.

### 📊 Status Bar
See your Rust version and quick access buttons right in the status bar.

### 🔧 Problems Panel Integration
Compiler errors and warnings appear in VS Code's Problems panel with clickable locations.

## Requirements

- **Rust compiler (rustc)** - Install from [rustup.rs](https://rustup.rs)
- **C/C++ Extension** (optional) - Required for debugging support

## Installation

1. Install the extension from VS Code Marketplace
2. Make sure `rustc` is in your PATH
3. Open any `.rs` file and start coding!

## Usage

### Commands

| Command | Keybinding | Description |
|---------|------------|-------------|
| Rust Quick Run: Run File | `Ctrl+Shift+R` | Compile and run the current file |
| Rust Quick Run: Debug File | `F5` | Compile with debug symbols and launch debugger |
| Rust Quick Run: Build File | `Ctrl+Shift+B` | Compile only, create executable |
| Rust Quick Run: Check Syntax | - | Check for errors without full compilation |
| Rust Quick Run: Clean | - | Remove compiled files |
| Rust Quick Run: Set Arguments | - | Set command line arguments |

### Context Menu

Right-click on any `.rs` file in the editor or explorer to access:
- Run Rust File
- Debug Rust File  
- Build Rust File

### CodeLens

When you have a `fn main()` in your file, you'll see clickable links above it:
```rust
▶ Run | 🐛 Debug | 🔨 Build
fn main() {
    println!("Hello, world!");
}
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `rustQuickRun.outputDirectory` | System temp | Directory for compiled executables |
| `rustQuickRun.optimizationLevel` | `0` | Optimization level (0, 1, 2, 3, s, z) |
| `rustQuickRun.showWarnings` | `true` | Show compiler warnings |
| `rustQuickRun.clearTerminalBeforeRun` | `true` | Clear terminal before running |
| `rustQuickRun.saveBeforeRun` | `true` | Auto-save before compiling |
| `rustQuickRun.showCodeLens` | `true` | Show Run/Debug above main() |
| `rustQuickRun.commandLineArguments` | `""` | Arguments to pass to your program |

## Examples

### Hello World
```rust
fn main() {
    println!("Hello, World!");
}
```
Press `Ctrl+Shift+R` to run!

### With Arguments
```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("Arguments: {:?}", args);
}
```
Use "Set Arguments" command to pass arguments to your program.

### Interactive Input
```rust
use std::io;

fn main() {
    println!("What's your name?");
    let mut name = String::new();
    io::stdin().read_line(&mut name).unwrap();
    println!("Hello, {}!", name.trim());
}
```
The integrated terminal handles input/output naturally.

## Debugging

1. Set breakpoints by clicking in the gutter
2. Press `F5` or use "Debug File" command
3. Use the debug toolbar to step through code
4. Inspect variables in the Debug sidebar

**Note:** Debugging requires the C/C++ extension for Windows (cppvsdbg) or GDB/LLDB for Linux/macOS.

## Troubleshooting

### "Rust compiler not found"
Make sure `rustc` is installed and in your PATH:
```bash
rustc --version
```
If not installed, visit [rustup.rs](https://rustup.rs).

### "Debugging not working"
1. Install the C/C++ extension (`ms-vscode.cpptools`)
2. On Linux, ensure GDB is installed: `sudo apt install gdb`
3. On macOS, ensure LLDB is available (comes with Xcode)

### "Permission denied" on Linux/macOS
Make sure the output directory is writable:
```bash
chmod 755 /tmp/rust-quick-run
```

## Platform Support

| Platform | Run | Debug |
|----------|-----|-------|
| Windows | ✅ | ✅ (cppvsdbg) |
| macOS | ✅ | ✅ (lldb) |
| Linux | ✅ | ✅ (gdb) |

## Contributing

Contributions are welcome! Please visit our [GitHub repository](https://github.com/your-username/rust-quick-run).

## License

MIT License - see [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Enjoy quick Rust development!** 🦀
