import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('your-publisher-name.rust-quick-run'));
    });

    test('Should register all commands', async () => {
        const commands = await vscode.commands.getCommands(true);
        
        assert.ok(commands.includes('rustQuickRun.run'));
        assert.ok(commands.includes('rustQuickRun.debug'));
        assert.ok(commands.includes('rustQuickRun.build'));
        assert.ok(commands.includes('rustQuickRun.checkSyntax'));
        assert.ok(commands.includes('rustQuickRun.clean'));
        assert.ok(commands.includes('rustQuickRun.setArguments'));
    });

    test('Configuration should have default values', () => {
        const config = vscode.workspace.getConfiguration('rustQuickRun');
        
        assert.strictEqual(config.get('optimizationLevel'), '0');
        assert.strictEqual(config.get('showWarnings'), true);
        assert.strictEqual(config.get('clearTerminalBeforeRun'), true);
        assert.strictEqual(config.get('saveBeforeRun'), true);
        assert.strictEqual(config.get('showCodeLens'), true);
    });
});
