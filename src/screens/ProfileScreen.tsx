
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../services/api";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);

      const res = await api.get("/auth/me");

      setName(res?.data?.name || "");
      setEmail(res?.data?.email || "");
    } catch (e) {
      console.log("Erro ao carregar usuário:", e);
      Alert.alert("Erro", "Não foi possível carregar o perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload: any = {};

      if (name && name.trim() !== "") payload.name = name.trim();
      if (email && email.trim() !== "") payload.email = email.trim();

      // 🔥 Evita requisição vazia
      if (Object.keys(payload).length === 0) {
        Alert.alert("Atenção", "Nenhuma alteração foi feita");
        return;
      }

      await api.put("/users/me", payload);

      await loadUser(); // 🔥 atualiza dados locais

      Alert.alert(
        "Sucesso",
        "Perfil atualizado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack() // 🔥 volta para tela de produtos
          }
        ]
      );

    } catch (e: any) {
      console.log("Erro ao salvar:", e);

      const msg =
        e?.response?.data ||
        e?.message ||
        "Não foi possível atualizar o perfil";

      Alert.alert("Erro", msg);

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Digite seu nome"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Digite seu email"
      />

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F1F8F4"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1B5E20"
  },

  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333"
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff"
  },

  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  },

  secondaryButton: {
    marginTop: 12,
    alignItems: "center"
  },

  secondaryText: {
    color: "#2E7D32",
    fontWeight: "600"
  }
});

