import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "@/services/user.service";
import { FollowRequest } from "@/types/user";

export default function FollowRequestsScreen() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await userService.getPendingRequests({ limit: 100 });
      setRequests(response.requests);
    } catch (error) {
      console.error("Error loading follow requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));
      await userService.acceptFollowRequest(requestId);
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível aceitar a solicitação"
      );
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));
      await userService.rejectFollowRequest(requestId);
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível rejeitar a solicitação"
      );
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const renderRequest = ({ item }: { item: FollowRequest }) => {
    const sender = item.sender;
    if (!sender) return null;

    const isProcessing = processingIds.has(item.id);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push(`/user-profile?username=${sender.username}`)
        }
        className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row flex-1 items-center">
          {sender.profilePictureUrl ? (
            <Image
              source={{ uri: sender.profilePictureUrl }}
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-blue-500 mr-3 items-center justify-center">
              <Text className="text-white text-lg font-bold">
                {sender.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <Text
              className="text-base font-semibold text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {sender.username}
            </Text>
            <Text
              className="text-sm text-gray-600 dark:text-gray-400"
              numberOfLines={1}
            >
              {sender.fullName}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleAccept(item.id)}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-500 rounded-lg"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Aceitar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleReject(item.id)}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                Rejeitar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Solicitações de Amizade",
          headerBackTitle: "Voltar",
        }}
      />
      <SafeAreaView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : requests.length > 0 ? (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={renderRequest}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="person-add-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Nenhuma solicitação pendente
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Você não tem solicitações de amizade no momento
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

