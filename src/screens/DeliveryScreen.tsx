import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function DeliveryScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [myLocation, setMyLocation] = useState<any>(null);

  const { logout } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  useEffect(() => {
    load();
    getMyLocation();
  }, []);

  const load = async () => {
    try {
      const res = await api.get("/orders/delivery/queue");

      const enriched = await Promise.all(
        res.data.map(async (order: any) => {

          // ⭐ MELHOR CORREÇÃO — REMOVER BAIRRO
          const address = `${order.street}, ${order.number}, ${order.city}, MG, Brasil`;

          try {
            const geo = await Location.geocodeAsync(address);

            if (geo.length > 0) {
              return {
                ...order,
                deliveryLocation: {
                  latitude: geo[0].latitude,
                  longitude: geo[0].longitude
                }
              };
            }

            // ⭐ FALLBACK — cidade
            const cityGeo = await Location.geocodeAsync(`${order.city}, MG, Brasil`);

            if (cityGeo.length > 0) {
              return {
                ...order,
                deliveryLocation: {
                  latitude: cityGeo[0].latitude,
                  longitude: cityGeo[0].longitude
                }
              };
            }

          } catch (e) {
            console.log("Erro geocode:", e);
          }

          return order;
        })
      );

      setOrders(enriched);
    } catch (e) {
      console.log("Erro fila:", e);
    }
  };

  const getMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setMyLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    });
  };

  const confirmFinish = (id: number) => {
    Alert.alert("Finalizar", "Confirmar?", [
      { text: "Cancelar" },
      {
        text: "OK",
        onPress: async () => {
          await api.put(`/orders/${id}/finish`);
          load();
        }
      }
    ]);
  };

  const handleBack = async () => {
    await logout();
    navigation.replace("Login");
  };

  const renderItem = ({ item, index }: any) => {
    const isCurrent = index === 0;

    return (
      <View style={[styles.card, isCurrent && styles.currentCard]}>
        <Text style={styles.orderNumber}>Pedido #{item.id}</Text>
        <Text style={styles.name}>{item.customerName}</Text>

        <Text style={styles.info}>
          📍 {item.street}, {item.number} - {item.neighborhood}, {item.city}
        </Text>

        {myLocation && (
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              region={{
                latitude:
                  item.deliveryLocation?.latitude || myLocation.latitude,
                longitude:
                  item.deliveryLocation?.longitude || myLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
            >
              <Marker coordinate={myLocation} pinColor="green" title="Motoboy" />

              {item.deliveryLocation && (
                <Marker
                  coordinate={item.deliveryLocation}
                  pinColor="red"
                  title="Entrega"
                />
              )}
            </MapView>
          </View>
        )}

        {item.items.map((p: any) => (
          <View key={p.productId} style={styles.item}>
            <Text>
              {p.quantity}x {p.productName}
            </Text>
            <Text>R$ {Number(p.subtotal).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={styles.total}>
          Total: R$ {Number(item.totalAmount || 0).toFixed(2)}
        </Text>

        {isCurrent ? (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => confirmFinish(item.id)}
          >
            <Text style={styles.finishText}>FINALIZAR</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.wait}>Aguardando</Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F8F4" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas entregas</Text>

        <View style={{ flexDirection: "row", gap: 10, margin: 10 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={load}>
            <Text style={{ color: "#fff" }}>Atualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleBack}>
            <Text style={{ color: "#fff" }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 110,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  refreshBtn: { backgroundColor: "#1B5E20", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  logoutBtn: { backgroundColor: "#2E7D32", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 18, marginBottom: 15, overflow: "hidden" },
  currentCard: { borderWidth: 2, borderColor: "#4CAF50" },
  orderNumber: { fontWeight: "bold", color: "#4CAF50" },
  name: { fontSize: 18, fontWeight: "bold" },
  info: { color: "#555" },
  mapWrapper: { marginTop: 10, borderRadius: 12, overflow: "hidden" },
  map: { height: 180 },
  item: { flexDirection: "row", justifyContent: "space-between" },
  total: { marginTop: 10, fontWeight: "bold", fontSize: 16, color: "#2E7D32", textAlign: "right" },
  finishButton: { marginTop: 15, backgroundColor: "#2E7D32", padding: 15, borderRadius: 12, alignItems: "center" },
  finishText: { color: "#fff", fontWeight: "bold" },
  wait: { color: "gray", marginTop: 10 }
});