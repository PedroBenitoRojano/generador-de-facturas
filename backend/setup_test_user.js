import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

const email = 'admin@example.com';
const password = 'admin';
const hash = bcrypt.hashSync(password, 10);

try {
    const insert = db.prepare('INSERT INTO users (id, email, display_name, password_hash) VALUES (?, ?, ?, ?)');
    insert.run('cli-admin', email, 'CLI Admin', hash);
    console.log(`✅ Test user created!\nEmail: ${email}\nPassword: ${password}`);
} catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
        const update = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?');
        update.run(hash, email);
        console.log(`✅ Password updated for existing user: ${email}`);
    } else {
        console.error('❌ Error creating user:', e);
    }
}
