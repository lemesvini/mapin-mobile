import { MAPBOX_CONFIG } from "@/config/mapbox.config";
import { useApi } from "@/hooks/use-api";
import { Pin } from "@/types/pin";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useEffect, useState, useRef, useCallback } from "react";
import { ActivityIndicator, View, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { MapPinCard } from "@/components/map-pin-card";
import { pinService } from "@/services/pin.service";

Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);

// Pulsating Pin Component
function PulsatingPin({ key }: { key?: string }) {
  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.8);
  const scale2 = useSharedValue(1);
  const opacity2 = useSharedValue(0.6);
  const mainScale = useSharedValue(1);

  useEffect(() => {
    // Reset values
    scale1.value = 1;
    opacity1.value = 0.8;
    scale2.value = 1;
    opacity2.value = 0.6;
    mainScale.value = 1;

    // Start animations immediately
    scale1.value = withRepeat(
      withTiming(2.5, {
        duration: 1500,
        easing: Easing.out(Easing.quad),
      }),
      -1,
      false
    );
    opacity1.value = withRepeat(
      withTiming(0, {
        duration: 1500,
        easing: Easing.out(Easing.quad),
      }),
      -1,
      false
    );

    // Second ring with delay
    const timeout = setTimeout(() => {
      scale2.value = withRepeat(
        withTiming(2.5, {
          duration: 1500,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      );
      opacity2.value = withRepeat(
        withTiming(0, {
          duration: 1500,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      );
    }, 750);

    // Main pin pulse
    mainScale.value = withRepeat(
      withTiming(1.2, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const animatedRing1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale1.value }],
      opacity: opacity1.value,
    };
  });

  const animatedRing2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale2.value }],
      opacity: opacity2.value,
    };
  });

  const animatedMainStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: mainScale.value }],
    };
  });

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 60,
      }}
    >
      {/* First pulsating ring */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#F91880",
            borderWidth: 3,
            borderColor: "#fff",
          },
          animatedRing1Style,
        ]}
      />
      {/* Second pulsating ring */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#F91880",
            borderWidth: 3,
            borderColor: "#fff",
          },
          animatedRing2Style,
        ]}
      />
      {/* Main pin with pulse */}
      <Animated.View
        style={[
          {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#F91880",
            borderWidth: 5,
            borderColor: "#fff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
            elevation: 12,
          },
          animatedMainStyle,
        ]}
      />
    </View>
  );
}

export default function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const { pinId } = useGlobalSearchParams<{ pinId?: string }>();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isLoadingPin, setIsLoadingPin] = useState(false);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const mapViewRef = useRef<Mapbox.MapView>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasAnimatedToUser, setHasAnimatedToUser] = useState(false);

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

  // Animate to user location once map is loaded and location is available
  useEffect(() => {
    if (mapLoaded && userLocation && !hasAnimatedToUser && cameraRef.current) {
      // Small delay to ensure map is fully rendered
      setTimeout(() => {
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: [userLocation.longitude, userLocation.latitude],
            zoomLevel: MAPBOX_CONFIG.DEFAULT_ZOOM,
            animationDuration: MAPBOX_CONFIG.ANIMATION_DURATION,
          });
          setHasAnimatedToUser(true);
        }
      }, 300);
    }
  }, [mapLoaded, userLocation, hasAnimatedToUser]);

  // Handle pinId from route params
  useEffect(() => {
    const pinIdValue = Array.isArray(pinId) ? pinId[0] : pinId;
    if (pinIdValue && typeof pinIdValue === "string") {
      handlePinSelect(pinIdValue);
    }
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

  const handleMapLoaded = useCallback(() => {
    setMapLoaded(true);
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
        ref={mapViewRef}
        style={{ flex: 1 }}
        styleURL={MAPBOX_CONFIG.STYLE_URL}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        pitchEnabled={true}
        rotateEnabled={true}
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={MAPBOX_CONFIG.WORLDVIEW_ZOOM}
          centerCoordinate={[0, 0]}
          animationDuration={0}
          pitch={0}
        />

        {/* Render pins as red dots */}
        {pins.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          return (
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
                {isSelected ? (
                  <PulsatingPin key={pin.id} />
                ) : (
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: "#EF4444",
                      borderWidth: 2,
                      borderColor: "#fff",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  />
                )}
              </TouchableOpacity>
            </Mapbox.PointAnnotation>
          );
        })}

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
