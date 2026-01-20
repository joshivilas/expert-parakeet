import * as vscode from 'vscode';
import * as path from 'path';
import { compileRustFile } from '../utils/rustc';
import { getConfig } from '../utils/config';
import { StatusBarManager } from '../statusBar';
import { DiagnosticsManager } from '../utils/diagnostics';

export async function buildCommand(
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
    diagnostics.log(`Building: ${fileName}`);
    diagnostics.showOutput();
    
    statusBar.updateStatus('running', 'Building...');
    
    try {
        // Compile the file with optimization
        const result = await compileRustFile(filePath, { optimize: true });
        
        if (!result.success) {
            statusBar.updateStatus('error', 'Build failed');
            diagnostics.log('Build failed:');
            diagnostics.appendOutput(result.output);
            diagnostics.updateDiagnostics(document.uri, result.errors, result.warnings);
            
            if (result.errors.length > 0) {
                vscode.window.showErrorMessage(
                    `Build error: ${result.errors[0].message}`
                );
            }
            return;
        }
        
        // Update diagnostics with warnings
        diagnostics.updateDiagnostics(document.uri, [], result.warnings);
        
        const warningText = result.warnings.length > 0 
            ? ` with ${result.warnings.length} warning(s)` 
            : '';
        
        diagnostics.log(`Build successful${warningText}`);
        
        if (result.executablePath) {
            diagnostics.log(`Output: ${result.executablePath}`);
            
            statusBar.updateStatus('success', 'Build complete');
            
            // Show success message with option to open folder
            const action = await vscode.window.showInformationMessage(
                `Build successful: ${path.basename(result.executablePath)}`,
                'Open Folder',
                'Copy Path'
            );
            
            if (action === 'Open Folder') {
                const folderUri = vscode.Uri.file(path.dirname(result.executablePath));
                await vscode.env.openExternal(folderUri);
            } else if (action === 'Copy Path') {
                await vscode.env.clipboard.writeText(result.executablePath);
                vscode.window.showInformationMessage('Path copied to clipboard');
            }
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        statusBar.updateStatus('error', 'Error');
        diagnostics.log(`Error: ${errorMessage}`);
        vscode.window.showErrorMessage(`Failed to build: ${errorMessage}`);
    }
}
