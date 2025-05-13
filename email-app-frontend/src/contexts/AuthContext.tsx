// src/contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

type User = { id: string; email: string };

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload: any = jwtDecode(token);
      setUser({ id: payload.id, email: payload.email });
    }
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const payload: any = jwtDecode(data.accessToken);
    setUser({ id: payload.id, email: payload.email });
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx)!;
