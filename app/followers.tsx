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

export default function FollowersScreen() {
  const { userId, username } = useLocalSearchParams<{
    userId: string;
    username: string;
  }>();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFollowers = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await userService.getFollowers(userId, { limit: 100 });
      setFollowers(response.followers);
    } catch (error) {
      console.error("Error loading followers:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFollowers();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const handleFollowChange = () => {
    loadFollowers();
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: username ? `Seguidores de @${username}` : "Seguidores",
          headerBackTitle: "Voltar",
        }}
      />
      <SafeAreaView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : followers.length > 0 ? (
          <FlatList
            data={followers}
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
              Nenhum seguidor
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400 mt-2">
              {username
                ? `@${username} ainda não tem seguidores`
                : "Você ainda não tem seguidores"}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

