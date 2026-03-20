
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../services/api";

interface AuthContextData {
  token: string | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as any);

export const AuthProvider: React.FC<any> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");

        if (storedToken) {
          console.log("🔄 Restaurando sessão...");

          setAuthToken(storedToken);
          setToken(storedToken);
          setIsAuthenticated(true);

          // 🔥 tenta buscar role, mas NÃO trava app se falhar
          try {
            const me = await api.get("/auth/me");
            setRole(me.data.role);
            console.log("✅ Sessão restaurada");
          } catch (e) {
            console.log("⚠️ Erro ao buscar /auth/me (ignorando)");
          }
        }
      } catch (e) {
        console.log("❌ Erro ao restaurar token:", e);
      } finally {
        setLoading(false);
      }
    };

    loadStorage();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("➡️ POST /auth/login");

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const tk = res.data.token;

      console.log("🔐 Token recebido");

      setAuthToken(tk);
      await AsyncStorage.setItem("token", tk);

      setToken(tk);
      setIsAuthenticated(true);

      // 🔥 tenta pegar role (sem travar login)
      try {
        const me = await api.get("/auth/me");
        setRole(me.data.role);
      } catch (e) {
        console.log("⚠️ Erro ao buscar role (ignorando)");
      }

      console.log("✅ Login concluído");
    } catch (e) {
      console.log("❌ ERRO AUTH:", e);
      throw e;
    }
  };

  const logout = async () => {
    console.log("🚪 Logout");

    setToken(null);
    setRole(null);
    setIsAuthenticated(false);

    await AsyncStorage.removeItem("token");
    setAuthToken(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

