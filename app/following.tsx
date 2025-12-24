import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "@/services/user.service";
import { UserCard } from "@/components/user-card";
import { User } from "@/types/user";

export default function FollowingScreen() {
  const { userId, username } = useLocalSearchParams<{
    userId: string;
    username: string;
  }>();
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFollowing = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await userService.getFollowing(userId, { limit: 100 });
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
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: username ? `Seguindo - @${username}` : "Seguindo",
          headerBackTitle: "Voltar",
        }}
      />
      <SafeAreaView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
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
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Não está seguindo ninguém
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400 mt-2">
              {username
                ? `@${username} ainda não está seguindo ninguém`
                : "Você ainda não está seguindo ninguém"}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

