import React, { createContext, useCallback, useEffect, useMemo, useState, useContext } from 'react';
import {
  authApi,
  clearStoredUser,
  getApiErrorMessage,
  readStoredUser,
  storeUser,
  usersApi,
} from '../services/api';

const AuthContext = createContext(null);

function getValidUserId(user) {
  const id = Number(user?.id ?? user?.userId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function normalizeUser(profile, token, expectedId) {
  const id = getValidUserId(profile);

  if (!id || id !== expectedId || !profile.name || !profile.email || !profile.role) {
    throw new Error('The server returned an incomplete or inconsistent user profile.');
  }

  return {
    ...profile,
    id,
    userId: id,
    token,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedUser = readStoredUser();
    const expectedId = getValidUserId(storedUser);

    if (!storedUser?.token || !expectedId) {
      logout();
      return null;
    }

    const { data } = await usersApi.profile();
    const refreshedUser = normalizeUser(data, storedUser.token, expectedId);
    storeUser(refreshedUser, Boolean(localStorage.getItem('user')));
    setUser(refreshedUser);
    return refreshedUser;
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredUser();
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const restoreSession = async () => {
      const storedUser = readStoredUser();
      const storedId = getValidUserId(storedUser);

      if (!storedUser?.token || !storedId) {
        clearStoredUser();
        setLoading(false);
        return;
      }

      try {
        const { data } = await usersApi.profile();
        const refreshedUser = normalizeUser(data, storedUser.token, storedId);
        storeUser(refreshedUser, Boolean(localStorage.getItem('user')));
        setUser(refreshedUser);
      } catch (error) {
        if (error.response?.status !== 401) {
          setUser(storedUser);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password, mfaCode, remember = true) => {
    try {
      const payload = { email, password };
      if (mfaCode) payload.mfaCode = mfaCode;

      const { data } = await authApi.login(payload);
      
      if (data?.mfaRequired) {
        return { success: true, mfaRequired: true };
      }

      const id = getValidUserId(data);

      if (!data?.token || !id || !data.name || !data.email || !data.role) {
        throw new Error('The server returned an incomplete login response.');
      }

      const session = { ...data, id, userId: id };
      storeUser(session, remember);

      const { data: profile } = await usersApi.profile();
      const authenticatedUser = normalizeUser(profile, data.token, id);
      storeUser(authenticatedUser, remember);
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (error) {
      clearStoredUser();
      setUser(null);
      return {
        success: false,
        message: getApiErrorMessage(error, error.message || 'Login failed. Please try again.'),
      };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      await authApi.register({ name, email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Registration failed. Please try again.'),
      };
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, refreshProfile, loading }),
    [user, login, register, logout, refreshProfile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};
