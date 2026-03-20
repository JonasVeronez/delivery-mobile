import axios from "axios";

// Instância da API
export const api = axios.create({
  baseURL: "https://delivery-api-production-f20f.up.railway.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔥 Função corrigida (aceita null)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

