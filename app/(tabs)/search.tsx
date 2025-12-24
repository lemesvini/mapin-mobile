import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { UserCard } from "@/components/user-card";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setSearchPerformed(false);
      return;
    }

    try {
      setLoading(true);
      const response = await userService.searchUsers(query.trim(), {
        limit: 50,
      });
      setUsers(response.users);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setUsers([]);
    setSearchPerformed(false);
  };

  const handleFollowChange = () => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Buscar
        </Text>

        {/* Search Input */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Ionicons
            name="search"
            size={20}
            className="text-gray-400 dark:text-gray-500"
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            placeholder="Buscar usuários..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons
                name="close-circle"
                size={20}
                className="text-gray-400 dark:text-gray-500"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserCard user={item} onFollowChange={handleFollowChange} />
            )}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        ) : searchPerformed ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="search"
              size={64}
              className="text-gray-300 dark:text-gray-700 mb-4"
            />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum resultado encontrado
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400">
              Tente buscar por outro nome de usuário ou nome completo
            </Text>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="people"
              size={64}
              className="text-gray-300 dark:text-gray-700 mb-4"
            />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Buscar usuários
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400">
              Digite um nome de usuário ou nome completo para encontrar pessoas
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

