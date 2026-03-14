import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);
const SESSION_KEY = 'devspace_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setAuthReady(true);
  }, []);

  const login = async ({ email, password }) => {
    const response = await loginUser({
      email,
      password
    });

    const sessionUser = response?.user;

    if (!sessionUser) {
      throw new Error('Unexpected server response during login.');
    }

    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  };

  const signup = async ({ name, email, password }) => {
    const response = await registerUser({
      name,
      email,
      password
    });

    return response?.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      authReady,
      login,
      signup,
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
