import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = path.join(__dirname, '..', '.session.json');
const API_URL = 'http://localhost:3000';

let sessionCookie = '';

// Load session if exists
if (fs.existsSync(SESSION_FILE)) {
    try {
        const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
        sessionCookie = session.cookie || '';
    } catch (e) {
        // Ignore malformed session
    }
}

/**
 * Saves current session to disk
 */
function saveSession() {
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookie: sessionCookie }), 'utf8');
}

/**
 * Handle API calls with session persistence
 */
export async function apiCall(method, endpoint, data = null) {
    try {
        const response = await axios({
            method,
            url: `${API_URL}${endpoint}`,
            data,
            headers: sessionCookie ? { 'Cookie': sessionCookie } : {},
            withCredentials: true
        });

        // Update cookie if provided
        if (response.headers['set-cookie']) {
            sessionCookie = response.headers['set-cookie'][0];
            saveSession();
        }

        return response.data;
    } catch (error) {
        const msg = error.response?.data?.error || error.message;
        if (msg === 'Unauthorized') {
            sessionCookie = '';
            saveSession();
        }
        throw msg;
    }
}

export function isAuthenticated() {
    return !!sessionCookie;
}

export function logout() {
    sessionCookie = '';
    if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
}
