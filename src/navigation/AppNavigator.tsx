import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

import DeliveryScreen from "../screens/DeliveryScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import CartScreen from "../screens/CartScreen";
import ClientHomeScreen from "../screens/ClientHomeScreen";
import EditAddressScreen from "../screens/EditAddressScreen";
import OrdersScreen from "../screens/OrdersScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, role, logout } = useContext(AuthContext);

  // ⭐ NÃO LOGADO
  if (!token) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  // ⭐ MOTOBOY
  if (role === "DELIVERY") {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Entregas"
          component={DeliveryScreen}
          options={{ headerTitle: "Entregas" }}
        />
      </Stack.Navigator>
    );
  }

  // ⭐ CLIENTE (SEM HEADER NATIVO → usamos header custom)
  if (role === "CLIENT") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="EditAddress" component={EditAddressScreen} />
      </Stack.Navigator>
    );
  }

  // ⭐ FALLBACK
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Usuário inválido</Text>
      <Button title="Voltar ao login" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold"
  }
});