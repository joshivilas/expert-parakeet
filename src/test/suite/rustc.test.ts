import * as assert from 'assert';
import { parseRustcOutput } from '../../utils/rustc';

suite('Rustc Parser Test Suite', () => {
    test('Should parse simple error', () => {
        const output = `error[E0425]: cannot find value \`x\` in this scope
 --> test.rs:2:5
  |
2 |     x
  |     ^ not found in this scope

error: aborting due to 1 previous error`;

        const result = parseRustcOutput(output, '/path/test.rs');
        
        assert.strictEqual(result.errors.length, 1);
        assert.strictEqual(result.errors[0].code, 'E0425');
        assert.strictEqual(result.errors[0].line, 2);
        assert.strictEqual(result.errors[0].column, 5);
        assert.ok(result.errors[0].message.includes('cannot find value'));
    });

    test('Should parse warning', () => {
        const output = `warning: unused variable: \`x\`
 --> test.rs:3:9
  |
3 |     let x = 5;
  |         ^ help: if this is intentional, prefix it with an underscore: \`_x\`
  |
  = note: \`#[warn(unused_variables)]\` on by default`;

        const { errors, warnings } = parseRustcOutput(output, '/path/test.rs');
        
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(warnings.length, 1);
        assert.ok(warnings[0].message.includes('unused variable'));
    });

    test('Should parse multiple errors', () => {
        const output = `error[E0425]: cannot find value \`x\` in this scope
 --> test.rs:2:5
  |
2 |     x
  |     ^ not found in this scope

error[E0425]: cannot find value \`y\` in this scope
 --> test.rs:3:5
  |
3 |     y
  |     ^ not found in this scope

error: aborting due to 2 previous errors`;

        const result = parseRustcOutput(output, '/path/test.rs');
        
        assert.strictEqual(result.errors.length, 2);
    });

    test('Should handle empty output', () => {
        const { errors, warnings } = parseRustcOutput('', '/path/test.rs');
        
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(warnings.length, 0);
    });
});
