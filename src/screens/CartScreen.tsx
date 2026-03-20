import { Picker } from "@react-native-picker/picker";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CartContext } from "../context/CartContext";
import { api } from "../services/api";

export default function CartScreen() {
  const insets = useSafeAreaInsets();

  const { items, add, remove, clear } = useContext(CartContext);
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [deliveryProduct, setDeliveryProduct] = useState<any>(null);
  const [stockMap, setStockMap] = useState<any>({});

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadDeliveryProduct();
      loadStock();
    }, [])
  );

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const loadStock = async () => {
    try {
      const res = await api.get("/products");
      const map: any = {};
      res.data.forEach((p: any) => {
        map[p.id] = p.stock ?? 0;
      });
      setStockMap(map);
    } catch (e) {
      console.log(e);
    }
  };

  const loadDeliveryProduct = async () => {
    try {
      const res = await api.get("/products");
      const entrega = res.data.find(
        (p: any) => p.name.toLowerCase() === "entrega"
      );

      setDeliveryProduct(entrega);

      if (!items.find(i => i.productId === entrega.id)) {
        add({
          productId: entrega.id,
          name: entrega.name,
          price: entrega.price,
          imageUrl: entrega.imageUrl
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleClearCart = () => {
    Alert.alert("Limpar tudo?", "Deseja remover todos os itens?", [
      { text: "Cancelar" },
      {
        text: "Limpar",
        onPress: () => {
          clear();
          navigation.goBack();
        }
      }
    ]);
  };

  const handleContinueShopping = () => {
    navigation.goBack();
  };

  const productsOnly = items.filter(
    (item) => item.name.toLowerCase() !== "entrega"
  );

  const productsTotal = productsOnly.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalWithDelivery =
    productsTotal + (deliveryProduct?.price || 0);

  const handleFinish = () => {
    if (!user?.address)
      return Alert.alert(
        "Endereço não encontrado",
        "Adicione um endereço antes de continuar."
      );

    if (!paymentMethod)
      return Alert.alert(
        "Pagamento não selecionado",
        "Escolha uma forma de pagamento."
      );

    if (productsOnly.length === 0)
      return Alert.alert(
        "Carrinho vazio",
        "Adicione produtos antes de continuar."
      );

    const endereco = `${user.address.street}, ${user.address.number} - ${user.address.neighborhood}, ${user.address.city}`;

    Alert.alert(
      "Confirmar Pedido",
      `📍 Endereço de entrega:\n${endereco}\n\n🛒 Total do pedido:\nR$ ${totalWithDelivery.toFixed(
        2
      )}\n\nDeseja finalizar seu pedido?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Pedido",
          onPress: () => {
            console.log("Pedido confirmado");
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => {
    const stock = stockMap[item.productId] ?? 0;

    return (
      <View style={styles.card}>
        <View style={styles.leftSide}>
          <View style={styles.imgContainer}>
            <Image
              source={{
                uri: item.imageUrl?.replace("localhost", "192.168.1.5")
              }}
              style={styles.img}
            />
          </View>

          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.unitPrice}>
              Unit: R${item.price.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.rightSide}>
          <Text style={styles.itemTotal}>
            R$ {(item.price * item.quantity).toFixed(2)}
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
              style={[
                styles.qtyBtn,
                item.quantity >= stock && { backgroundColor: "#ccc" }
              ]}
              onPress={() => {
                if (item.quantity >= stock) {
                  Alert.alert("Limite", `Máx: ${stock}`);
                  return;
                }
                add({
                  productId: item.productId,
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top - 20 }]}>
          <Text style={styles.title}>Finalizar seu Pedido</Text>

          <TouchableOpacity
            onPress={handleClearCart}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Limpar tudo</Text>
          </TouchableOpacity>
        </View>

        {/* PRODUTOS */}
        <View style={styles.productsCard}>
                    <Text style={styles.productsTitle}>
            Seus produtos
          </Text>

          {/* 🔥 SOMENTE A LISTA TEM BORDA */}
          <View style={styles.innerContainer}>
            <FlatList
              data={productsOnly}
              extraData={stockMap}
              keyExtractor={(item) => item.productId.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator

              contentContainerStyle={{ paddingBottom: 10 , paddingTop: 10, paddingRight: 10,paddingLeft: -1}}
            />
          </View>

          {/* 🔥 BOTÃO FORA DA BORDA */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinueShopping}
          >
            <Text style={styles.continueText}>
              + Adicionar mais itens
            </Text>
          </TouchableOpacity>

        </View>
        {/* FINAL */}
        <View style={[styles.finalCard, { paddingBottom: 15 + insets.bottom }]}>
          {user?.address && (
            <View style={styles.addressBox}>
              <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
              <Text style={styles.addressText}>
                {user.address.street}, {user.address.number} -{" "}
                {user.address.neighborhood}, {user.address.city}
              </Text>

              <TouchableOpacity
                style={styles.editAddressBtn}
                onPress={() => navigation.navigate("EditAddress")}
              >
                <Text style={styles.editAddressText}>Alterar endereço</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.paymentBox}>
            <Text style={styles.sectionTitle}>Forma de Pagamento</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value)}
              >
                <Picker.Item label="Selecione..." value={null} />
                <Picker.Item label="PIX" value="PIX" />
                <Picker.Item label="Dinheiro" value="CASH" />
                <Picker.Item label="Cartão de Crédito" value="CREDIT_CARD" />
                <Picker.Item label="Cartão de Débito" value="DEBIT_CARD" />
              </Picker>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Produtos</Text>
              <Text style={styles.totalValue}>
                R$ {productsTotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.totalLabel}>Entrega</Text>
              <Text style={styles.totalValue}>
                R$ {deliveryProduct?.price.toFixed(2)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                R$ {totalWithDelivery.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
              <Text style={styles.finishText}>Confirmar Pedido</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#739074" },
  container: { flex: 1, paddingHorizontal: 16, marginTop: 15 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingBottom: 10,
    paddingHorizontal: 16,
    elevation: 4
  },
  productsTitle: {
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center", // 👈 centraliza
    marginBottom: 5,
    color: "#2E7D32", // 👈 cor do seu tema
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff"
  },

  clearButton: {
    backgroundColor: "#e35555",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  innerSpacing: {
  height: 10
},

  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13
  },

  continueBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center"
  },

  continueText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14
  },

  productsCard: {
    flex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    elevation: 4
  },

  finalCard: {
    maxHeight: "50%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    elevation: 4
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
        marginTop: 1
  },
  innerContainer: {
    flex: 1, // 👈 VOLTA ISSO
    borderWidth: 1,
    borderColor: "#0e0c0c",
    borderRadius: 14,
    padding: 4,
    backgroundColor: "#fff"
  },
  leftSide: { flexDirection: "row", alignItems: "center" },

  imgContainer: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: "#e9e9e900",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden"
  },

  img: {
    width: "90%",
    height: "90%",
    resizeMode: "contain"
  },

  name: { fontWeight: "bold", fontSize: 15 },
  unitPrice: { color: "#666", marginTop: 2 },

  rightSide: { alignItems: "flex-end" },

  itemTotal: { fontWeight: "bold", color: "#2E7D32", marginBottom: 6 },

  qtyRow: { flexDirection: "row", alignItems: "center" },

  qtyBtn: {
    backgroundColor: "#2E7D32",
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },

  qtyText: { color: "#fff", fontWeight: "bold" },
  qtyValue: { marginHorizontal: 10 },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 15
  },

  addressBox: { marginBottom: 10 },
  addressText: { marginBottom: 6 },

  editAddressBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F1F8F4",
    elevation: 2
  },

  editAddressText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13
  },

  paymentBox: { marginBottom: 10 },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden"
  },

  footer: {},

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },

  totalLabel: { fontWeight: "bold" },
  totalValue: { color: "#2E7D32", fontWeight: "bold" },

  finishBtn: {
    marginTop: 12,
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6
  },

  finishText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});