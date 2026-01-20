import * as vscode from 'vscode';
import { cleanOutputDirectory } from '../utils/rustc';
import { getOutputDirectory } from '../utils/config';
import { StatusBarManager } from '../statusBar';

export async function cleanCommand(statusBar: StatusBarManager): Promise<void> {
    const outputDir = getOutputDirectory();
    
    const confirm = await vscode.window.showWarningMessage(
        `Delete all compiled files in ${outputDir}?`,
        'Yes',
        'No'
    );
    
    if (confirm !== 'Yes') {
        return;
    }
    
    statusBar.updateStatus('running', 'Cleaning...');
    
    try {
        await cleanOutputDirectory();
        
        statusBar.updateStatus('success', 'Cleaned');
        vscode.window.showInformationMessage('Rust Quick Run: Cleaned output directory');
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        statusBar.updateStatus('error', 'Clean failed');
        vscode.window.showErrorMessage(`Failed to clean: ${errorMessage}`);
    }
}
