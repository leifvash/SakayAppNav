import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { styles } from "../styles/RouteMapStyles";
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  RouteMap: { routeId: string };
};

type RouteMapScreenRouteProp = RouteProp<RootStackParamList, "RouteMap">;

export default function RouteMapScreen() {
  const route = useRoute<RouteMapScreenRouteProp>();
  const navigation = useNavigation();
  const { routeId } = route.params;

  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const ORS_API_KEY = Constants.expoConfig?.extra?.openrouteserviceApiKey;

  const routePoints: Record<string, [number, number][]> = {
    "jeep-01": [
      [124.6575, 8.4892],
      [124.6592, 8.4868],
      [124.6413, 8.4887],
      [124.6388, 8.4862],
      [124.6378, 8.4742],
      [124.6313, 8.4752],
      [124.6305, 8.4830],
      [124.6367, 8.4812],
      [124.6366, 8.4793],
    ],
    "jeep-02": [
      [124.6577, 8.4895],
      [124.6575, 8.4898],
      [124.6561, 8.4905],
      [124.6542, 8.4918],
      [124.6539, 8.4920],
      [124.6536, 8.4919],
      [124.6534, 8.4915],
      [124.6525, 8.4901],
      [124.6524, 8.4898],
      [124.6521, 8.4894],
      [124.6517, 8.4886],
      [124.6510, 8.4872],
      [124.6507, 8.4865],
      [124.6504, 8.4860],
      [124.6483, 8.4865],
      [124.6479, 8.4861],
      [124.6475, 8.4851],
      [124.6469, 8.4850],
      [124.6450, 8.4842],
      [124.6442, 8.4829],
      [124.6438, 8.4820],
      [124.6433, 8.4805],
      [124.6427, 8.4788],
      [124.6425, 8.4774],
      [124.6449, 8.4766],
      [124.6458, 8.4764],
      [124.6464, 8.4784],
      [124.6495, 8.4772],
      [124.6522, 8.4777],
    ],
  };

  useEffect(() => {
    const fetchRoute = async () => {
      if (!routeId || !ORS_API_KEY) return;

      const points = routePoints[routeId];
      if (!points) {
        Alert.alert("Error", "No coordinates found for this route.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: ORS_API_KEY,
            },
            body: JSON.stringify({ coordinates: points }),
          }
        );

        const data = await response.json();

        if (!data.features || !data.features[0]) {
          throw new Error("Invalid response from ORS");
        }

        const coords = data.features[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          })
        );

        setRouteCoordinates(coords);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load route data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [routeId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading route...</Text>
      </View>
    );
  }

  if (!routeCoordinates.length) {
    return (
      <View style={styles.center}>
        <Text>No route found for {routeId}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
        }}
      >
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: routeCoordinates[0].latitude,
          longitude: routeCoordinates[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
        <Marker coordinate={routeCoordinates[0]} title="Start" />
        <Marker
          coordinate={routeCoordinates[routeCoordinates.length - 1]}
          title="End"
        />
      </MapView>
    </SafeAreaView>
  );
}
