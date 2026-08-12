const ACCESS_TOKEN_KEY = "vesmart_access_token";
const REFRESH_TOKEN_KEY = "vesmart_refresh_token";

/** Cookie lifetime aligned with long-lived access (7 days). */
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
  document.cookie = `vesmart_access_token=${encodeURIComponent(tokens.accessToken)}; path=/; max-age=${ACCESS_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = "vesmart_access_token=; path=/; max-age=0; SameSite=Lax";
}
