import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            const data = await api.get('/auth/me');
            setUser(data);
        } catch (error) {
            console.error("Auth check failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const loginWithGoogle = () => {
        const authUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`;
        window.location.href = authUrl;
    };

    const logout = () => {
        const logoutUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/logout`;
        window.location.href = logoutUrl;
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
