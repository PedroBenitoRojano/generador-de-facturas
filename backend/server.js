import express from 'express';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Support for CJS modules in ESM
const require = createRequire(import.meta.url);
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Database = require('better-sqlite3');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('--- Starting InvoiceFlow Server ---');

// Validate required environment variables
const REQUIRED_VARS = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
REQUIRED_VARS.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`⚠️ WARNING: Missing environment variable ${varName}`);
    }
});

// Database setup
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'database.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, 
    email TEXT UNIQUE, 
    display_name TEXT, 
    avatar_url TEXT,
    password_hash TEXT
  );
  CREATE TABLE IF NOT EXISTS user_data (
    user_id TEXT PRIMARY KEY, 
    data TEXT, 
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);
console.log('✅ Database initialized at', dbPath);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'invoiceflow-local-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(passport.initialize());
app.use(passport.session());

// Passport Local Config
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) return done(null, false, { message: 'Incorrect email.' });
        if (!user.password_hash) return done(null, false, { message: 'Use Google Login or set a password.' });

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) return done(null, false, { message: 'Incorrect password.' });

        return done(null, user);
    } catch (e) {
        return done(e);
    }
}));

// Passport Google Config
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'missing',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing',
    callbackURL: "/auth/google/callback",
    proxy: true
}, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const upsertUser = db.prepare('INSERT INTO users (id, email, display_name, avatar_url) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, avatar_url=excluded.avatar_url');
    upsertUser.run(profile.id, email, profile.displayName, profile.photos[0]?.value);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(profile.id);
    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        done(null, user || null);
    } catch (e) {
        done(e, null);
    }
});

// Routes
app.get('/health', (req, res) => res.send('OK'));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL || '/');
    }
);

// Local Config & Signup for CLI
app.post('/auth/signup', (req, res) => {
    const { email, password, display_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const hash = bcrypt.hashSync(password, 10);
        const id = Math.random().toString(36).substring(2, 15);
        const insert = db.prepare('INSERT INTO users (id, email, display_name, password_hash) VALUES (?, ?, ?, ?)');
        insert.run(id, email, display_name || email.split('@')[0], hash);
        res.json({ success: true, message: 'User created' });
    } catch (e) {
        res.status(400).json({ error: 'User already exists or database error' });
    }
});

app.post('/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info.message });
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({ success: true, user: { id: user.id, email: user.email, display_name: user.display_name } });
        });
    })(req, res, next);
});

import { generateInvoiceHTML } from './utils/invoiceLogic.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ... (previous code remains same until app.get('/auth/me'))

app.get('/health', (req, res) => res.send('OK'));

app.get('/auth/me', (req, res) => res.json(req.user || null));

// ... (auth routes remain same)

app.post('/api/generate-pdf', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { invoice, globalData } = req.body;
    if (!invoice || !globalData) {
        return res.status(400).json({ error: 'Missing invoice or globalData' });
    }

    try {
        const html = generateInvoiceHTML(invoice, globalData);
        const tempHtmlPath = path.join(__dirname, `temp_${Date.now()}.html`);
        const pdfFileName = `Factura_${invoice.number}.pdf`;
        const pdfOutputAttr = path.join(process.cwd(), pdfFileName); // Save to project root like the user likes

        fs.writeFileSync(tempHtmlPath, html);

        // Use Edge headless to print to PDF
        const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
        const command = `"${edgePath}" --headless --print-to-pdf="${pdfOutputAttr}" "${tempHtmlPath}"`;

        await execAsync(command);

        // Cleanup temp HTML
        if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);

        res.json({
            success: true,
            message: 'PDF generated successfully',
            fileName: pdfFileName,
            path: pdfOutputAttr
        });
    } catch (err) {
        console.error('PDF Generation Error:', err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

app.get('/api/data', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userData = db.prepare('SELECT data FROM user_data WHERE user_id = ?').get(req.user.id);
    res.json(userData ? JSON.parse(userData.data) : null);
});

app.post('/api/data', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const upsertData = db.prepare('INSERT INTO user_data (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data');
    upsertData.run(req.user.id, JSON.stringify(req.body));
    res.json({ success: true });
});

// Static files
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api|\/auth).*/, (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    console.log('✅ Serving frontend from /dist');
}

const server = app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});

export { app, server };
