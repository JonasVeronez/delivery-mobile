import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

const GOOGLE_KEY = "SUA_GOOGLE_API_KEY";

export default function DeliveryScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [customerCoords, setCustomerCoords] = useState<any>({});
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation<any>();
  const watchRef = useRef<any>(null);

  const load = async () => {
    try {
      const res = await api.get("/orders/delivery/queue");
      setOrders(res.data);
    } catch (e) {
      console.log("Erro ao carregar fila:", e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ⭐ GPS realtime
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => setDriverLocation(location.coords)
      );
    })();

    return () => watchRef.current?.remove();
  }, []);

  // ⭐ GEOCODING ENDEREÇO → COORDS
  useEffect(() => {
    const geocodeAll = async () => {
      const map: any = {};

      for (const o of orders) {
        const address = `${o.street}, ${o.number}, ${o.city}, Brazil`;

        try {
          const geo = await Location.geocodeAsync(address);
          if (geo.length > 0) {
            map[o.id] = {
              latitude: geo[0].latitude,
              longitude: geo[0].longitude,
            };
          }
        } catch (e) {
          console.log("Erro geocode:", e);
        }
      }

      setCustomerCoords(map);
    };

    if (orders.length) geocodeAll();
  }, [orders]);

  const handleBack = async () => {
    await logout();
    navigation.replace("Login");
  };

  const confirmFinish = (id: number) => {
    Alert.alert(
      "Finalizar entrega",
      "Tem certeza que deseja finalizar esta entrega?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.put(`/orders/${id}/finish`);
              load();
            } catch {
              Alert.alert("Erro", "Não foi possível finalizar");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }: any) => {
    const isCurrent = index === 0;
    const customerLocation = customerCoords[item.id];

    return (
      <View style={[styles.card, isCurrent && styles.currentCard]}>
        <Text style={styles.orderNumber}>Pedido #{item.id}</Text>
        <Text style={styles.name}>{item.customerName}</Text>

        <Text style={styles.deliveryAddress}>
          📍 Entrega: {item.street}, {item.number} - {item.neighborhood}
        </Text>

        <Text style={styles.city}>🏙 {item.city}</Text>

        {driverLocation && customerLocation && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={driverLocation} title="Motoboy" />
            <Marker coordinate={customerLocation} title="Cliente" pinColor="green" />

            <MapViewDirections
              origin={driverLocation}
              destination={customerLocation}
              apikey={GOOGLE_KEY}
              strokeWidth={4}
              strokeColor="#2E7D32"
            />
          </MapView>
        )}

        <Text style={styles.total}>
          Total: R$ {Number(item.totalAmount || 0).toFixed(2)}
        </Text>

        {isCurrent ? (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => confirmFinish(item.id)}
          >
            <Text style={styles.finishText}>FINALIZAR ENTREGA</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.wait}>Aguardando entrega anterior</Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F8F4" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas entregas</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={load}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Atualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleBack}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Voltar</Text>
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
    borderBottomRightRadius: 30,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },

  refreshBtn: {
    backgroundColor: "#1B5E20",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  logoutBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  card: { backgroundColor: "#fff", padding: 20, borderRadius: 18, marginBottom: 15 },
  currentCard: { borderWidth: 2, borderColor: "#4CAF50" },
  orderNumber: { fontWeight: "bold", color: "#4CAF50" },
  name: { fontSize: 18, fontWeight: "bold" },

  deliveryAddress: { marginTop: 5, color: "#444", fontWeight: "600" },
  city: { color: "#777", marginBottom: 5 },

  map: { height: 220, borderRadius: 12, marginTop: 10 },

  total: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "right",
  },

  finishButton: {
    marginTop: 15,
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  finishText: { color: "#fff", fontWeight: "bold" },
  wait: { color: "gray", marginTop: 10 },
});