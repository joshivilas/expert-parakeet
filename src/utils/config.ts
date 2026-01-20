import * as vscode from 'vscode';

export interface RustQuickRunConfig {
    outputDirectory: string;
    optimizationLevel: string;
    showWarnings: boolean;
    clearTerminalBeforeRun: boolean;
    saveBeforeRun: boolean;
    showCodeLens: boolean;
    commandLineArguments: string;
}

export function getConfig(): RustQuickRunConfig {
    const config = vscode.workspace.getConfiguration('rustQuickRun');
    
    return {
        outputDirectory: config.get<string>('outputDirectory', ''),
        optimizationLevel: config.get<string>('optimizationLevel', '0'),
        showWarnings: config.get<boolean>('showWarnings', true),
        clearTerminalBeforeRun: config.get<boolean>('clearTerminalBeforeRun', true),
        saveBeforeRun: config.get<boolean>('saveBeforeRun', true),
        showCodeLens: config.get<boolean>('showCodeLens', true),
        commandLineArguments: config.get<string>('commandLineArguments', ''),
    };
}

export function getOutputDirectory(): string {
    const config = getConfig();
    
    if (config.outputDirectory && config.outputDirectory.trim() !== '') {
        return config.outputDirectory;
    }
    
    // Use system temp directory
    const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
    return `${tempDir}/rust-quick-run`;
}

export async function updateCommandLineArguments(args: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('rustQuickRun');
    await config.update('commandLineArguments', args, vscode.ConfigurationTarget.Workspace);
}
