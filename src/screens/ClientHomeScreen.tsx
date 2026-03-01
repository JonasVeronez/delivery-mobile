import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { api } from "../services/api";

export default function ClientHomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const { add, remove, getQty, items } = useContext(CartContext);
  const { logout } = useContext(AuthContext);

  const navigation = useNavigation<any>();

  useEffect(() => {
    loadUser();
    loadProducts();
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUserName(res?.data?.name || "");
    } catch (e) {
      console.log("Erro user:", e);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");

      const data = (res.data || []).filter(
        (p: any) => p.categoryName !== "Entrega"
      );

      setProducts(data);

      if (data.length) setCategory(data[0].categoryName);
    } catch (e) {
      console.log("Erro produtos:", e);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    ...new Set((products ?? []).map((p) => p.categoryName))
  ];

  const filtered = (products ?? []).filter(
    (p) => p.categoryName === category
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F8F4" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeText}>Bem-vindo, </Text>
          <Text style={styles.nameText}>{userName}</Text>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
          <Text style={{ fontSize: 18 }}>🚪</Text>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subtitleWrapper}>
        <Text style={styles.subtitle}>Escolha seus produtos</Text>
      </View>

      {/* CATEGORIAS */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(i) => i}
        style={{ maxHeight: 40 }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategory(item)}
            style={[
              styles.tab,
              item === category && styles.tabActive
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: item === category ? "#fff" : "#000" }
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* PRODUTOS */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 150 }}
        renderItem={({ item }) => {
          const qty = getQty(item.id);

          return (
            <View style={styles.card}>
              <Image
                source={{
                  uri:
                    item?.imageUrl?.replace("localhost", "192.168.1.5") ||
                    "https://via.placeholder.com/150"
                }}
                style={styles.img}
              />

              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.price}>
                R$ {Number(item.price).toFixed(2)}
              </Text>

              {/* CONTROLE SEMPRE VISÍVEL */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    { backgroundColor: qty === 0 ? "#ccc" : "#2E7D32" }
                  ]}
                  onPress={() => {
                    if (qty > 0) remove(item.id);
                  }}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{qty}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    add({
                      productId: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl 
                    })
                  }
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* BOTÃO CARRINHO */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartText}>
            Ver pedido ({items.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* PEDIDOS */}
      <TouchableOpacity
        style={styles.ordersBtn}
        onPress={() => navigation.navigate("Orders")}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Pedidos
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  welcomeRow: { flexDirection: "row", alignItems: "center" },

  welcomeText: { color: "#fff", fontSize: 22 },

  nameText: { color: "#fff", fontSize: 22, fontWeight: "bold" },

  subtitleWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20"
  },

  logoutIcon: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 12
  },

  logoutText: { color: "#fff", fontSize: 10, marginTop: 2 },

  tab: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginHorizontal: 4,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 16
  },

  tabActive: { backgroundColor: "#4CAF50" },

  tabText: { fontSize: 11, fontWeight: "600" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    padding: 10,
    borderRadius: 16
  },

  img: { width: "100%", height: 90, resizeMode: "contain" },

  name: { fontWeight: "bold", marginTop: 6 },

  price: { color: "#2E7D32", fontWeight: "bold" },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },

  qtyBtn: {
    backgroundColor: "#2E7D32",
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },

  qtyText: { color: "#fff", fontWeight: "bold", fontSize: 18 },

  qtyValue: { marginHorizontal: 10, fontWeight: "bold" },

  cartBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 14,
    alignItems: "center"
  },

  cartText: { color: "#fff", fontWeight: "bold" },

  ordersBtn: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20
  }
});