import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('devspace_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem('devspace_user');
      }
    }
    setAuthReady(true);
  }, []);

  const login = (payload) => {
    setUser(payload);
    localStorage.setItem('devspace_user', JSON.stringify(payload));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('devspace_user');
  };

  const value = useMemo(
    () => ({
      user,
      authReady,
      login,
      logout,
      isAuthenticated: Boolean(user)
    }),
    [user, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
