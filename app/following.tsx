import React, { useState, useEffect } from "react";
import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "@/services/user.service";
import { UserCard } from "@/components/user-card";
import { User } from "@/types/user";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function FollowingScreen() {
  const { userId, username } = useLocalSearchParams<{
    userId: string;
    username: string;
  }>();
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mutedTextColor = useThemeColor({ light: "#666", dark: "#999" }, "icon");

  const loadFollowing = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await userService.getFollowing(userId, { limit: 100 });
      console.log("Following response:", response.following);
      // Log follow status for debugging
      response.following.forEach((user) => {
        console.log(`User ${user.username}: isFollowing=${user.isFollowing}, followRequestStatus=${user.followRequestStatus}`);
      });
      setFollowing(response.following);
    } catch (error) {
      console.error("Error loading following:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFollowing();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const handleFollowChange = () => {
    loadFollowing();
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: username ? `Seguindo - @${username}` : "Seguindo",
          headerBackTitle: "Voltar",
        }}
      />
      <SafeAreaView edges={["bottom"]} className="flex-1">
        {loading ? (
          <ThemedView className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FE2C55" />
          </ThemedView>
        ) : following.length > 0 ? (
          <FlatList
            data={following}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserCard user={item} onFollowChange={handleFollowChange} />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        ) : (
          <ThemedView className="flex-1 items-center justify-center px-6">
            <Ionicons name="people-outline" size={64} color={mutedTextColor} />
            <ThemedText
              type="defaultSemiBold"
              className="mt-4 text-lg text-center"
            >
              Não está seguindo ninguém
            </ThemedText>
            <ThemedText
              className="text-center mt-2 text-sm"
              style={{ color: mutedTextColor }}
            >
              {username
                ? `@${username} ainda não está seguindo ninguém`
                : "Você ainda não está seguindo ninguém"}
            </ThemedText>
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
