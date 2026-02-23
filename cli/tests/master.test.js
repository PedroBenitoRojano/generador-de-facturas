import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { expect } from 'chai';
import stripAnsi from 'strip-ansi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.join(__dirname, '..', 'index.js');
const SESSION_FILE = path.join(__dirname, '..', '.session.json');

const ENTER = '\n';
const DOWN = '\u001b[B';

function runCLI(inputs = [], timeout = 120000) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [CLI_PATH], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, NODE_NO_WARNINGS: '1' }
        });

        let output = '';
        let strippedOutput = '';
        let lastMatchIndex = 0;

        const timer = setTimeout(() => {
            child.kill();
            console.log('--- CLI TIMEOUT OUTPUT ---');
            console.log(strippedOutput);
            console.log('--- END CLI TIMEOUT OUTPUT ---');
            reject(new Error(`CLI test timed out.`));
        }, timeout);

        child.stdout.on('data', (data) => {
            output += data.toString();
            strippedOutput = stripAnsi(output);

            if (inputs.length > 0) {
                const currentInput = inputs[0];
                const searchArea = strippedOutput.slice(lastMatchIndex);

                const match = typeof currentInput.wait === 'string'
                    ? searchArea.includes(currentInput.wait)
                    : currentInput.wait.test(searchArea);

                if (match) {
                    const matchPos = typeof currentInput.wait === 'string'
                        ? searchArea.indexOf(currentInput.wait) + currentInput.wait.length
                        : searchArea.match(currentInput.wait).index + searchArea.match(currentInput.wait)[0].length;

                    lastMatchIndex += matchPos;

                    setTimeout(() => {
                        if (currentInput.value !== undefined) {
                            child.stdin.write(currentInput.value);
                        }
                    }, 1000);
                    inputs.shift();
                }
            }
        });

        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ output, strippedOutput, code });
        });
    });
}

describe('Master CLI Full Lifecycle Test', function () {
    this.timeout(180000);

    before(() => {
        if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
    });

    it('should complete ALL cases of use in one session', async () => {
        const inputs = [
            // 1. Login
            { wait: /Enter your email:/, value: 'admin@example.com' + ENTER },
            { wait: /Enter your password:/, value: 'admin' + ENTER },

            // 2. Summary
            { wait: /What would you like to do\?/, value: ENTER }, // Quick Summary
            { wait: /Billing Summary/, value: ENTER }, // Clear summary

            // 3. Use Template
            { wait: /What would you like to do\?/, value: DOWN + DOWN + ENTER }, // Use Template
            { wait: /Select a template:/, value: ENTER }, // Monthly Maintenance
            { wait: /PDF Generated: Factura_INV-/, value: '' },

            // 4. Manual Generation (Advanced Selects)
            { wait: /What would you like to do\?/, value: DOWN + ENTER }, // Generate Invoice PDF
            { wait: /Recipient:/, value: ENTER }, // Client A
            { wait: /Bank Account:/, value: ENTER }, // Account
            { wait: /Invoice Number:/, value: 'INV-MASTER-001' + ENTER },
            { wait: /Concept:/, value: 'Manual Master Test' + ENTER },
            { wait: /Price/, value: '123' + ENTER },
            { wait: /PDF Generated:/, value: '' },

            // 5. Edit Existing Invoice
            { wait: /What would you like to do\?/, value: DOWN + DOWN + DOWN + ENTER }, // Edit Existing
            { wait: /Select an invoice to edit:/, value: ENTER }, // Last one
            { wait: /Recipient:/, value: ENTER },
            { wait: /Bank Account:/, value: ENTER },
            { wait: /Invoice Number:/, value: 'INV-MASTER-EDITED' + ENTER },
            { wait: /Concept:/, value: ENTER },
            { wait: /Price/, value: '999' + ENTER },
            { wait: /PDF Generated:/, value: '' },

            // 6. Exit
            { wait: /What would you like to do\?/, value: DOWN + DOWN + DOWN + DOWN + DOWN + ENTER }
        ];

        const { strippedOutput, code } = await runCLI(inputs);

        expect(strippedOutput).to.include('Welcome back, CLI Admin');
        expect(strippedOutput).to.include('Auto-filling: Existing Client A');
        expect(strippedOutput).to.include('PDF Generated: Factura_INV-MASTER-EDITED.pdf');
        expect(code).to.equal(0);

        // Cleanup
        ['Factura_INV-MASTER-001.pdf', 'Factura_INV-MASTER-EDITED.pdf'].forEach(f => {
            const p = path.join(process.cwd(), f);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
    });
});
