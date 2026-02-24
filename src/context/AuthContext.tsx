import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../services/api";

interface AuthContextData {
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as any);

export const AuthProvider: React.FC<any> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        setAuthToken(storedToken);
        setToken(storedToken);

        try {
          const me = await api.get("/auth/me");
          setRole(me.data.role);
        } catch (e) {
          console.log("Erro restore token:", e);
          setToken(null);
        }
      }

      setLoading(false);
    };

    loadStorage();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("➡️ POST /auth/login");

      const res = await api.post(
        "/auth/login",
        JSON.stringify({ email, password }),
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ LOGIN RESPONSE:", res.data);

      const tk = res.data.token;

      setAuthToken(tk);
      setToken(tk);
      await AsyncStorage.setItem("token", tk);

      console.log("➡️ GET /auth/me");
      const me = await api.get("/auth/me");
      setRole(me.data.role);
    } catch (e) {
      console.log("❌ ERRO AUTH:", e);
      throw e;
    }
  };

  const logout = async () => {
    setToken(null);
    setRole(null);
    await AsyncStorage.removeItem("token");
  };

  if (loading) return <></>;

  return (
    <AuthContext.Provider value={{ token, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};