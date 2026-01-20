import * as vscode from 'vscode';

export class RustCodeLensProvider implements vscode.CodeLensProvider {
    private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;

    public provideCodeLenses(
        document: vscode.TextDocument,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        
        // Find fn main() declarations
        const mainFnRegex = /^\s*(?:pub\s+)?fn\s+main\s*\(\s*\)/gm;
        let match: RegExpExecArray | null;
        
        while ((match = mainFnRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = new vscode.Range(position, position);
            
            // Add Run CodeLens
            codeLenses.push(
                new vscode.CodeLens(range, {
                    title: '▶ Run',
                    command: 'rustQuickRun.run',
                    tooltip: 'Run this Rust file',
                })
            );
            
            // Add Debug CodeLens
            codeLenses.push(
                new vscode.CodeLens(range, {
                    title: '🐛 Debug',
                    command: 'rustQuickRun.debug',
                    tooltip: 'Debug this Rust file',
                })
            );
            
            // Add Build CodeLens
            codeLenses.push(
                new vscode.CodeLens(range, {
                    title: '🔨 Build',
                    command: 'rustQuickRun.build',
                    tooltip: 'Build this Rust file',
                })
            );
        }
        
        return codeLenses;
    }

    public refresh(): void {
        this.onDidChangeCodeLensesEmitter.fire();
    }
}
