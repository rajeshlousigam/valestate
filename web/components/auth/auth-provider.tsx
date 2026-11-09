"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearSession, loadSession, saveSession, saveUser, setUnauthorizedHandler } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

export type { AuthUser };

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  /** Completes login after the OTP has been requested via api.requestLoginOtp. */
  verifyLogin: (phone: string, otp: string) => Promise<void>;
  setName: (name: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  verifyLogin: async () => {},
  setName: () => {},
  logout: async () => {},
});

/** Phone-OTP session; token + {name, phone} in localStorage, cleared on any 401. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // localStorage is browser-only, so the session is read after mount.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    setUser(loadSession());
    setLoading(false);
    return () => setUnauthorizedHandler(null);
  }, []);

  const verifyLogin = useCallback(async (phone: string, otp: string) => {
    const res = await api.verifyLoginOtp(phone, otp);
    saveSession(res.token, res.user);
    setUser(res.user);
  }, []);

  const setName = useCallback(
    (name: string) => {
      if (!user) return;
      const next = { ...user, name };
      saveUser(next);
      setUser(next);
    },
    [user],
  );

  const logout = useCallback(async () => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, verifyLogin, setName, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
