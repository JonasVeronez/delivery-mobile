import axios from "axios";

// 🔥 Instância da API
export const api = axios.create({
  baseURL: "http://31.97.172.143:8081",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔐 SET TOKEN GLOBAL
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("🔑 Token aplicado no axios");
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("🚫 Token removido");
  }
};


// 🔥 INTERCEPTOR DE REQUEST (DEBUG)
api.interceptors.request.use(
  (config) => {
    console.log("📡 REQUEST:", config.method?.toUpperCase(), config.url);

    if (config.headers?.Authorization) {
      console.log("🔑 Authorization:", config.headers.Authorization);
    } else {
      console.log("⚠️ Sem token na requisição");
    }

    return config;
  },
  (error) => {
    console.log("❌ Erro no request:", error);
    return Promise.reject(error);
  }
);


// 🔥 INTERCEPTOR DE RESPONSE (EVITA LOGOUT ERRADO)
api.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log("❌ RESPONSE ERROR:", error.response.config.url);
      console.log("📛 Status:", error.response.status);

      // 🚨 IMPORTANTE: NÃO deslogar automaticamente aqui
      if (error.response.status === 401) {
        console.log("⚠️ 401 recebido (token inválido ou não enviado)");
      }

    } else if (error.request) {
      console.log("🌐 Erro de rede (sem resposta do servidor)");
    } else {
      console.log("❌ Erro desconhecido:", error.message);
    }

    return Promise.reject(error);
  }
);