import * as vscode from 'vscode';
import * as path from 'path';
import { getOutputDirectory } from '../utils/config';

export class RustTaskProvider implements vscode.TaskProvider {
    public static readonly TaskType = 'rustQuickRun';
    private tasks: vscode.Task[] | undefined;

    public provideTasks(): vscode.Task[] | undefined {
        if (!this.tasks) {
            this.tasks = this.getTasks();
        }
        return this.tasks;
    }

    public resolveTask(task: vscode.Task): vscode.Task | undefined {
        const definition = task.definition as RustTaskDefinition;
        
        if (definition.type === RustTaskProvider.TaskType) {
            return this.createTask(definition);
        }
        
        return undefined;
    }

    private getTasks(): vscode.Task[] {
        const tasks: vscode.Task[] = [];
        
        // Build task
        tasks.push(this.createTask({
            type: RustTaskProvider.TaskType,
            command: 'build',
            label: 'Rust Quick Run: Build',
        }));
        
        // Run task
        tasks.push(this.createTask({
            type: RustTaskProvider.TaskType,
            command: 'run',
            label: 'Rust Quick Run: Run',
        }));
        
        // Check task
        tasks.push(this.createTask({
            type: RustTaskProvider.TaskType,
            command: 'check',
            label: 'Rust Quick Run: Check Syntax',
        }));
        
        return tasks;
    }

    private createTask(definition: RustTaskDefinition): vscode.Task {
        const editor = vscode.window.activeTextEditor;
        const filePath = editor?.document.uri.fsPath || '${file}';
        const fileName = path.basename(filePath, '.rs');
        const outputDir = getOutputDirectory();
        const executableExt = process.platform === 'win32' ? '.exe' : '';
        
        let shellCommand: string;
        const isWindows = process.platform === 'win32';
        const runOperator = isWindows ? '& ' : '';
        
        switch (definition.command) {
            case 'build':
                shellCommand = `rustc "${filePath}" -o "${outputDir}/${fileName}${executableExt}"`;
                break;
            case 'run':
                shellCommand = `rustc "${filePath}" -o "${outputDir}/${fileName}${executableExt}" && ${runOperator}"${outputDir}/${fileName}${executableExt}"`;
                break;
            case 'check':
                shellCommand = `rustc --emit=metadata "${filePath}"`;
                break;
            default:
                shellCommand = `rustc "${filePath}"`;
        }
        
        const task = new vscode.Task(
            definition,
            vscode.TaskScope.Workspace,
            definition.label || definition.command,
            RustTaskProvider.TaskType,
            new vscode.ShellExecution(shellCommand),
            '$rustc'
        );
        
        task.group = definition.command === 'build' 
            ? vscode.TaskGroup.Build 
            : undefined;
        
        task.presentationOptions = {
            reveal: vscode.TaskRevealKind.Always,
            panel: vscode.TaskPanelKind.Shared,
            clear: true,
        };
        
        return task;
    }
}

interface RustTaskDefinition extends vscode.TaskDefinition {
    command: 'build' | 'run' | 'check';
    label?: string;
}
