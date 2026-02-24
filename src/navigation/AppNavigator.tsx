import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import DeliveryScreen from "../screens/DeliveryScreen";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, role, logout } = useContext(AuthContext);

  // ⭐ NÃO LOGADO
  if (!token) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
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

  // ⭐ FALLBACK CLIENT / ADMIN
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Usuário não é motoboy</Text>

      <Button title="Voltar ao login" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
});