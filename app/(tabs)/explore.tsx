import { PinCard } from "@/components/pin-card";
import { ThemedDropdown } from "@/components/themed-dropdown";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from "react-native";
import { Pin } from "@/types/pin";
import { pinService } from "@/services/pin.service";
import { useAuth } from "@/contexts/auth.context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ExploreScreen() {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedView, setSelectedView] = useState("mundo");
  const [pins, setPins] = useState<Pin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PINS_PER_PAGE = 20;

  useEffect(() => {
    // Auth token is automatically managed by AuthProvider
    loadPins(true);
  }, [token, selectedView]);

  const loadPins = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(0);
        setHasMore(true);
        setIsLoading(true);
      }

      const offset = refresh ? 0 : page * PINS_PER_PAGE;
      const response = await pinService.getPins({
        limit: PINS_PER_PAGE,
        offset,
        isPublic: selectedView === "mundo" ? true : undefined,
      });

      if (refresh) {
        setPins(response.pins);
      } else {
        setPins((prev) => [...prev, ...response.pins]);
      }

      setHasMore(response.pins.length === PINS_PER_PAGE);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pins");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPins(true);
  }, [selectedView]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
      loadPins();
    }
  };

  const handleLike = async (pinId: string) => {
    try {
      const pin = pins.find((p) => p.id === pinId);
      if (!pin) return;

      if (pin.isLiked) {
        await pinService.unlikePin(pinId);
      } else {
        await pinService.likePin(pinId);
      }

      // Optimistic update already handled in PinCard
    } catch (err) {
      console.error("Failed to like/unlike pin:", err);
    }
  };

  const handleComment = (pinId: string) => {
    // TODO: Navigate to pin detail screen with comments
    console.log("Comment on pin:", pinId);
  };

  const handlePinPress = (pinId: string) => {
    // TODO: Navigate to pin detail screen
    console.log("Pin pressed:", pinId);
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View className="flex-1 items-center justify-center py-20">
        <Ionicons
          name="map-outline"
          size={64}
          color={isDark ? "#4B5563" : "#D1D5DB"}
        />
        <ThemedText className="mt-4 text-lg font-semibold">
          No pins yet
        </ThemedText>
        <ThemedText className="mt-2 text-gray-500 dark:text-gray-400 text-center px-8">
          {selectedView === "mundo"
            ? "Be the first to drop a pin and share your experience!"
            : "Your friends haven't posted any pins yet"}
        </ThemedText>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View className="py-4">
        <ActivityIndicator
          size="small"
          color={isDark ? "#60A5FA" : "#3B82F6"}
        />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <ThemedDropdown
          options={[
            { label: "Mundo", value: "mundo" },
            { label: "Amigos", value: "amigos" },
          ]}
          value={selectedView}
          onValueChange={setSelectedView}
          placeholder="Selecione uma opção"
        />
      </View>
    );
  };

  if (isLoading && pins.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
        <ThemedView className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#60A5FA" : "#3B82F6"}
          />
          <ThemedText className="mt-4 text-gray-500 dark:text-gray-400">
            Loading pins...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error && pins.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
        <ThemedView className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDark ? "#EF4444" : "#DC2626"}
          />
          <ThemedText className="mt-4 text-lg font-semibold text-center">
            Something went wrong
          </ThemedText>
          <ThemedText className="mt-2 text-gray-500 dark:text-gray-400 text-center">
            {error}
          </ThemedText>
          <TouchableOpacity
            onPress={() => loadPins(true)}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
          >
            <ThemedText className="text-white font-semibold">
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
      <FlatList
        data={pins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PinCard
            pin={item}
            onLike={handleLike}
            onComment={handleComment}
            onPress={handlePinPress}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#60A5FA" : "#3B82F6"}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
