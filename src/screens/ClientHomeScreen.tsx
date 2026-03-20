import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { api } from "../services/api";

export default function ClientHomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const { add, remove, getQty, items } = useContext(CartContext);
  const { logout } = useContext(AuthContext);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const confirmLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout }
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadProducts();
    }, [])
  );

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUserName(res?.data?.name || "");
    } catch (e) {
      console.log("Erro user:", e);
    }
  };

const loadProducts = async (selectedCategory?: string) => {
  try {
    setLoading(true);

    const res = await api.get("/products");

    const data = (res.data || [])
      .filter((p: any) => p.categoryName !== "Entrega")
      .filter((p: any) => (p.stock ?? 0) > 0);

    setProducts(data);

    // 🔥 atualiza categoria corretamente
    if (selectedCategory) {
      setCategory(selectedCategory);
    } else if (!data.find((p: any) => p.categoryName === category)) {
      setCategory(data[0]?.categoryName || "");
    }

  } catch (e) {
    console.log("Erro produtos:", e);
  } finally {
    setLoading(false);
  }
};

  const categories = [
    ...new Set((products ?? []).map((p) => p.categoryName))
  ].sort((a, b) => a.localeCompare(b));

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F1F8F4" }}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Olá, <Text style={styles.userName}>{userName}</Text>
          </Text>

          <Text style={styles.headerSubtitle}>
            O que você quer pedir hoje?
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.profileBtn}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* MENU */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Profile");
              }}
            >
              <Text>✏️</Text>
              <Text style={styles.menuText}>Editar perfil</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                confirmLogout();
              }}
            >
              <Text>🚪</Text>
              <Text style={[styles.menuText, { color: "#D32F2F" }]}>
                Sair da conta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TÍTULO */}
      <View style={styles.subtitleWrapper}>
        <Text style={styles.subtitle}>Escolha seus produtos</Text>
      </View>

      {/* 🔥 FITA DE CATEGORIAS */}
      <View style={styles.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(i) => i}
          style={{ maxHeight: 60 }}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 6
          }}
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
      </View>

      {/* PRODUTOS */}
      <FlatList
        data={filtered}
        extraData={{ items, category }}
        keyExtractor={(i) => i.id.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 200, paddingTop: 10 }}
        renderItem={({ item }) => {
          const qty = getQty(item.id);
          const stock = item.stock ?? 0;

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

              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.price}>
                R$ {Number(item.price).toFixed(2)}
              </Text>

              <Text style={styles.stock}>
                Disponível: {stock}
              </Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    { backgroundColor: qty === 0 ? "#ccc" : "#2E7D32" }
                  ]}
                  onPress={() => qty > 0 && remove(item.id)}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{qty}</Text>

                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    qty >= stock && { backgroundColor: "#ccc" }
                  ]}
                  onPress={() => {
                    if (qty >= stock) {
                      Alert.alert("Limite atingido", `Máximo ${stock}`);
                      return;
                    }

                    add({
                      productId: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl
                    });
                  }}
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
          style={[styles.cartBtn, { bottom: insets.bottom + 10 }]}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartText}>
            Ver pedido ({items.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* PEDIDOS */}
      <TouchableOpacity
        style={[styles.ordersBtn, { bottom: insets.bottom + 80 }]}
        onPress={() => navigation.navigate("Orders")}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Pedidos
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6
  },

  greeting: {
    color: "#E8F5E9",
    fontSize: 26
  },

  userName: {
    color: "#a6fd6f",
    fontWeight: "bold"
  },

  headerSubtitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 6
  },

  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: "#0f712b",
    alignItems: "center",
    justifyContent: "center"
  },

  profileIcon: {
    fontSize: 20,
    color: "#fff"
  },

  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end"
  },

  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)"
  },

  menuBox: {
    marginTop: 90,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 200,
    elevation: 10
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#eee"
  },

  menuText: {
    marginLeft: 10,
    fontSize: 15
  },

  subtitleWrapper: {
    paddingTop: 6,
    paddingBottom: 6,
    alignItems: "center"
  },

  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20"
  },

    // 🔥 FITA
  categoryBar: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,

    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",

    elevation: 4, // 🔥 sombra Android
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,

    backgroundColor: "#F1F8F4", // 🔥 mais suave
    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#111311",

    minWidth: 90,
    alignItems: "center"
  },
  tabActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50"
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600"
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },

  img: {
    width: "100%",
    height: 130,
    borderRadius: 14,
    marginBottom: 10,
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },

  name: {
    fontSize: 14,
    fontWeight: "600"
  },

  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20"
  },

  stock: {
    fontSize: 11,
    color: "#888"
  },

  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },

  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center"
  },

  qtyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },

  qtyValue: {
    fontSize: 16,
    fontWeight: "bold"
  },

  cartBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 16,
    alignItems: "center"
  },

  cartText: {
    color: "#fff",
    fontWeight: "bold"
  },

  ordersBtn: {
    position: "absolute",
    right: 20,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 50
  }
});