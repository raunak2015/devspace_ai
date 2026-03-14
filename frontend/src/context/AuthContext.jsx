import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const SESSION_KEY = 'devspace_user';
const USERS_KEY = 'devspace_users';

function getStoredUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(USERS_KEY);
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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
    const normalizedEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const existingUser = users.find((entry) => entry.email === normalizedEmail);

    if (!existingUser) {
      throw new Error('No account found for this email.');
    }

    if (existingUser.password !== password) {
      throw new Error('Incorrect password.');
    }

    const sessionUser = {
      name: existingUser.name,
      email: existingUser.email
    };

    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  };

  const signup = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const alreadyExists = users.some((entry) => entry.email === normalizedEmail);

    if (alreadyExists) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString()
    };

    saveStoredUsers([...users, newUser]);
    return {
      name: newUser.name,
      email: newUser.email
    };
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
