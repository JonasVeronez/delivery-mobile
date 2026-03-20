/*
Copyright © 2026
JVIOT - Automação
*/

import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../services/api";

export default function OrdersScreen() {

  const [orders, setOrders] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const mapRefs = useRef<{ [key: string]: MapView | null }>({});

  useEffect(() => {

    loadOrders();

    const interval = setInterval(loadOrders, 15000);

    return () => clearInterval(interval);

  }, []);

  const loadOrders = async () => {

    try {

      const res = await api.get("/orders/my");

      console.log("Pedidos recebidos:", res.data);

      const filtered = (res.data || []).filter((o: any) =>
        ["CREATED", "ACCEPTED", "OUT_FOR_DELIVERY"].includes(o.status)
      );

      setOrders(filtered);

    } catch (e) {

      console.log("Erro ao carregar pedidos:", e);

    }

  };

  const getStatusConfig = (status: string) => {

    switch (status) {

      case "CREATED":
        return { text: "Criado", color: "#1976D2", bg: "#E3F2FD" };

      case "ACCEPTED":
        return { text: "Aceito", color: "#7B1FA2", bg: "#F3E5F5" };

      case "OUT_FOR_DELIVERY":
        return { text: "Em entrega", color: "#FF9800", bg: "#FFF3E0" };

      default:
        return { text: status, color: "#555", bg: "#EEE" };

    }

  };

  const renderItem = ({ item }: any) => {

    const statusConfig = getStatusConfig(item.status);

    const hasLocation =
      item.deliveryLatitude !== undefined &&
      item.deliveryLongitude !== undefined &&
      item.deliveryLatitude !== null &&
      item.deliveryLongitude !== null;

    return (

      <View style={styles.card}>

        <View style={styles.headerCard}>

          <Text style={styles.title}>
            Pedido #{item.id ?? ""}
          </Text>

          <Text
            style={[
              styles.status,
              {
                color: statusConfig.color,
                backgroundColor: statusConfig.bg
              }
            ]}
          >
            {statusConfig.text}
          </Text>

        </View>

        <Text style={styles.customer}>
          Cliente: {item.customerName ?? ""}
        </Text>

        <Text style={styles.customerPhone}>
          Telefone: {item.customerPhone ?? ""}
        </Text>

        <Text style={styles.address}>
          📍 {item.street ?? ""}, {item.number ?? ""} -{" "}
          {item.neighborhood ?? ""}, {item.city ?? ""}
        </Text>

        {hasLocation && (

          <View style={styles.mapWrapper}>

            <MapView
              ref={(ref) => {
                mapRefs.current[item.id] = ref;
              }}
              style={styles.map}
              initialRegion={{
                latitude: item.deliveryLatitude,
                longitude: item.deliveryLongitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
            >

              <Marker
                coordinate={{
                  latitude: item.deliveryLatitude,
                  longitude: item.deliveryLongitude
                }}
              >
                <Text style={{ fontSize: 28 }}>
                  🏍️
                </Text>
              </Marker>

            </MapView>

          </View>

        )}

        {!hasLocation && (

          <Text style={{ color: "gray", marginTop: 10 }}>
            Localização da entrega ainda não disponível
          </Text>

        )}

        {Array.isArray(item.items) &&
          item.items.map((p: any, index: number) => (

            <View key={index} style={styles.itemCard}>

              <Text style={styles.itemText}>
                {p.quantity ?? 0}x {p.productName ?? ""}
              </Text>

              <Text style={styles.itemText}>
                R$ {Number(p.subtotal ?? 0).toFixed(2)}
              </Text>

            </View>

          ))}

        <Text style={styles.total}>
          Total: R$ {Number(item.totalAmount ?? 0).toFixed(2)}
        </Text>

      </View>

    );

  };

  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "ClientHome" }]
            })
          }
          style={styles.backBtn}
        >
          <Text style={styles.backText}>
            Voltar
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Pedidos
        </Text>

        <View style={{ width: 60 }} />

      </View>

      <View style={styles.tableArea}>

        <FlatList
          data={orders}
          keyExtractor={(item) =>
            item.id?.toString() ?? Math.random().toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

      </View>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#E8F5E9"
  },

  header: {
    height: 80,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15
  },

  backBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },

  backText: {
    color: "#fff",
    fontWeight: "bold"
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },

  tableArea: {
    height: 450,
    padding: 15
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },

  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  title: {
    fontWeight: "bold",
    color: "#2E7D32",
    fontSize: 18
  },

  status: {
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12
  },

  customer: {
    marginTop: 6,
    fontWeight: "bold",
    color: "#333",
    fontSize: 16
  },

  customerPhone: {
    color: "#555",
    marginBottom: 6
  },

  address: {
    marginTop: 4,
    color: "#555"
  },

  mapWrapper: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    height: 180
  },

  map: {
    flex: 1
  },

  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F8F4",
    padding: 10,
    marginTop: 8,
    borderRadius: 12
  },

  itemText: {
    color: "#333",
    fontSize: 14
  },

  total: {
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "right"
  }

});