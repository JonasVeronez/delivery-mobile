import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useContext, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
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
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [deliveryProduct, setDeliveryProduct] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadDeliveryProduct();
    }, [])
  );

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (e) {
      console.log("Erro ao buscar usuário:", e);
    }
  };

  const loadDeliveryProduct = async () => {
    try {
      const res = await api.get("/products");
      const entrega = res.data.find(
        (p: any) => p.name.toLowerCase() === "entrega"
      );
      setDeliveryProduct(entrega);

      const alreadyInCart = items.find((item) => item.productId === entrega.id);
      if (!alreadyInCart) {
        add({
          productId: entrega.id,
          name: entrega.name,
          price: entrega.price,
          imageUrl: entrega.imageUrl
        });
      }
    } catch (e) {
      console.log("Erro ao buscar produto entrega", e);
    }
  };

  const productsOnly = items.filter((item) => item.name.toLowerCase() !== "entrega");

  const productsTotal = productsOnly.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalWithDelivery = productsTotal + (deliveryProduct?.price || 0);

    // Função que realmente envia o pedido
  const sendOrder = async () => {
    try {
      const payload = {
        paymentMethod: paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      await api.post("/orders", payload);

      clear();

      Alert.alert(
        "Sucesso",
        "Pedido confirmado!",
        [
          {
            text: "Ver Pedidos",
            onPress: () => navigation.navigate("Orders")
          }
        ]
      );

    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível finalizar o pedido.");
    }
  };

  // Função que solicita a confirmação extra
  const handleFinish = () => {
    if (!user?.address) {
      Alert.alert("Atenção", "Adicione um endereço antes de finalizar.");
      return;
    }

    if (!paymentMethod) {
      Alert.alert("Atenção", "Selecione um método de pagamento.");
      return;
    }

    if (productsOnly.length === 0) {
      Alert.alert("Atenção", "Adicione produtos ao carrinho.");
      return;
    }

    // Segunda confirmação
    Alert.alert(
      "Confirme seu pedido",
      "Clique em 'Enviar Pedido' para confirmar seu pedido.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Enviar Pedido", onPress: sendOrder }
      ]
    );
  };

  const renderItem = ({ item }: any) => {
    const itemTotal = item.price * item.quantity;

    return (
      <View style={styles.card}>
        <View style={styles.leftSide}>
          <Image
            source={{
              uri: item.imageUrl?.replace("localhost", "192.168.1.5")
            }}
            style={styles.img}
          />
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.unitPrice}>Unit: R${item.price.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.rightSide}>
          <Text style={styles.itemTotal}>R$ {itemTotal.toFixed(2)}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => remove(item.productId)}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{item.quantity}</Text>

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
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Seu Pedido</Text>
        </View>

        {productsOnly.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Seu carrinho está vazio
          </Text>
        ) : (
          <>
            {/* LISTA DE PRODUTOS */}
            <View style={styles.productsListBox}>
              <FlatList
                data={productsOnly}
                keyExtractor={(item) => item.productId.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator={true}
              />
            </View>

            {/* ENDEREÇO */}
            {user?.address && (
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>Endereço de Entrega:</Text>
                <Text style={styles.addressText}>
                  {user.address.street}, {user.address.number} - {user.address.neighborhood}, {user.address.city}
                </Text>
                <TouchableOpacity
                  style={styles.editAddressBtn}
                  onPress={() => navigation.navigate("EditAddress")}
                >
                  <Text style={styles.editAddressText}>Alterar endereço</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PAGAMENTO */}
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>Forma de Pagamento</Text>
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

            {/* TOTAL + ENTREGA + BOTÃO */}
            <View style={styles.footer}>
              <View style={styles.row}>
                <Text style={styles.totalLabel}>Produtos:</Text>
                <Text style={styles.totalValue}>R$ {productsTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.totalLabel}>Entrega:</Text>
                <Text style={styles.totalValue}>R$ {deliveryProduct?.price.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.totalLabel}>Total Final:</Text>
                <Text style={styles.totalValue}>R$ {totalWithDelivery.toFixed(2)}</Text>
              </View>

              <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                <Text style={styles.finishText}>Confirmar Pedido</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F1F8F4" },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 10 },
  backArrow: { fontSize: 42, marginRight: 10 },
  title: { fontSize: 22, fontWeight: "bold", flex: 1, textAlign: "center", marginRight: 42 },

  productsListBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    maxHeight: 250
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  leftSide: { flexDirection: "row", alignItems: "center" },
  img: { width: 65, height: 65, resizeMode: "contain", marginRight: 10 },
  name: { fontWeight: "bold", fontSize: 16 },
  unitPrice: { color: "#666", marginTop: 4 },
  rightSide: { alignItems: "flex-end" },
  itemTotal: { fontSize: 16, fontWeight: "bold", color: "#2E7D32", marginBottom: 6 },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { backgroundColor: "#2E7D32", width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  qtyText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  qtyValue: { marginHorizontal: 10, fontWeight: "bold", fontSize: 16 },

  addressBox: { backgroundColor: "#fff", padding: 15, borderRadius: 15, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  addressLabel: { fontWeight: "bold", marginBottom: 5 },
  addressText: { marginBottom: 8 },
  editAddressBtn: { backgroundColor: "#4CAF50", padding: 8, borderRadius: 8, alignItems: "center" },
  editAddressText: { color: "#fff", fontWeight: "bold" },

  paymentBox: { backgroundColor: "#fff", padding: 15, borderRadius: 15, marginTop: 10 },
  paymentTitle: { fontWeight: "bold", marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, overflow: "hidden" },

  footer: { marginTop: 15, backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 25 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  totalLabel: { fontWeight: "bold", fontSize: 16 },
  totalValue: { fontWeight: "bold", fontSize: 18, color: "#2E7D32" },
  finishBtn: { marginTop: 15, backgroundColor: "#4CAF50", padding: 16, borderRadius: 12, alignItems: "center" },
  finishText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});