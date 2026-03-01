import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { CartContext } from "../context/CartContext";
import { api } from "../services/api";

export default function CartScreen() {
  const { items, clear } = useContext(CartContext);
  const [address, setAddress] = useState<any>(null);

  const navigation = useNavigation<any>();

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const res = await api.get("/users/me/address");
      setAddress(res.data);
    } catch (e) {
      console.log("Erro endereço:", e);
    }
  };

  const total = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const confirm = async () => {
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
        }))
      };

      const res = await api.post("/orders", payload);

      clear();

      navigation.replace("Orders");
    } catch (e) {
      console.log("Erro pedido:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seu pedido</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.productId.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>
              {item.quantity}x {item.name}
            </Text>
            <Text>
              R$ {(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        )}
      />

      {/* endereço */}
      {address && (
        <View style={styles.addressBox}>
          <Text style={styles.subtitle}>Entrega</Text>
          <Text>
            {address.street}, {address.number} -{" "}
            {address.neighborhood}, {address.city}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("EditAddress")}
          >
            <Text style={styles.edit}>Alterar endereço</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>

      <TouchableOpacity style={styles.confirm} onPress={confirm}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Confirmar pedido
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F1F8F4"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },

  addressBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 20
  },

  subtitle: {
    fontWeight: "bold",
    marginBottom: 5
  },

  edit: {
    color: "#2E7D32",
    marginTop: 10,
    fontWeight: "bold"
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20
  },

  confirm: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20
  }
});