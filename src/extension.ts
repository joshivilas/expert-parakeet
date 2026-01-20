import * as vscode from 'vscode';
import { runCommand } from './commands/run';
import { debugCommand } from './commands/debug';
import { buildCommand } from './commands/build';
import { cleanCommand } from './commands/clean';
import { checkSyntaxCommand } from './commands/checkSyntax';
import { setArgumentsCommand } from './commands/setArguments';
import { StatusBarManager } from './statusBar';
import { RustCodeLensProvider } from './providers/codeLensProvider';
import { DiagnosticsManager } from './utils/diagnostics';
import { checkRustcInstalled, getRustVersion } from './utils/rustc';

let statusBarManager: StatusBarManager;
let diagnosticsManager: DiagnosticsManager;
let codeLensProvider: RustCodeLensProvider;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('Rust Quick Run extension is now active');

    // Check if rustc is installed
    const rustcInstalled = await checkRustcInstalled();
    if (!rustcInstalled) {
        const action = await vscode.window.showErrorMessage(
            'Rust compiler (rustc) is not installed or not in PATH. Please install Rust to use this extension.',
            'Install Rust',
            'Dismiss'
        );
        if (action === 'Install Rust') {
            vscode.env.openExternal(vscode.Uri.parse('https://rustup.rs'));
        }
    }

    // Initialize diagnostics manager
    diagnosticsManager = new DiagnosticsManager();
    context.subscriptions.push(diagnosticsManager);

    // Initialize status bar
    statusBarManager = new StatusBarManager();
    context.subscriptions.push(statusBarManager);

    // Get and display Rust version
    const rustVersion = await getRustVersion();
    statusBarManager.updateRustVersion(rustVersion);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('rustQuickRun.run', () => 
            runCommand(statusBarManager, diagnosticsManager)
        ),
        vscode.commands.registerCommand('rustQuickRun.debug', () => 
            debugCommand(statusBarManager, diagnosticsManager)
        ),
        vscode.commands.registerCommand('rustQuickRun.build', () => 
            buildCommand(statusBarManager, diagnosticsManager)
        ),
        vscode.commands.registerCommand('rustQuickRun.checkSyntax', () => 
            checkSyntaxCommand(statusBarManager, diagnosticsManager)
        ),
        vscode.commands.registerCommand('rustQuickRun.clean', () => 
            cleanCommand(statusBarManager)
        ),
        vscode.commands.registerCommand('rustQuickRun.setArguments', () => 
            setArgumentsCommand()
        )
    );

    // Register CodeLens provider
    const config = vscode.workspace.getConfiguration('rustQuickRun');
    if (config.get<boolean>('showCodeLens', true)) {
        codeLensProvider = new RustCodeLensProvider();
        context.subscriptions.push(
            vscode.languages.registerCodeLensProvider(
                { language: 'rust', scheme: 'file' },
                codeLensProvider
            )
        );
    }

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('rustQuickRun')) {
                // Reload settings if needed
                statusBarManager.refresh();
            }
        })
    );

    // Update status bar when active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor?.document.languageId === 'rust') {
                statusBarManager.show();
            } else {
                statusBarManager.hide();
            }
        })
    );

    // Show status bar if current file is Rust
    if (vscode.window.activeTextEditor?.document.languageId === 'rust') {
        statusBarManager.show();
    }

    // Suggest rust-analyzer if not installed
    suggestRustAnalyzer();
}

async function suggestRustAnalyzer(): Promise<void> {
    const rustAnalyzer = vscode.extensions.getExtension('rust-lang.rust-analyzer');
    if (!rustAnalyzer) {
        const config = vscode.workspace.getConfiguration('rustQuickRun');
        const dontAskAgain = config.get<boolean>('dontSuggestRustAnalyzer', false);
        
        if (!dontAskAgain) {
            const action = await vscode.window.showInformationMessage(
                'For better Rust IDE support, consider installing rust-analyzer extension.',
                'Install',
                'Not Now',
                "Don't Ask Again"
            );
            
            if (action === 'Install') {
                vscode.commands.executeCommand(
                    'workbench.extensions.installExtension',
                    'rust-lang.rust-analyzer'
                );
            } else if (action === "Don't Ask Again") {
                config.update('dontSuggestRustAnalyzer', true, vscode.ConfigurationTarget.Global);
            }
        }
    }
}

export function deactivate(): void {
    console.log('Rust Quick Run extension is now deactivated');
}
