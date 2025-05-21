'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode, JwtPayload  } from 'jwt-decode';
import api, { setAuthHeader } from '@/lib/api';

type User = { id: string; email: string };
type TokenPayload = JwtPayload & { id: string; email: string };

export interface AuthCtx {
  user: User | null;
  login: (e: string, p: string, rememberMe?: boolean) => Promise<void>;
  register: (e: string, p: string) => Promise<void>;
  logout: () => void;
  initialized: boolean;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

/* --------------------------------------------------------- */
/* helpers                                                   */
/* --------------------------------------------------------- */
const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

/** check JWT expiry (true ⇢ already expired) */
function isExpired(token: string) {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return exp ? exp * 1000 < Date.now() : true;
  } catch {
    return true;
  }
}

function decode(token: string): User {
  const payload = jwtDecode<TokenPayload>(token);
  return { id: payload.id, email: payload.email };
}

async function refreshAccess(refresh: string) {
  const { data } = await api.post('/api/auth/refresh', { refreshToken: refresh });
  localStorage.setItem(ACCESS, data.accessToken);
  setAuthHeader(data.accessToken);
  return decode(data.accessToken);
}

/* --------------------------------------------------------- */
/* provider                                                  */
/* --------------------------------------------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Memoize logout so it's stable across renders
  const logout = useCallback(() => {
    const refresh = localStorage.getItem(REFRESH) || sessionStorage.getItem(REFRESH);
    if (refresh) api.post('/api/auth/logout', { refreshToken: refresh }).catch(() => {});
    localStorage.clear();
    sessionStorage.clear();
    setAuthHeader(null);
    setUser(null);
    setInitialized(true);
  }, []);

  /** Load persisted tokens on mount */
  useEffect(() => {
    async function initAuth() {
      const access = localStorage.getItem(ACCESS) || sessionStorage.getItem(ACCESS);
      const refresh = localStorage.getItem(REFRESH) || sessionStorage.getItem(REFRESH);

      if (access && !isExpired(access)) {
        setUser(decode(access));
        setAuthHeader(access);
      } else if (refresh) {
        try {
          const freshUser = await refreshAccess(refresh);
          setUser(freshUser);
        } catch {
          logout();
        }
      }
      setInitialized(true);
    }
    initAuth();
  }, [logout]);

  /** register -> auto‑login */
  interface AuthResponse { accessToken: string, refreshToken: string }
  const register = async (email: string, password: string) => {
    await api.post<AuthResponse>('/api/auth/register', { email, password });
    await login(email, password);
  };

  /** login flow */
  const login = async (email: string, password: string, rememberMe = true) => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(ACCESS, data.accessToken);
    storage.setItem(REFRESH, data.refreshToken);
    setAuthHeader(data.accessToken);
    setUser({ id: decode(data.accessToken).id, email });
    setInitialized(true);
  };

  /** Axios response interceptor → auto‑refresh on 401 */
  useEffect(() => {
    if (!initialized) return;
    const id = api.interceptors.response.use(
      (r) => r,
      async (err) => {
        if (err.response?.status === 401) {
          const refresh = localStorage.getItem(REFRESH) || sessionStorage.getItem(REFRESH);
          if (refresh) {
            try {
              const newUser = await refreshAccess(refresh);
              setUser(newUser);
              // retry original request
              err.config.headers.Authorization = api.defaults.headers.common.Authorization;
              return api(err.config);
            } catch {
              logout();
            }
          } else logout();
        }
        return Promise.reject(err);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, [initialized, logout]);

  return (
    <Ctx.Provider value={{ user, login, register, logout, initialized }}>
      {children}
    </Ctx.Provider>
  );
}
