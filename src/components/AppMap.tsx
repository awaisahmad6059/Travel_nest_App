import { Platform, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { GeoPoint } from "@/types";

/**
 * Map component rendered as an OpenStreetMap (OSM) map via Leaflet inside a
 * WebView. Uses only free OSM tiles — NO Google Maps API key required.
 *
 * Why WebView + Leaflet instead of react-native-maps:
 * - react-native-maps always boots the Google Maps Android SDK on Android,
 *   which requires a Google Maps API key in a standalone APK regardless of
 *   the tile provider (UrlTile only swaps the rendered tiles).
 * - A WebView + Leaflet map needs no key and works on both Expo Go (WebView
 *   is bundled) and standalone builds.
 *
 * Web (react-native-web) renders a placeholder panel (WebView is native-only).
 */
function buildMapHtml(point?: GeoPoint): string {
  const lat = point?.latitude ?? 20;
  const lng = point?.longitude ?? 0;
  const label = JSON.stringify(point?.label ?? "");
  const marker = point ? "L.marker([lat, lng]).addTo(map).bindPopup(label);" : "";
  const zoom = point ? 14 : 2;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  .leaflet-container { background: #e8ecf1; }
</style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function () {
      var lat = ${lat};
      var lng = ${lng};
      var label = ${label};
      var map = L.map('map', { scrollWheelZoom: false, attributionControl: false }).setView([lat, lng], ${zoom});
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      ${marker}
    })();
  </script>
</body>
</html>`;
}

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

  return (
    <View style={{ height }} className="rounded-2xl overflow-hidden">
      <WebView
        source={{ html: buildMapHtml(point) }}
        originWhitelist={["*"]}
        scrollEnabled={false}
        pointerEvents="none"
        style={{ flex: 1, backgroundColor: "#e8ecf1" }}
      />
    </View>
  );
}
