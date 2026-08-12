"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMe,
  login as apiLogin,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  refreshSession,
  register as apiRegister,
  type LoginInput,
  type RegisterInput,
} from "@/lib/api/auth";
import { clearAuthTokens, getAccessToken, getRefreshToken } from "@/lib/api/token";
import type { AuthUser } from "@/types/user";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    const hasRefresh = Boolean(getRefreshToken());
    if (!token && !hasRefresh) {
      setUser(null);
      setLoading(false);
      return;
    }

    let me = token ? await fetchMe(token) : null;
    if (!me && hasRefresh) {
      const session = await refreshSession();
      if (session?.accessToken) {
        me = await fetchMe(session.accessToken);
      }
    }

    if (!me) {
      clearAuthTokens();
      setUser(null);
    } else {
      setUser(me);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await apiLogin(input);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await apiRegister(input);
    setUser(result.user);
    return result.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await apiLoginWithGoogle(idToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      logout,
      refresh,
    }),
    [user, loading, login, register, loginWithGoogle, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
