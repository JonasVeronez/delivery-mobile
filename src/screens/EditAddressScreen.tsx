import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { api } from "../services/api";

export default function EditAddressScreen({ navigation }: any) {
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    loadCurrentAddress();
  }, []);

  const loadCurrentAddress = async () => {
    try {
      console.log("🔄 Buscando endereço atual...");
      const res = await api.get("/auth/me");

      console.log("👤 USER:", res.data);

      if (res.data?.address) {
        setStreet(res.data.address.street || "");
        setNumber(res.data.address.number || "");
        setNeighborhood(res.data.address.neighborhood || "");
        setCity(res.data.address.city || "");
      }
    } catch (e) {
      console.log("❌ Erro ao buscar endereço:", e);
    }
  };

  const handleSave = async () => {
    try {
      console.log("💾 Salvando endereço...");

      await api.put("/users/me/address", {
        street,
        number,
        neighborhood,
        city
      });

      Alert.alert("Sucesso", "Endereço atualizado!");
      navigation.goBack();
    } catch (e) {
      console.log("❌ Erro update address:", e);
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Editar endereço</Text>

      <TextInput
        style={styles.input}
        placeholder="Rua"
        value={street}
        onChangeText={setStreet}
      />

      <TextInput
        style={styles.input}
        placeholder="Número"
        value={number}
        onChangeText={setNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={neighborhood}
        onChangeText={setNeighborhood}
      />

      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={city}
        onChangeText={setCity}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>SALVAR</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8F4",
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2E7D32"
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 14,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FAFAFA"
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});