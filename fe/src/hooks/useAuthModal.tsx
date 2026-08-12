"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthModalTab = "login" | "register";

type OpenAuthOptions = {
  tab?: AuthModalTab;
  next?: string;
};

type AuthModalContextValue = {
  open: boolean;
  tab: AuthModalTab;
  nextPath: string;
  openAuth: (options?: OpenAuthOptions | AuthModalTab) => void;
  closeAuth: () => void;
  setTab: (tab: AuthModalTab) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

function normalizeNext(raw?: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>("login");
  const [nextPath, setNextPath] = useState("/");

  const openAuth = useCallback((options?: OpenAuthOptions | AuthModalTab) => {
    if (typeof options === "string") {
      setTab(options);
      setNextPath("/");
    } else {
      setTab(options?.tab ?? "login");
      setNextPath(normalizeNext(options?.next));
    }
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo<AuthModalContextValue>(
    () => ({
      open,
      tab,
      nextPath,
      openAuth,
      closeAuth,
      setTab,
    }),
    [open, tab, nextPath, openAuth, closeAuth],
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}
