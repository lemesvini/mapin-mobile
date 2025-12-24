import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { userService } from "@/services/user.service";
import { pinService } from "@/services/pin.service";
import { useAuth } from "@/contexts/auth.context";
import { User } from "@/types/user";
import { Pin } from "@/types/pin";
import { PinCard } from "@/components/pin-card";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const loadUserProfile = async () => {
    if (!username) return;

    try {
      setLoading(true);
      // First get user data, then get their pins using userId
      const userData = await userService.getUserProfile(username);
      setUser(userData);

      // Now fetch pins using the userId
      const userPins = await pinService.getUserPins(userData.id, { limit: 50 });
      setPins(userPins.pins);
    } catch (error: any) {
      console.error("Error loading user profile:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível carregar o perfil"
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUserProfile();
    // }, [username]);
  }, []);

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      setFollowLoading(true);

      if (user.isFollowing) {
        // Unfollow
        await userService.unfollowUser(user.id);
        setUser({
          ...user,
          isFollowing: false,
          followersCount: (user.followersCount || 0) - 1,
          followRequestStatus: null,
        });
      } else if (user.followRequestStatus === "PENDING") {
        // Cancel follow request
        await userService.cancelFollowRequest(user.id);
        setUser({
          ...user,
          followRequestStatus: null,
        });
      } else {
        // Follow or send request
        const response = await userService.followUser(user.id);

        console.log("Follow response:", response);

        if (response.request) {
          // Follow request sent
          setUser({
            ...user,
            followRequestStatus: "PENDING",
          });
        } else if (response.follow) {
          // Followed directly
          setUser({
            ...user,
            isFollowing: true,
            followersCount: (user.followersCount || 0) + 1,
            followRequestStatus: null,
          });
        }
      }
    } catch (error: any) {
      console.error("Follow error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Não foi possível realizar a ação";

      // If already pending/following, refresh the profile to get current state
      if (
        errorMessage.includes("already pending") ||
        errorMessage.includes("already following")
      ) {
        await loadUserProfile();
      } else {
        Alert.alert("Erro", errorMessage);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const getFollowButtonText = () => {
    if (user?.isFollowing) return "Seguindo";
    if (user?.followRequestStatus === "PENDING") return "Solicitado";
    return "Seguir";
  };

  const getFollowButtonStyle = () => {
    if (user?.isFollowing || user?.followRequestStatus === "PENDING") {
      return "bg-gray-200 dark:bg-gray-700";
    }
    return "bg-blue-500";
  };

  const getFollowButtonTextColor = () => {
    if (user?.isFollowing || user?.followRequestStatus === "PENDING") {
      return "text-gray-700 dark:text-gray-300";
    }
    return "text-white";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <Stack.Screen
          options={{
            headerShown: true,
            title: username || "Perfil",
            headerBackTitle: "Voltar",
          }}
        />
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </SafeAreaView>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Perfil",
            headerBackTitle: "Voltar",
          }}
        />
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Ionicons name="person-outline" size={64} color="#9CA3AF" />
          <Text className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            Usuário não encontrado
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  const StatItem = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value: number;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="items-center"
    >
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: `@${username}`,
          headerBackTitle: "Voltar",
        }}
      />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
          {/* Avatar and Stats */}
          <View className="flex-row items-start mb-4">
            {/* Avatar */}
            {user.profilePictureUrl ? (
              <Image
                source={{ uri: user.profilePictureUrl }}
                className="w-24 h-24 rounded-full mr-4"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-blue-500 mr-4 items-center justify-center">
                <Text className="text-3xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Stats */}
            <View className="flex-1 flex-row justify-around pt-2">
              <StatItem label="Pins" value={pins.length} />
              <StatItem
                label="Seguidores"
                value={user.followersCount || 0}
                onPress={() => {
                  router.push(
                    `/followers?userId=${user.id}&username=${user.username}`
                  );
                }}
              />
              <StatItem
                label="Seguindo"
                value={user.followingCount || 0}
                onPress={() => {
                  router.push(
                    `/following?userId=${user.id}&username=${user.username}`
                  );
                }}
              />
            </View>
          </View>

          {/* Name and Bio */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {user.fullName}
            </Text>
            {user.bio && (
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-5">
                {user.bio}
              </Text>
            )}
            {user.instagramUsername && (
              <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Instagram: @{user.instagramUsername}
              </Text>
            )}
            {user.isPrivate && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  Conta privada
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleFollowToggle}
                disabled={followLoading}
                className={`flex-1 py-3 rounded-lg items-center ${getFollowButtonStyle()}`}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    className={`font-semibold ${getFollowButtonTextColor()}`}
                  >
                    {getFollowButtonText()}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
                <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Pins Section */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Pins
          </Text>
          {pins.length > 0 ? (
            pins.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                onPress={(pinId) => {
                  router.push(`/(tabs)?pinId=${pinId}` as any);
                }}
                // onUpdate={loadUserProfile}
              />
            ))
          ) : (
            <View className="py-12 items-center">
              <Ionicons name="map-outline" size={64} color="#9CA3AF" />
              <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center">
                {isOwnProfile
                  ? "Você ainda não tem pins"
                  : `${user.username} ainda não tem pins`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
