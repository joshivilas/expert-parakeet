import * as vscode from 'vscode';
import { getConfig, updateCommandLineArguments } from '../utils/config';

export async function setArgumentsCommand(): Promise<void> {
    const config = getConfig();
    
    const args = await vscode.window.showInputBox({
        prompt: 'Enter command line arguments for your Rust program',
        placeHolder: 'arg1 arg2 --flag value',
        value: config.commandLineArguments,
        title: 'Rust Quick Run: Set Arguments',
    });
    
    if (args !== undefined) {
        await updateCommandLineArguments(args);
        
        if (args.trim() === '') {
            vscode.window.showInformationMessage('Command line arguments cleared');
        } else {
            vscode.window.showInformationMessage(`Arguments set: ${args}`);
        }
    }
}
