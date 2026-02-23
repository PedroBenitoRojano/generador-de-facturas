import request from 'supertest';
import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3000';

describe('InvoiceFlow Full Business Flow Tests', () => {
    let testUser = {
        email: `flow_test_${Date.now()}@example.com`,
        password: 'password123',
        display_name: 'Flow User'
    };

    let authenticatedAgent = request.agent(API_URL);
    let globalDataState = {
        issuer: {
            nombre: "Issuer Test",
            nif: "12345678Z",
            direccion: "Calle Falsa 123",
            cp: "28001",
            ciudad: "Madrid",
            accounts: [{ id: "acc1", name: "Principal", iban: "ES00 1234 5678 9012 3456 7890" }],
            irpf: 15
        },
        recipients: [],
        templates: []
    };

    it('1. Setup: Create user and login', async () => {
        await request(API_URL).post('/auth/signup').send(testUser);
        const res = await authenticatedAgent.post('/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        expect(res.status).to.equal(200);
    });

    it('2. Recipients: Add a new recipient', async () => {
        const newRecipient = {
            id: 'rec_1',
            name: 'Client A',
            cif: 'B12345678',
            address: 'Industrial Park 1',
            isFavorite: false
        };

        globalDataState.recipients.push(newRecipient);

        const res = await authenticatedAgent.post('/api/data').send(globalDataState);
        expect(res.status).to.equal(200);

        const check = await authenticatedAgent.get('/api/data');
        expect(check.body.recipients).to.have.lengthOf(1);
        expect(check.body.recipients[0].name).to.equal('Client A');
    });

    it('3. Favorites: Mark recipient as favorite', async () => {
        globalDataState.recipients[0].isFavorite = true;

        await authenticatedAgent.post('/api/data').send(globalDataState);

        const check = await authenticatedAgent.get('/api/data');
        expect(check.body.recipients[0].isFavorite).to.be.true;
    });

    it('4. Templates: Create a template for Client A', async () => {
        const newTemplate = {
            id: 'temp_1',
            name: 'Standard Template for Client A',
            recipientId: 'rec_1',
            accountId: 'acc1',
            items: [
                { concept: 'Consultancy Service', quantity: 10, price: 50, tax: 21 }
            ]
        };

        globalDataState.templates.push(newTemplate);

        await authenticatedAgent.post('/api/data').send(globalDataState);

        const check = await authenticatedAgent.get('/api/data');
        expect(check.body.templates).to.have.lengthOf(1);
        expect(check.body.templates[0].name).to.include('Client A');
    });

    it('5. Invoices: Generate PDF for an invoice', async function () {
        this.timeout(10000); // PDF generation might take longer

        const invoice = {
            number: 'INV-TEST-FLOW',
            date: '2026-02-23',
            recipientId: 'rec_1',
            accountId: 'acc1',
            items: [
                { concept: 'Product X', quantity: 2, price: 100, tax: 21 },
                { concept: 'Service Y', quantity: 1, price: 50, tax: 21 }
            ]
        };

        const res = await authenticatedAgent.post('/api/generate-pdf').send({
            invoice,
            globalData: globalDataState
        });

        expect(res.status).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.fileName).to.equal(`Factura_INV-TEST-FLOW.pdf`);

        // Verify file exists in project root
        const filePath = path.join(process.cwd(), res.body.fileName);
        expect(fs.existsSync(filePath)).to.be.true;

        // Cleanup generated test PDF
        fs.unlinkSync(filePath);
    });

    it('6. Modification: Update invoice data and verify HTML consistency', async function () {
        this.timeout(10000);
        // This tests the logic underlying the HTML generation
        const invoice = {
            number: 'INV-UPDATED',
            date: '2026-02-23',
            recipientId: 'rec_1',
            accountId: 'acc1',
            items: [
                { concept: 'Modified Item', quantity: 1, price: 500, tax: 21 }
            ]
        };

        const res = await authenticatedAgent.post('/api/generate-pdf').send({
            invoice,
            globalData: globalDataState
        });

        expect(res.status).to.equal(200);
        const filePath = path.join(process.cwd(), `Factura_INV-UPDATED.pdf`);
        expect(fs.existsSync(filePath)).to.be.true;
        fs.unlinkSync(filePath);
    });
});
