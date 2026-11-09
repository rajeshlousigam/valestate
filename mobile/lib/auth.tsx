/**
 * Phone-OTP auth against the Estara API. The bearer token + {name, phone}
 * returned by verifyloginotp persist in expo-secure-store; any 401 on an
 * authenticated call clears the session (see api.setUnauthorizedHandler).
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearSession, loadSession, saveSession, saveUser, setUnauthorizedHandler } from "./api";
import { queryClient } from "./query";
import type { AuthUser } from "./types";

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  /** Completes login after the OTP has been requested via api.requestLoginOtp. */
  verifyLogin: (phone: string, otp: string) => Promise<void>;
  setName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  verifyLogin: async () => {},
  setName: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      queryClient.removeQueries({ queryKey: ["history"] });
    });
    loadSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    return () => setUnauthorizedHandler(null);
  }, []);

  const verifyLogin = useCallback(async (phone: string, otp: string) => {
    const res = await api.verifyLoginOtp(phone, otp);
    await saveSession(res.token, res.user);
    setUser(res.user);
  }, []);

  const setName = useCallback(
    async (name: string) => {
      if (!user) return;
      const next = { ...user, name };
      await saveUser(next);
      setUser(next);
    },
    [user],
  );

  const logout = useCallback(async () => {
    await clearSession();
    queryClient.removeQueries({ queryKey: ["history"] });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, verifyLogin, setName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
