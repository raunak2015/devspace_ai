import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUserProfile, loginUser, registerUser, updateUserProfile } from '../services/authService';

const AuthContext = createContext(null);
const SESSION_KEY = 'devspace_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session?.user && session?.token) {
          setUser(session.user);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setAuthReady(true);
  }, []);

  const saveSession = (sessionUser, token) => {
    setUser(sessionUser);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user: sessionUser,
        token
      })
    );
  };

  const login = async ({ email, password }) => {
    const response = await loginUser({
      email,
      password
    });

    const sessionUser = response?.user;
    const token = response?.token;

    if (!sessionUser || !token) {
      throw new Error('Unexpected server response during login.');
    }

    saveSession(sessionUser, token);
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

  const refreshProfile = async () => {
    const response = await getCurrentUserProfile();
    const profileUser = response?.user;

    if (!profileUser) {
      throw new Error('Unable to load profile.');
    }

    const raw = localStorage.getItem(SESSION_KEY);
    const token = raw ? JSON.parse(raw)?.token : '';

    if (token) {
      saveSession(profileUser, token);
    } else {
      setUser(profileUser);
    }

    return profileUser;
  };

  const updateProfile = async (payload) => {
    const response = await updateUserProfile(payload);
    const updatedUser = response?.user;
    const newToken = response?.token;

    if (!updatedUser || !newToken) {
      throw new Error('Unexpected server response while updating profile.');
    }

    saveSession(updatedUser, newToken);
    return updatedUser;
  };

  const value = useMemo(
    () => ({
      user,
      authReady,
      login,
      signup,
      logout,
      refreshProfile,
      updateProfile,
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
