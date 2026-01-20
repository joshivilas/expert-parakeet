import * as vscode from 'vscode';
import * as path from 'path';
import { compileRustFile } from '../utils/rustc';
import { getConfig } from '../utils/config';
import { StatusBarManager } from '../statusBar';
import { DiagnosticsManager } from '../utils/diagnostics';

export async function checkSyntaxCommand(
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
    diagnostics.log(`Checking syntax: ${fileName}`);
    diagnostics.showOutput();
    
    statusBar.updateStatus('running', 'Checking...');
    
    try {
        // Run syntax check only
        const result = await compileRustFile(filePath, { checkOnly: true });
        
        // Update diagnostics
        diagnostics.updateDiagnostics(document.uri, result.errors, result.warnings);
        
        if (!result.success) {
            statusBar.updateStatus('error', 'Errors found');
            diagnostics.log('Syntax check failed:');
            diagnostics.appendOutput(result.output);
            
            vscode.window.showErrorMessage(
                `Found ${result.errors.length} error(s) and ${result.warnings.length} warning(s)`
            );
        } else if (result.warnings.length > 0) {
            statusBar.updateStatus('success', `${result.warnings.length} warning(s)`);
            diagnostics.log(`Syntax check passed with ${result.warnings.length} warning(s)`);
            
            vscode.window.showWarningMessage(
                `Syntax OK with ${result.warnings.length} warning(s)`
            );
        } else {
            statusBar.updateStatus('success', 'No errors');
            diagnostics.log('Syntax check passed - no errors or warnings');
            
            vscode.window.showInformationMessage('Syntax check passed - no errors!');
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        statusBar.updateStatus('error', 'Error');
        diagnostics.log(`Error: ${errorMessage}`);
        vscode.window.showErrorMessage(`Failed to check syntax: ${errorMessage}`);
    }
}
