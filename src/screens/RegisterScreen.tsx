import React, { useContext, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function RegisterScreen() {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cpf: "",
    street: "",
    number: "",
    neighborhood: "",
    city: ""
  });

  const [error, setError] = useState("");

  const register = async () => {
    try {
      setError("");

      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        cpf: form.cpf,
        role: "CLIENT",
        address: {
          street: form.street,
          number: form.number,
          neighborhood: form.neighborhood,
          city: form.city
        }
      });

      // ⭐ login automático
      await login(form.email, form.password);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erro cadastro");
    }
  };

  const input = (key: string, value: string) =>
    setForm({ ...form, [key]: value });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>DELIVERY APP</Text>
        <Text style={styles.headerTitle}>Cadastro</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.box}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {[
            "name",
            "email",
            "password",
            "phone",
            "cpf",
            "street",
            "number",
            "neighborhood",
            "city"
          ].map((k) => (
            <TextInput
              key={k}
              placeholder={k}
              style={styles.input}
              secureTextEntry={k === "password"}
              value={(form as any)[k]}
              onChangeText={(t) => input(k, t)}
            />
          ))}

          <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>CADASTRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8F4" },
  header: {
    height: 180,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35
  },
  logo: { color: "#E8F5E9", fontSize: 14 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  content: { flex: 1, padding: 20, justifyContent: "center" },
  box: { backgroundColor: "#fff", padding: 28, borderRadius: 18 },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
    padding: 14,
    borderRadius: 12
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", textAlign: "center" }
});