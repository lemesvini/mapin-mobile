import { MAPBOX_CONFIG } from "@/config/mapbox.config";
import { useApi } from "@/hooks/use-api";
import { Pin } from "@/types/pin";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);

export default function HomeScreen() {
  const api = useApi();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPinsAndLocation() {
      try {
        // Fetch pins
        const response = await api.pins.getPins({ isPublic: true, limit: 100 });
        setPins(response.pins || []);

        // Get user location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          setLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        let errorMsg = "Failed to fetch pins or location";
        if (typeof err === "string") errorMsg = err;
        else if (err && typeof err === "object" && "message" in err)
          errorMsg = (err as any).message;
        setLocationError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    fetchPinsAndLocation();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={MAPBOX_CONFIG.STYLE_URL}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        <Mapbox.Camera
          zoomLevel={MAPBOX_CONFIG.DEFAULT_ZOOM}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : MAPBOX_CONFIG.DEFAULT_COORDINATES
          }
          animationDuration={MAPBOX_CONFIG.ANIMATION_DURATION}
          pitch={60}
        />

        {/* 3D Buildings Layer */}
        {/* <Mapbox.VectorSource
          id="composite"
          url="mapbox://mapbox.mapbox-streets-v12"
        >
          <Mapbox.FillExtrusionLayer
            id="3d-buildings"
            sourceLayerID="building"
            style={{
              fillExtrusionColor: "#e0e0e0",
              fillExtrusionHeight: ["get", "height"],
              fillExtrusionBase: ["get", "min_height"],
              fillExtrusionOpacity: 0.7,
            }}
            minZoomLevel={15}
          />
        </Mapbox.VectorSource> */}

        {/* Render pins as red dots */}
        {pins.map((pin) => (
          <Mapbox.PointAnnotation
            key={pin.id}
            id={pin.id}
            coordinate={[pin.lng, pin.lat]}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#EF4444",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          </Mapbox.PointAnnotation>
        ))}

        {/* Render user location as blue dot */}
        {userLocation && (
          <Mapbox.PointAnnotation
            id="user-location"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#3B82F6",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>
    </View>
  );
}
