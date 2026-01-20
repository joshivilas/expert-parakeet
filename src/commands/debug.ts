import * as vscode from 'vscode';
import * as path from 'path';
import { compileRustFile, getDebuggerType, getDebuggerMIMode } from '../utils/rustc';
import { getConfig } from '../utils/config';
import { StatusBarManager } from '../statusBar';
import { DiagnosticsManager } from '../utils/diagnostics';

export async function debugCommand(
    statusBar: StatusBarManager,
    diagnostics: DiagnosticsManager
): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No active editor. Please open a Rust file.');
        return;
    }
    
    const document = editor.document;
    
    if (document.languageId !== 'rust') {
        vscode.window.showErrorMessage('Current file is not a Rust file.');
        return;
    }
    
    // Check for C/C++ extension (required for debugging)
    const cppExtension = vscode.extensions.getExtension('ms-vscode.cpptools');
    if (!cppExtension) {
        const action = await vscode.window.showErrorMessage(
            'C/C++ extension is required for debugging Rust programs.',
            'Install Extension',
            'Cancel'
        );
        
        if (action === 'Install Extension') {
            await vscode.commands.executeCommand(
                'workbench.extensions.installExtension',
                'ms-vscode.cpptools'
            );
        }
        return;
    }
    
    const config = getConfig();
    
    // Save file if configured
    if (config.saveBeforeRun && document.isDirty) {
        await document.save();
    }
    
    const filePath = document.uri.fsPath;
    const fileName = path.basename(filePath);
    
    diagnostics.clearOutput();
    diagnostics.log(`Building for debug: ${fileName}`);
    diagnostics.showOutput();
    
    statusBar.updateStatus('running', 'Building debug...');
    
    try {
        // Compile with debug symbols
        const result = await compileRustFile(filePath, { debug: true });
        
        if (!result.success) {
            statusBar.updateStatus('error', 'Build failed');
            diagnostics.log('Compilation failed:');
            diagnostics.appendOutput(result.output);
            diagnostics.updateDiagnostics(document.uri, result.errors, result.warnings);
            
            if (result.errors.length > 0) {
                vscode.window.showErrorMessage(
                    `Compilation error: ${result.errors[0].message}`
                );
            }
            return;
        }
        
        // Update diagnostics with warnings
        diagnostics.updateDiagnostics(document.uri, [], result.warnings);
        
        diagnostics.log('Debug build successful');
        statusBar.updateStatus('success', 'Starting debugger...');
        
        if (!result.executablePath) {
            vscode.window.showErrorMessage('No executable path available');
            return;
        }
        
        // Create debug configuration
        const debugConfig = createDebugConfiguration(
            result.executablePath,
            path.dirname(filePath),
            config.commandLineArguments
        );
        
        diagnostics.log(`Starting debugger for: ${result.executablePath}`);
        
        // Start debugging
        const debugStarted = await vscode.debug.startDebugging(undefined, debugConfig);
        
        if (debugStarted) {
            statusBar.updateStatus('success', 'Debugging');
        } else {
            statusBar.updateStatus('error', 'Debug failed to start');
            vscode.window.showErrorMessage('Failed to start debugger');
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        statusBar.updateStatus('error', 'Error');
        diagnostics.log(`Error: ${errorMessage}`);
        vscode.window.showErrorMessage(`Failed to debug: ${errorMessage}`);
    }
}

function createDebugConfiguration(
    executablePath: string,
    cwd: string,
    args: string
): vscode.DebugConfiguration {
    const debuggerType = getDebuggerType();
    const miMode = getDebuggerMIMode();
    
    const config: vscode.DebugConfiguration = {
        type: debuggerType,
        request: 'launch',
        name: 'Rust Quick Run Debug',
        program: executablePath,
        args: args ? args.split(/\s+/) : [],
        cwd: cwd,
        console: 'integratedTerminal',
        stopAtEntry: false,
    };
    
    // Add platform-specific settings
    if (miMode) {
        config.MIMode = miMode;
    }
    
    // For Linux/macOS, specify the debugger path if needed
    if (process.platform === 'linux') {
        config.miDebuggerPath = '/usr/bin/gdb';
    } else if (process.platform === 'darwin') {
        config.miDebuggerPath = '/usr/bin/lldb';
    }
    
    return config;
}
