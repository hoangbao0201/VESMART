import { apiGet, apiPost } from "@/lib/api/client";
import {
  clearAuthTokens,
  getRefreshToken,
  setAuthTokens,
} from "@/lib/api/token";
import type { AuthLoginResult, AuthRegisterResult, AuthUser } from "@/types/user";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
  fullName?: string;
};

export async function login(input: LoginInput): Promise<AuthLoginResult> {
  const data = await apiPost<AuthLoginResult>("/auth/login", {
    body: input,
    auth: false,
    revalidate: false,
  });
  setAuthTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data;
}

export async function register(input: RegisterInput): Promise<AuthRegisterResult> {
  const data = await apiPost<AuthRegisterResult>("/auth/register", {
    body: input,
    auth: false,
    revalidate: false,
  });
  setAuthTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthLoginResult> {
  const data = await apiPost<AuthLoginResult>("/auth/google", {
    body: { idToken },
    auth: false,
    revalidate: false,
  });
  setAuthTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data;
}

export async function fetchMe(token?: string): Promise<AuthUser | null> {
  try {
    return await apiGet<AuthUser>("/auth/me", {
      auth: token ?? true,
      revalidate: false,
    });
  } catch {
    return null;
  }
}

/** Exchange refresh token for a new access (+ refresh) pair. */
export async function refreshSession(): Promise<AuthLoginResult | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const data = await apiPost<AuthLoginResult>("/auth/refresh", {
      body: { refreshToken },
      auth: false,
      revalidate: false,
      skipAuthRefresh: true,
    });
    setAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiPost<null>("/auth/logout", { auth: true, revalidate: false });
  } catch {
    // ignore network/logout failures - clear local session anyway
  } finally {
    clearAuthTokens();
  }
}
