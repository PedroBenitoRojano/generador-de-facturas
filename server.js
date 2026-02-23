import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
const REQUIRED_VARS = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
REQUIRED_VARS.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`CRITICAL ERROR: Missing environment variable ${varName}`);
    }
});

// Database configuration based on environment variable (for Railway Volumes)
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'database.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT
  );
  CREATE TABLE IF NOT EXISTS user_data (
    user_id TEXT PRIMARY KEY,
    data TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

app.use(cors({
    origin: true, // Allow all origins in production if using session cookies
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust Railway's proxy for HTTPS cookies
}

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: "/auth/google/callback",
    proxy: true
}, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const upsertUser = db.prepare('INSERT INTO users (id, email, display_name, avatar_url) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, avatar_url=excluded.avatar_url');
    upsertUser.run(profile.id, email, profile.displayName, profile.photos[0]?.value);
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user);
});

// Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const frontendUrl = process.env.FRONTEND_URL || '/';
        res.redirect(frontendUrl);
    }
);

app.get('/auth/me', (req, res) => {
    res.json(req.user || null);
});

app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

// Data Routes
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

// Serve frontend in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
