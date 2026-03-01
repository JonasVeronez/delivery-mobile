import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useContext, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { CartContext } from "../context/CartContext";
import { api } from "../services/api";

export default function CartScreen() {
  const { items, add, remove, clear } = useContext(CartContext);
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<any>(null);

  // 🔄 Atualiza sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      console.log("🔄 Buscando usuário...");
      const res = await api.get("/auth/me");

      console.log("👤 RESPONSE /auth/me:", res.data);
      console.log("🏠 ADDRESS:", res.data?.address);

      setUser(res.data);
    } catch (e) {
      console.log("❌ Erro ao buscar usuário:", e);
    }
  };

  const deliveryFee = 5;

  const productsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const finalTotal = productsTotal + deliveryFee;

  const handleFinish = () => {
    if (!user?.address) {
      Alert.alert("Atenção", "Adicione um endereço antes de finalizar.");
      return;
    }

    Alert.alert("Sucesso", "Pedido confirmado!");
    clear();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seu Pedido</Text>

      {items.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Seu carrinho está vazio
        </Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId.toString()}
            contentContainerStyle={{ paddingBottom: 250 }}
            renderItem={({ item }) => {
              const itemTotal = item.price * item.quantity;

              return (
                <View style={styles.card}>
                  <View style={styles.leftSide}>
                    <Image
                      source={{
                        uri: item.imageUrl?.replace(
                          "localhost",
                          "192.168.1.5"
                        )
                      }}
                      style={styles.img}
                    />

                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.unitPrice}>
                        Unit: R$ {item.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rightSide}>
                    <Text style={styles.itemTotal}>
                      R$ {itemTotal.toFixed(2)}
                    </Text>

                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => remove(item.productId)}
                      >
                        <Text style={styles.qtyText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyValue}>
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          add({
                            productId: item.productId,
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
                </View>
              );
            }}
          />

          {/* 📍 ENTREGA */}
          <View style={styles.deliveryBox}>
            <Text style={styles.deliveryTitle}>Entrega</Text>

            {user?.address ? (
              <>
                <Text style={styles.address}>
                  📍 {user.address.street}, {user.address.number} -{" "}
                  {user.address.neighborhood}, {user.address.city}
                </Text>

                <TouchableOpacity
                  style={styles.changeAddressBtn}
                  onPress={() => navigation.navigate("EditAddress")}
                >
                  <Text style={styles.changeAddressText}>
                    Alterar endereço
                  </Text>
                </TouchableOpacity>

                <View style={styles.row}>
                  <Text>Taxa de entrega</Text>
                  <Text>R$ {deliveryFee.toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <Text>Carregando endereço...</Text>
            )}
          </View>

          {/* 💰 TOTAL */}
          <View style={styles.footer}>
            <View style={styles.row}>
              <Text>Produtos</Text>
              <Text>R$ {productsTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Final</Text>
              <Text style={styles.totalValue}>
                R$ {finalTotal.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={handleFinish}
            >
              <Text style={styles.finishText}>
                Confirmar Pedido
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#F1F8F4"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },

  leftSide: {
    flexDirection: "row",
    alignItems: "center"
  },

  img: {
    width: 65,
    height: 65,
    resizeMode: "contain",
    marginRight: 10
  },

  name: {
    fontWeight: "bold",
    fontSize: 16
  },

  unitPrice: {
    color: "#666",
    marginTop: 4
  },

  rightSide: {
    alignItems: "flex-end"
  },

  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 6
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  qtyBtn: {
    backgroundColor: "#2E7D32",
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },

  qtyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },

  qtyValue: {
    marginHorizontal: 10,
    fontWeight: "bold",
    fontSize: 16
  },

  deliveryBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginTop: 10
  },

  deliveryTitle: {
    fontWeight: "bold",
    marginBottom: 6
  },

  address: {
    color: "#555",
    marginBottom: 8
  },

  changeAddressBtn: {
    marginBottom: 8
  },

  changeAddressText: {
    color: "#4CAF50",
    fontWeight: "bold"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4
  },

  footer: {
    marginTop: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15
  },

  totalLabel: {
    fontWeight: "bold",
    fontSize: 16
  },

  totalValue: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#2E7D32"
  },

  finishBtn: {
    marginTop: 15,
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center"
  },

  finishText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});