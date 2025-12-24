import { MAPBOX_CONFIG } from "@/config/mapbox.config";
import { useApi } from "@/hooks/use-api";
import { Pin } from "@/types/pin";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { MapPinCard } from "@/components/map-pin-card";
import { pinService } from "@/services/pin.service";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const { pinId } = useGlobalSearchParams<{ pinId?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isLoadingPin, setIsLoadingPin] = useState(false);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    async function fetchPinsAndLocation() {
      try {
        // Fetch pins
        const response = await api.pins.getPins({ isPublic: true, limit: 100 });
        setPins(response.pins || []);

        // Get user location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        console.error("Failed to fetch pins or location:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPinsAndLocation();
  }, [api.pins]);

  // Handle pinId from route params
  useEffect(() => {
    const pinIdValue = Array.isArray(pinId) ? pinId[0] : pinId;
    if (pinIdValue && typeof pinIdValue === "string") {
      handlePinSelect(pinIdValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinId]);

  const handlePinSelect = async (id: string) => {
    try {
      setIsLoadingPin(true);
      const pin = await pinService.getPin(id);
      setSelectedPin(pin);

      // Center camera on selected pin
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [pin.lng, pin.lat],
          zoomLevel: 15,
          animationDuration: 500,
        });
      }

      // Pin card will appear immediately
    } catch (error) {
      console.error("Failed to load pin:", error);
    } finally {
      setIsLoadingPin(false);
    }
  };

  const handleClosePinCard = () => {
    setSelectedPin(null);
    // Clear pinId from URL
    router.setParams({ pinId: "" });
  };

  const handleLike = async (pinId: string) => {
    try {
      if (!selectedPin || selectedPin.id !== pinId) return;

      const wasLiked = selectedPin.isLiked;

      // Optimistic update
      setSelectedPin({
        ...selectedPin,
        isLiked: !wasLiked,
        _count: {
          ...selectedPin._count,
          likes: wasLiked
            ? selectedPin._count.likes - 1
            : selectedPin._count.likes + 1,
        },
      });

      // API call
      if (wasLiked) {
        await pinService.unlikePin(pinId);
      } else {
        await pinService.likePin(pinId);
      }

      // Refresh pin data to ensure consistency
      const updatedPin = await pinService.getPin(pinId);
      setSelectedPin(updatedPin);
    } catch (err) {
      console.error("Failed to like/unlike pin:", err);
      // Revert optimistic update on error
      if (selectedPin) {
        const revertedPin = await pinService.getPin(selectedPin.id);
        setSelectedPin(revertedPin);
      }
    }
  };


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
          ref={cameraRef}
          zoomLevel={MAPBOX_CONFIG.DEFAULT_ZOOM}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : MAPBOX_CONFIG.DEFAULT_COORDINATES
          }
          animationDuration={MAPBOX_CONFIG.ANIMATION_DURATION}
          pitch={60}
        />

        {/* Render pins as red dots */}
        {pins.map((pin) => (
          <Mapbox.PointAnnotation
            key={pin.id}
            id={pin.id}
            coordinate={[pin.lng, pin.lat]}
            onSelected={() => handlePinSelect(pin.id)}
          >
            <TouchableOpacity
              onPress={() => handlePinSelect(pin.id)}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: selectedPin?.id === pin.id ? 20 : 16,
                  height: selectedPin?.id === pin.id ? 20 : 16,
                  borderRadius: selectedPin?.id === pin.id ? 10 : 8,
                  backgroundColor:
                    selectedPin?.id === pin.id ? "#F91880" : "#EF4444",
                  borderWidth: 2,
                  borderColor: "#fff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              />
            </TouchableOpacity>
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

      {/* Pin Card Overlay */}
      {isLoadingPin ? (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingVertical: 40,
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#1D9BF0" />
        </View>
      ) : selectedPin ? (
        <MapPinCard
          pin={selectedPin}
          onClose={handleClosePinCard}
          onLike={handleLike}
        />
      ) : null}
    </View>
  );
}
