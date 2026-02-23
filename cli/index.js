#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { apiCall, isAuthenticated, logout } from './src/api.js';

const DEFAULT_DATA = {
    issuer: { nombre: '', nif: '', direccion: '', cp: '', ciudad: '', accounts: [] },
    recipients: [],
    templates: []
};

/**
 * Interactive Login prompt
 */
async function loginFlow() {
    console.log(chalk.bold.red('\n--- InvoiceFlow Terminal Login ---\n'));
    const answers = await inquirer.prompt([
        { name: 'email', message: 'Enter your email:', validate: v => v.includes('@') || 'Valid email required' },
        { type: 'password', name: 'password', message: 'Enter your password:', mask: '*' }
    ]);

    try {
        const result = await apiCall('post', '/auth/login', answers);
        console.log(chalk.green(`\n✅ Login successful! Welcome back, ${result.user.display_name}.`));
        return true;
    } catch (err) {
        console.log(chalk.red(`\n❌ Login failed: ${err}`));
        return false;
    }
}

/**
 * Generates an invoice (Interactive or Auto)
 */
async function generateInvoice(args = {}) {
    try {
        const data = await apiCall('get', '/api/data') || JSON.parse(JSON.stringify(DEFAULT_DATA));
        if (!data.recipients || !data.recipients.length) {
            return console.log(chalk.red('Please add a recipient first.'));
        }
        if (!data.invoices) data.invoices = [];

        let answers = {};
        let selectedTemplate = null;

        // 1. Template Selection (if requested or via args)
        if (args.templateId) {
            selectedTemplate = data.templates.find(t => t.id === args.templateId);
        } else if (args.useTemplate) {
            const { tId } = await inquirer.prompt([{
                type: 'list',
                name: 'tId',
                message: 'Select a template:',
                choices: data.templates.map(t => ({ name: t.name, value: t.id }))
            }]);
            selectedTemplate = data.templates.find(t => t.id === tId);
        }

        if (args.quick || selectedTemplate) {
            // Speedrun or Template mode
            const recipient = selectedTemplate
                ? data.recipients.find(r => r.id === selectedTemplate.recipientId)
                : (data.recipients.find(r => r.id === args.recId) || data.recipients[0]);

            const account = data.issuer.accounts.find(a => a.id === args.accId) || data.issuer.accounts[0];

            answers = {
                recipientId: recipient.id,
                accountId: account?.id,
                number: args.num || 'INV-' + Date.now().toString().slice(-4),
                concept: args.concept || selectedTemplate?.concept || 'Servicios Profesionales',
                price: args.price || selectedTemplate?.price || '100'
            };
            console.log(chalk.gray(`Auto-filling: ${recipient.name} | ${answers.number} | ${answers.price}€`));
        } else {
            // Interactive mode
            answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'recipientId',
                    message: 'Recipient:',
                    choices: data.recipients.map(r => ({ name: `${r.isFavorite ? '★ ' : '  '}${r.name}`, value: r.id }))
                },
                {
                    type: 'list',
                    name: 'accountId',
                    message: 'Bank Account:',
                    choices: data.issuer.accounts.map(a => ({ name: a.name, value: a.id }))
                },
                { name: 'number', message: 'Invoice Number:', default: 'INV-' + Date.now().toString().slice(-4) },
                { name: 'concept', message: 'Concept:', default: 'Servicios Profesionales' },
                { name: 'price', message: 'Price (€):', default: '100', validate: v => !isNaN(v) || 'Enter a number' }
            ]);
        }

        const invoice = {
            id: args.editId || `inv_${Date.now()}`,
            number: answers.number,
            date: new Date().toISOString().split('T')[0],
            recipientId: answers.recipientId,
            accountId: answers.accountId,
            items: [{ concept: answers.concept, quantity: 1, price: parseFloat(answers.price), tax: 21 }]
        };

        console.log(chalk.blue('Processing PDF...'));
        const result = await apiCall('post', '/api/generate-pdf', { invoice, globalData: data });

        // Save to history
        if (args.editId) {
            const index = data.invoices.findIndex(i => i.id === args.editId);
            if (index !== -1) data.invoices[index] = invoice;
        } else {
            data.invoices.push(invoice);
        }
        await apiCall('post', '/api/data', data);

        console.log(chalk.green(`\n✅ PDF Generated: ${chalk.bold(result.fileName)}`));
        console.log(chalk.gray(`Location: ${result.path}`));
    } catch (err) {
        console.log(chalk.red(`\n❌ Error: ${err}`));
    }
}

/**
 * Edit an existing invoice
 */
async function editInvoice() {
    try {
        const data = await apiCall('get', '/api/data');
        if (!data || !data.invoices || !data.invoices.length) {
            return console.log(chalk.yellow('\nNo invoices found to edit.'));
        }

        const { invId } = await inquirer.prompt([{
            type: 'list',
            name: 'invId',
            message: 'Select an invoice to edit:',
            choices: data.invoices.map(i => ({ name: `${i.number} - ${i.items[0].concept} (${i.items[0].price}€)`, value: i.id }))
        }]);

        const inv = data.invoices.find(i => i.id === invId);

        // Re-generate with existing data as defaults
        await generateInvoice({
            editId: inv.id,
            recId: inv.recipientId,
            accId: inv.accountId,
            num: inv.number,
            concept: inv.items[0].concept,
            price: inv.items[0].price.toString(),
            quick: false // Ask questions but with defaults? 
            // Actually, let's just use the answers flow but pre-filled.
            // For now, simple override:
        });
    } catch (err) {
        console.log(chalk.red(`\nError: ${err}`));
    }
}

async function viewSummary() {
    try {
        const data = await apiCall('get', '/api/data');
        if (!data) return console.log(chalk.yellow('\nNo data found.'));

        console.log(chalk.bold.underline('\n--- Billing Summary ---'));
        console.log(chalk.cyan(`Issuer: ${data.issuer.nombre || 'Not set'}`));
        console.log(chalk.cyan(`Active Recipients: ${data.recipients.length}`));
        console.log(chalk.cyan(`Total Templates: ${data.templates.length}`));
    } catch (err) {
        console.log(chalk.red(`\nError: ${err}`));
    }
}

/**
 * Main Interactive Loop
 */
async function interactiveMode() {
    if (!isAuthenticated()) {
        const success = await loginFlow();
        if (!success) process.exit(1);
    }

    while (true) {
        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'Quick Summary',
                'Generate Invoice PDF',
                'Use Template',
                'Edit Existing Invoice',
                'Logout',
                'Exit'
            ]
        }]);

        if (action === 'Quick Summary') await viewSummary();
        if (action === 'Generate Invoice PDF') await generateInvoice();
        if (action === 'Use Template') await generateInvoice({ useTemplate: true });
        if (action === 'Edit Existing Invoice') await editInvoice();
        if (action === 'Logout') { logout(); console.log('Logged out.'); process.exit(0); }
        if (action === 'Exit') process.exit(0);
    }
}

// CLI Config with Yargs
yargs(hideBin(process.argv))
    .command('gen', 'Generate a new invoice', (y) => {
        return y.option('price', { alias: 'p', type: 'string' })
            .option('concept', { alias: 'c', type: 'string' })
            .option('num', { alias: 'n', type: 'string' })
            .option('rec', { alias: 'r', type: 'string', describe: 'Recipient ID' })
            .option('acc', { alias: 'a', type: 'string', describe: 'Account ID' })
            .option('template', { alias: 't', type: 'string', describe: 'Template ID' })
            .option('quick', { type: 'boolean', default: true });
    }, (argv) => {
        if (!isAuthenticated()) return console.log(chalk.red('Please login first using: iflow login'));
        generateInvoice({ ...argv, recId: argv.rec, accId: argv.acc, templateId: argv.template });
    })
    .command('edit', 'Edit an existing invoice', {}, editInvoice)
    .command('login', 'Authenticate session', {}, loginFlow)
    .command('logout', 'Clear session', {}, () => { logout(); console.log('Logged out.'); })
    .command('summary', 'View billing status', {}, viewSummary)
    .command('version', 'Show version info', {}, () => console.log('InvoiceFlow CLI v2.0.4-LTS'))
    .command('$0', 'Launch interactive mode', {}, interactiveMode)
    .help()
    .argv;
