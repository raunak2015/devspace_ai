import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUserProfile, loginUser, registerUser, resendOtp, updateUserProfile, verifyOtp } from '../services/authService';

const AuthContext = createContext(null);
const SESSION_KEY = 'devspace_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Check if user session exists on load
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const { user: sessionUser } = JSON.parse(raw);
        setUser(sessionUser);
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
      // Check if verification is required
      if (response?.requiresVerification) {
          throw { status: 403, email: response.email, message: response.message };
      }
      throw new Error('Unexpected server response during login.');
    }

    saveSession(sessionUser, token);
    return sessionUser;
  };

  const signup = async (payload) => {
    const response = await registerUser(payload);
    return response;
  };

  const confirmOtp = async (payload) => {
    const response = await verifyOtp(payload);
    const sessionUser = response?.user;
    const token = response?.token;

    if (sessionUser && token) {
      saveSession(sessionUser, token);
    }
    return response;
  };

  const requestNewOtp = async (email) => {
    return await resendOtp({ email });
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
    let token = '';

    if (raw) {
      try {
        token = JSON.parse(raw)?.token || '';
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }

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
      confirmOtp,
      requestNewOtp,
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
