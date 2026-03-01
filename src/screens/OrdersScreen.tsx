import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "../services/api";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
        const res = await api.get("/orders/my");
        setOrders(res.data || []);
    } catch (e) {
      console.log("Erro orders:", e);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>Pedido #{item.id}</Text>
      <Text>Status: {item.status}</Text>

      <Text style={styles.address}>
        📍 {item.street}, {item.number} - {item.neighborhood}, {item.city}
      </Text>

      {(item.items ?? []).map((p: any) => (
        <View key={p.productId} style={styles.item}>
          <Text>
            {p.quantity}x {p.productName}
          </Text>
          <Text>R$ {Number(p.subtotal).toFixed(2)}</Text>
        </View>
      ))}

      <Text style={styles.total}>
        Total: R$ {Number(item.totalAmount).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F8F4" }}>
      <FlatList
        data={orders ?? []}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    marginBottom: 15
  },
  title: {
    fontWeight: "bold",
    color: "#4CAF50"
  },
  address: {
    marginTop: 6,
    color: "#555"
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  total: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "right"
  }
});