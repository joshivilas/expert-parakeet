import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { getOutputDirectory, getConfig } from './config';

export interface CompilationResult {
    success: boolean;
    output: string;
    errors: RustError[];
    warnings: RustWarning[];
    executablePath?: string;
}

export interface RustError {
    file: string;
    line: number;
    column: number;
    message: string;
    code?: string;
}

export interface RustWarning {
    file: string;
    line: number;
    column: number;
    message: string;
    code?: string;
}

export async function checkRustcInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
        cp.exec('rustc --version', (error) => {
            resolve(!error);
        });
    });
}

export async function getRustVersion(): Promise<string> {
    return new Promise((resolve) => {
        cp.exec('rustc --version', (error, stdout) => {
            if (error) {
                resolve('Not installed');
            } else {
                // Extract version like "rustc 1.75.0"
                const match = stdout.match(/rustc\s+(\d+\.\d+\.\d+)/);
                resolve(match ? match[1] : stdout.trim());
            }
        });
    });
}

export async function ensureOutputDirectory(): Promise<string> {
    const outputDir = getOutputDirectory();
    
    return new Promise((resolve, reject) => {
        fs.mkdir(outputDir, { recursive: true }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve(outputDir);
            }
        });
    });
}

export async function compileRustFile(
    filePath: string,
    options: {
        debug?: boolean;
        checkOnly?: boolean;
        optimize?: boolean;
    } = {}
): Promise<CompilationResult> {
    const outputDir = await ensureOutputDirectory();
    const fileName = path.basename(filePath, '.rs');
    const executableExt = process.platform === 'win32' ? '.exe' : '';
    const executablePath = path.join(outputDir, `${fileName}${executableExt}`);
    
    const config = getConfig();
    
    // Build rustc command
    const args: string[] = [];
    
    if (options.checkOnly) {
        args.push('--emit=metadata');
    } else {
        // Quote the output path to handle spaces
        args.push('-o', `"${executablePath}"`);
        
        if (options.debug) {
            args.push('-g'); // Debug symbols
        } else if (options.optimize) {
            args.push(`-C`, `opt-level=${config.optimizationLevel}`);
        }
    }
    
    // Add warning flags
    if (config.showWarnings) {
        args.push('-W', 'warnings');
    }
    
    // Quote the file path to handle spaces in path
    args.push(`"${filePath}"`);
    
    const command = `rustc ${args.join(' ')}`;
    
    return new Promise((resolve) => {
        cp.exec(command, { cwd: path.dirname(filePath) }, (error, stdout, stderr) => {
            const output = stderr || stdout;
            const { errors, warnings } = parseRustcOutput(output, filePath);
            
            resolve({
                success: !error,
                output,
                errors,
                warnings,
                executablePath: options.checkOnly ? undefined : executablePath,
            });
        });
    });
}

export function parseRustcOutput(output: string, defaultFile: string): { errors: RustError[]; warnings: RustWarning[] } {
    const errors: RustError[] = [];
    const warnings: RustWarning[] = [];
    
    // Regex to match rustc error/warning format
    // error[E0425]: cannot find value `x` in this scope
    //  --> src/main.rs:2:5
    const locationRegex = /\s+--> (.+):(\d+):(\d+)/;
    
    const lines = output.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const messageMatch = line.match(/^(error|warning)(\[E\d+\])?: (.+)/);
        
        if (messageMatch) {
            const type = messageMatch[1];
            const code = messageMatch[2]?.replace(/[[\]]/g, '');
            const message = messageMatch[3];
            
            // Look for location in next line
            let file = defaultFile;
            let lineNum = 1;
            let column = 1;
            
            if (i + 1 < lines.length) {
                const locationMatch = lines[i + 1].match(locationRegex);
                if (locationMatch) {
                    file = path.isAbsolute(locationMatch[1]) 
                        ? locationMatch[1] 
                        : path.join(path.dirname(defaultFile), locationMatch[1]);
                    lineNum = parseInt(locationMatch[2], 10);
                    column = parseInt(locationMatch[3], 10);
                }
            }
            
            const entry = {
                file,
                line: lineNum,
                column,
                message,
                code,
            };
            
            if (type === 'error') {
                errors.push(entry);
            } else {
                warnings.push(entry);
            }
        }
    }
    
    return { errors, warnings };
}

export async function cleanOutputDirectory(): Promise<void> {
    const outputDir = getOutputDirectory();
    
    return new Promise((resolve, reject) => {
        fs.rm(outputDir, { recursive: true, force: true }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export function getDebuggerType(): string {
    switch (process.platform) {
        case 'win32':
            return 'cppvsdbg';
        case 'darwin':
        case 'linux':
        default:
            return 'cppdbg';
    }
}

export function getDebuggerMIMode(): string | undefined {
    switch (process.platform) {
        case 'darwin':
            return 'lldb';
        case 'linux':
            return 'gdb';
        default:
            return undefined;
    }
}
