const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
    async get(endpoint) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Important for sessions
        });
        if (!response.ok) return null;
        return response.json();
    },
    async post(endpoint, data) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return response.json();
    }
};
