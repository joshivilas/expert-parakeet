import * as vscode from 'vscode';
import { RustError, RustWarning } from './rustc';
import { getConfig } from './config';

export class DiagnosticsManager implements vscode.Disposable {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('rustQuickRun');
        this.outputChannel = vscode.window.createOutputChannel('Rust Quick Run');
    }

    public updateDiagnostics(
        documentUri: vscode.Uri,
        errors: RustError[],
        warnings: RustWarning[]
    ): void {
        const config = getConfig();
        const diagnostics: vscode.Diagnostic[] = [];

        // Add errors
        for (const error of errors) {
            const range = new vscode.Range(
                new vscode.Position(error.line - 1, error.column - 1),
                new vscode.Position(error.line - 1, error.column + 50) // Approximate end
            );

            const diagnostic = new vscode.Diagnostic(
                range,
                error.message,
                vscode.DiagnosticSeverity.Error
            );

            if (error.code) {
                diagnostic.code = error.code;
            }

            diagnostic.source = 'rustc';
            diagnostics.push(diagnostic);
        }

        // Add warnings if enabled
        if (config.showWarnings) {
            for (const warning of warnings) {
                const range = new vscode.Range(
                    new vscode.Position(warning.line - 1, warning.column - 1),
                    new vscode.Position(warning.line - 1, warning.column + 50)
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    warning.message,
                    vscode.DiagnosticSeverity.Warning
                );

                if (warning.code) {
                    diagnostic.code = warning.code;
                }

                diagnostic.source = 'rustc';
                diagnostics.push(diagnostic);
            }
        }

        this.diagnosticCollection.set(documentUri, diagnostics);
    }

    public clearDiagnostics(documentUri?: vscode.Uri): void {
        if (documentUri) {
            this.diagnosticCollection.delete(documentUri);
        } else {
            this.diagnosticCollection.clear();
        }
    }

    public log(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }

    public showOutput(): void {
        this.outputChannel.show();
    }

    public clearOutput(): void {
        this.outputChannel.clear();
    }

    public appendOutput(text: string): void {
        this.outputChannel.append(text);
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
        this.outputChannel.dispose();
    }
}
