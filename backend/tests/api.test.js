import request from 'supertest';
import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the app but since server.js calls app.listen, we should export the app from server.js
// However, since we can't easily refactor server.js without breaking things, 
// we'll point to the running server on port 3000 for integration tests.
const API_URL = 'http://localhost:3000';

describe('InvoiceFlow Backend API Tests', () => {
    let testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        display_name: 'Test User'
    };

    let authenticatedAgent = request.agent(API_URL);

    it('should return health check status OK', async () => {
        const res = await request(API_URL).get('/health');
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('OK');
    });

    it('should create a new user via signup', async () => {
        const res = await request(API_URL)
            .post('/auth/signup')
            .send(testUser);

        expect(res.status).to.equal(200);
        expect(res.body.success).to.be.true;
    });

    it('should not allow duplicate signups', async () => {
        const res = await request(API_URL)
            .post('/auth/signup')
            .send(testUser);

        expect(res.status).to.equal(400);
        expect(res.body.error).to.exist;
    });

    it('should login successfully with local credentials', async () => {
        const res = await authenticatedAgent
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.status).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.user.email).to.equal(testUser.email);
    });

    it('should reject login with incorrect credentials', async () => {
        const res = await request(API_URL)
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.status).to.equal(401);
        expect(res.body.error).to.exist;
    });

    it('should return 401 for protected data when not logged in', async () => {
        const res = await request(API_URL).get('/api/data');
        expect(res.status).to.equal(401);
    });

    it('should access protected data when logged in', async () => {
        const res = await authenticatedAgent.get('/api/data');
        // It might return 200 and null if no data, or 200 and data
        expect(res.status).to.equal(200);
    });
});
