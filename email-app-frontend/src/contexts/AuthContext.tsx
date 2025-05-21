'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface AuthCtx {
    user: {
        id: string;
        email: string;
    } | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
    user: null,
    token: null,
    login: async () => {},
    logout: async () => {},
    loading: true,
    register: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthCtx['user']>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth data
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            
            // Store tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            // Extract user info from token
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            const userData = { id: payload.id, email: payload.email };
            
            setToken(data.accessToken);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            throw error;
        }
    };

    const register = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/api/auth/register', { email, password });
            
            // Store tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            // Extract user info from token
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            const userData = { id: payload.id, email: payload.email };
            
            setToken(data.accessToken);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/api/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, register }}>
            {children}
        </AuthContext.Provider>
    );
};
