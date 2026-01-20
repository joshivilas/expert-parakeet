import * as vscode from 'vscode';
import { getConfig } from './config';

let terminal: vscode.Terminal | undefined;

export function getOrCreateTerminal(): vscode.Terminal {
    const terminalName = 'Rust Quick Run';
    
    // Check if terminal still exists
    if (terminal && !terminal.exitStatus) {
        return terminal;
    }
    
    // Find existing terminal with our name
    terminal = vscode.window.terminals.find(t => t.name === terminalName);
    
    if (!terminal) {
        terminal = vscode.window.createTerminal(terminalName);
    }
    
    return terminal;
}

export function runInTerminal(command: string, cwd?: string): vscode.Terminal {
    const config = getConfig();
    const term = getOrCreateTerminal();
    
    if (config.clearTerminalBeforeRun) {
        // Send clear command based on platform
        if (process.platform === 'win32') {
            term.sendText('cls', true);
        } else {
            term.sendText('clear', true);
        }
    }
    
    // Change to working directory if specified
    if (cwd) {
        if (process.platform === 'win32') {
            term.sendText(`cd "${cwd}"`, true);
        } else {
            term.sendText(`cd '${cwd}'`, true);
        }
    }
    
    term.sendText(command, true);
    term.show();
    
    return term;
}

export function disposeTerminal(): void {
    if (terminal) {
        terminal.dispose();
        terminal = undefined;
    }
}

// Listen for terminal close events
vscode.window.onDidCloseTerminal(closedTerminal => {
    if (terminal === closedTerminal) {
        terminal = undefined;
    }
});
