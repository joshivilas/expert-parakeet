import * as vscode from 'vscode';
import * as path from 'path';
import { compileRustFile } from '../utils/rustc';
import { runInTerminal } from '../utils/terminal';
import { getConfig } from '../utils/config';
import { StatusBarManager } from '../statusBar';
import { DiagnosticsManager } from '../utils/diagnostics';

export async function runCommand(
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
    
    const config = getConfig();
    
    // Save file if configured
    if (config.saveBeforeRun && document.isDirty) {
        await document.save();
    }
    
    const filePath = document.uri.fsPath;
    const fileName = path.basename(filePath);
    
    diagnostics.clearOutput();
    diagnostics.log(`Running: ${fileName}`);
    diagnostics.showOutput();
    
    statusBar.updateStatus('running', 'Compiling...');
    
    try {
        // Compile the file
        const result = await compileRustFile(filePath, { debug: false });
        
        if (!result.success) {
            statusBar.updateStatus('error', 'Compilation failed');
            diagnostics.log('Compilation failed:');
            diagnostics.appendOutput(result.output);
            diagnostics.updateDiagnostics(document.uri, result.errors, result.warnings);
            
            // Show first error
            if (result.errors.length > 0) {
                vscode.window.showErrorMessage(
                    `Compilation error: ${result.errors[0].message}`
                );
            }
            return;
        }
        
        // Update diagnostics with warnings
        diagnostics.updateDiagnostics(document.uri, [], result.warnings);
        
        if (result.warnings.length > 0) {
            diagnostics.log(`Compiled with ${result.warnings.length} warning(s)`);
        } else {
            diagnostics.log('Compilation successful');
        }
        
        // Run the executable
        if (result.executablePath) {
            statusBar.updateStatus('running', 'Running...');
            diagnostics.log(`Executing: ${result.executablePath}`);
            
            // Build command with arguments
            // Use & operator for PowerShell to execute quoted paths
            let command: string;
            if (process.platform === 'win32') {
                command = `& "${result.executablePath}"`;
            } else {
                command = `"${result.executablePath}"`;
            }
            if (config.commandLineArguments) {
                command += ` ${config.commandLineArguments}`;
            }
            
            runInTerminal(command, path.dirname(filePath));
            statusBar.updateStatus('success', 'Running');
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        statusBar.updateStatus('error', 'Error');
        diagnostics.log(`Error: ${errorMessage}`);
        vscode.window.showErrorMessage(`Failed to run: ${errorMessage}`);
    }
}
