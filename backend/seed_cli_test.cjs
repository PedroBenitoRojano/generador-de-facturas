const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

const email = 'admin@example.com';
const password = 'admin';
const hash = bcrypt.hashSync(password, 10);

const testData = {
    issuer: {
        nombre: "CLI Admin Issuer",
        nif: "B12345678",
        direccion: "CLI Street 1",
        cp: "28000",
        ciudad: "Madrid",
        accounts: [{ id: "cli_acc", name: "Savings", iban: "ES00 1111 2222 3333 4444 5555" }],
        irpf: 15
    },
    recipients: [
        { id: "cli_rec_1", name: "Existing Client A", cif: "B00000001", address: "Client Ave 1", isFavorite: false }
    ],
    templates: [
        { id: "tmpl_1", name: "Monthly Maintenance", recipientId: "cli_rec_1", concept: "Server Maintenance", price: 250 }
    ]
};

try {
    // Ensure user exists or update password
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    let userId = user ? user.id : 'cli_admin_id';

    if (!user) {
        db.prepare('INSERT INTO users (id, email, display_name, password_hash) VALUES (?, ?, ?, ?)').run(userId, email, 'CLI Admin', hash);
        console.log('User created');
    } else {
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, email);
        console.log('User updated');
    }

    // Seed data
    db.prepare('INSERT INTO user_data (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data').run(userId, JSON.stringify(testData));
    console.log('Test data seeded successfully');
} catch (e) {
    console.error('Seeding error:', e);
} finally {
    db.close();
}
