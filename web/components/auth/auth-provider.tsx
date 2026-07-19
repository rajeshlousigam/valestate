"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { USE_API, api, setAccess, setRefresh } from "@/lib/api";

export type AuthUser = { id?: string; name: string; email: string; roles: string[] };
const DEMO_KEY = "ve_demo_user";

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, as: "buyer" | "owner", phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: boolean;
  isBuyer: boolean;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isOwner: false,
  isBuyer: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (USE_API) {
        try {
          const me = await api.me();
          setUser(me.data);
        } catch {
          setUser(null);
        }
      } else {
        try {
          const raw = localStorage.getItem(DEMO_KEY);
          if (raw) setUser(JSON.parse(raw));
        } catch {
          /* ignore */
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (USE_API) {
      const res = await api.login(email, password);
      setAccess(res.data.accessToken);
      setRefresh(res.data.refreshToken);
      setUser(res.data.user);
    } else {
      const raw = localStorage.getItem(DEMO_KEY);
      const stored = raw ? (JSON.parse(raw) as AuthUser) : null;
      const u = stored && stored.email === email.toLowerCase()
        ? stored
        : { name: email.split("@")[0], email: email.toLowerCase(), roles: ["buyer"] };
      localStorage.setItem(DEMO_KEY, JSON.stringify(u));
      setUser(u);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, as: "buyer" | "owner", phone?: string) => {
      if (USE_API) {
        const res = await api.register({ name, email, password, as, phone });
        setAccess(res.data.accessToken);
        setRefresh(res.data.refreshToken);
        setUser(res.data.user);
      } else {
        const u: AuthUser = { name, email: email.toLowerCase(), roles: [as] };
        localStorage.setItem(DEMO_KEY, JSON.stringify(u));
        setUser(u);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    if (USE_API) {
      await api.logout();
      setAccess(null);
      setRefresh(null);
    } else {
      localStorage.removeItem(DEMO_KEY);
    }
    setUser(null);
  }, []);

  const roles = user?.roles ?? [];
  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isOwner: roles.includes("owner"), isBuyer: roles.includes("buyer") }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
