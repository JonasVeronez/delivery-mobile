import axios from "axios";

// Instância da API apontando para o backend remoto
export const api = axios.create({
  baseURL: "https://delivery-api-vuzo.onrender.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Função para setar o token JWT
export const setAuthToken = (token: string) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};