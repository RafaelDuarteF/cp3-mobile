// GPS Example App using Expo Location

import { useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getCurrentLocation() {
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Não foi possível acessar a localização do dispositivo."
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      const gpsData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(gpsData);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível capturar a localização.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Exemplo de GPS</Text>

        <Text style={styles.description}>
          Este app captura a localização atual do dispositivo usando Expo
          Location.
        </Text>

        <Button
          title={loading ? "Capturando..." : "Capturar localização"}
          onPress={getCurrentLocation}
          disabled={loading}
        />

        {location && (
          <View style={styles.result}>
            <Text style={styles.label}>Latitude:</Text>
            <Text style={styles.value}>{location.latitude}</Text>

            <Text style={styles.label}>Longitude:</Text>
            <Text style={styles.value}>{location.longitude}</Text>

            <Text style={styles.label}>Objeto para salvar:</Text>
            <Text style={styles.code}>
              {JSON.stringify({ location }, null, 2)}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  result: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
  },
  code: {
    marginTop: 8,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
});