import { Platform, Text, View } from "react-native";
import type { GeoPoint } from "@/types";

/**
 * Map component using react-native-maps + OpenStreetMap tiles (no API key).
 * react-native-maps has no web support, so web renders a placeholder panel.
 */
export function AppMap({
  point,
  height = 180,
}: {
  point?: GeoPoint;
  height?: number;
}) {
  if (Platform.OS === "web") {
    return (
      <View
        style={{ height }}
        className="bg-ink-100 items-center justify-center rounded-2xl"
      >
        <Text className="text-3xl">🗺️</Text>
        <Text className="mt-2 text-sm text-ink-500 font-medium px-4 text-center">
          {point?.label ?? "Map view"}
        </Text>
      </View>
    );
  }

  const { default: MapView, Marker, UrlTile } = require("react-native-maps");

  return (
    <View style={{ height }} className="rounded-2xl overflow-hidden">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: point?.latitude ?? 0,
          longitude: point?.longitude ?? 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {point ? (
          <Marker
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.label}
          />
        ) : null}
      </MapView>
    </View>
  );
}
