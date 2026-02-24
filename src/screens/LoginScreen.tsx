import React, { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    console.log("🔥 Botão login clicado");
    console.log("📧 Email:", email);
    console.log("🔒 Password:", password);

    try {
      setError("");

      console.log("🚀 Chamando login() do AuthContext...");
      await login(email, password);

      console.log("✅ Login realizado com sucesso");
    } catch (e: any) {
      console.log("❌ ERRO LOGIN:", e);

      if (e?.response) {
        console.log("📡 Resposta backend:", e.response.data);
        console.log("📡 Status:", e.response.status);
        setError(e?.response?.data?.message || "Erro backend");
      } else if (e?.request) {
        console.log("🌐 Erro de rede (request não respondeu)");
        setError("Erro de conexão com servidor");
      } else {
        console.log("⚠️ Erro desconhecido:", e.message);
        setError("Erro ao fazer login");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>DELIVERY APP</Text>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.box}>
          <Text style={styles.subtitle}>Acesse sua conta</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError("");
            }}
          />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          autoCorrect={false}
          autoComplete="off"
          importantForAutofill="no"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setError("");
          }}
        />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© JVIOT automation</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8F4",
  },

  header: {
    height: 180,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  logo: {
    color: "#E8F5E9",
    fontSize: 14,
    letterSpacing: 2,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 6,
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  box: {
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 28,
    paddingBottom: 28,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  subtitle: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    color: "#1B5E20",
    fontSize: 16,
    fontWeight: "600",
  },

  error: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 14,
    marginTop: 6,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 15,
    color: "#000",
  },

  button: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footer: {
    paddingTop: 10,
    paddingBottom: 35,
    alignItems: "center",
    backgroundColor: "#F1F8F4",
  },

  footerText: {
    color: "#999",
    fontSize: 12,
  },
});