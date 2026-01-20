import * as vscode from 'vscode';

export type CompilationStatus = 'idle' | 'running' | 'success' | 'error';

export class StatusBarManager implements vscode.Disposable {
    private rustVersionItem: vscode.StatusBarItem;
    private runButton: vscode.StatusBarItem;
    private debugButton: vscode.StatusBarItem;
    private statusItem: vscode.StatusBarItem;

    constructor() {
        // Rust version display
        this.rustVersionItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.rustVersionItem.name = 'Rust Version';
        this.rustVersionItem.tooltip = 'Rust compiler version';
        
        // Run button
        this.runButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            99
        );
        this.runButton.name = 'Rust Quick Run';
        this.runButton.text = '$(play) Run';
        this.runButton.tooltip = 'Run current Rust file (Ctrl+Shift+R)';
        this.runButton.command = 'rustQuickRun.run';
        
        // Debug button
        this.debugButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            98
        );
        this.debugButton.name = 'Rust Quick Debug';
        this.debugButton.text = '$(debug-alt) Debug';
        this.debugButton.tooltip = 'Debug current Rust file (F5)';
        this.debugButton.command = 'rustQuickRun.debug';
        
        // Status display
        this.statusItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            97
        );
        this.statusItem.name = 'Rust Quick Run Status';
        
        this.setDefaultStatus();
    }

    public updateRustVersion(version: string): void {
        if (version === 'Not installed') {
            this.rustVersionItem.text = '$(warning) Rust not found';
            this.rustVersionItem.backgroundColor = new vscode.ThemeColor(
                'statusBarItem.warningBackground'
            );
            this.rustVersionItem.tooltip = 'Rust compiler not found. Click to install.';
            this.rustVersionItem.command = {
                command: 'vscode.open',
                title: 'Install Rust',
                arguments: [vscode.Uri.parse('https://rustup.rs')],
            };
        } else {
            this.rustVersionItem.text = `$(gear) Rust ${version}`;
            this.rustVersionItem.backgroundColor = undefined;
            this.rustVersionItem.tooltip = `Rust compiler version ${version}`;
            this.rustVersionItem.command = undefined;
        }
    }

    public updateStatus(status: CompilationStatus, message: string): void {
        switch (status) {
            case 'idle':
                this.setDefaultStatus();
                break;
            case 'running':
                this.statusItem.text = `$(sync~spin) ${message}`;
                this.statusItem.backgroundColor = undefined;
                this.statusItem.tooltip = message;
                break;
            case 'success':
                this.statusItem.text = `$(check) ${message}`;
                this.statusItem.backgroundColor = undefined;
                this.statusItem.tooltip = message;
                break;
            case 'error':
                this.statusItem.text = `$(error) ${message}`;
                this.statusItem.backgroundColor = new vscode.ThemeColor(
                    'statusBarItem.errorBackground'
                );
                this.statusItem.tooltip = message;
                break;
        }
    }

    private setDefaultStatus(): void {
        this.statusItem.text = '';
        this.statusItem.tooltip = '';
        this.statusItem.backgroundColor = undefined;
    }

    public show(): void {
        this.rustVersionItem.show();
        this.runButton.show();
        this.debugButton.show();
        this.statusItem.show();
    }

    public hide(): void {
        this.runButton.hide();
        this.debugButton.hide();
        this.statusItem.hide();
        // Keep rust version visible always
    }

    public refresh(): void {
        // Refresh any dynamic content
        this.setDefaultStatus();
    }

    public dispose(): void {
        this.rustVersionItem.dispose();
        this.runButton.dispose();
        this.debugButton.dispose();
        this.statusItem.dispose();
    }
}
