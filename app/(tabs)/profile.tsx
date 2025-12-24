import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth.context";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { userService } from "@/services/user.service";
import { pinService } from "@/services/pin.service";
import { PinCard } from "@/components/pin-card";
import { Pin } from "@/types/pin";

export default function ProfileScreen() {
  const borderColor = useThemeColor({}, "icon");
  const mutedTextColor = useThemeColor({ light: "#666", dark: "#999" }, "icon");
  const { user, refreshUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<{
    followersCount: number;
    followingCount: number;
  }>({ followersCount: 0, followingCount: 0 });

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const [userData, userPins, pendingRequests] = await Promise.all([
        userService.getUserProfile(user.username),
        pinService.getUserPins(user.id, { limit: 50 }),
        userService.getPendingRequests({ limit: 100 }),
      ]);

      setProfileData({
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0,
      });
      setPins(userPins.pins);
      setPendingRequestsCount(pendingRequests.total);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    await refreshUser();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [user?.id])
  );

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert("Erro", "Falha ao sair");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const StatItem = ({ label, value, onPress }: { label: string; value: number; onPress?: () => void }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView className="items-center">
        <ThemedText type="defaultSemiBold" className="text-2xl">
          {value}
        </ThemedText>
        <ThemedText className="text-sm" style={{ color: mutedTextColor }}>
          {label}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <ThemedView className="px-4 pt-2 pb-1 flex-row justify-between items-center">
            <ThemedText type="defaultSemiBold" className="text-xl">
              @{user.username}
            </ThemedText>
            <TouchableOpacity 
              onPress={handleLogout}
              disabled={isLoggingOut}
              className="p-2"
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" />
              ) : (
                <Ionicons name="log-out-outline" size={24} color={mutedTextColor} />
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* Profile Info Section */}
          <ThemedView className="px-4 py-4">
            {/* Avatar and Stats Row */}
            <ThemedView className="flex-row items-center mb-4">
              {/* Avatar */}
              {user.profilePictureUrl ? (
                <Image
                  source={{ uri: user.profilePictureUrl }}
                  className="w-24 h-24 rounded-full mr-4"
                  style={{ borderWidth: 2, borderColor: borderColor }}
                />
              ) : (
                <ThemedView 
                  className="w-24 h-24 rounded-full mr-4 items-center justify-center bg-blue-500"
                  style={{ borderWidth: 2, borderColor: borderColor }}
                >
                  <ThemedText className="text-3xl text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                  </ThemedText>
                </ThemedView>
              )}

              {/* Stats */}
              <ThemedView className="flex-1 flex-row justify-around">
                <StatItem label="Pins" value={pins.length} />
                <StatItem 
                  label="Seguidores" 
                  value={profileData.followersCount}
                  onPress={() => router.push(`/followers?userId=${user.id}&username=${user.username}`)}
                />
                <StatItem 
                  label="Seguindo" 
                  value={profileData.followingCount}
                  onPress={() => router.push(`/following?userId=${user.id}&username=${user.username}`)}
                />
              </ThemedView>
            </ThemedView>

            {/* Name and Bio */}
            <ThemedView className="mb-4">
              <ThemedText type="defaultSemiBold" className="mb-1">
                {user.fullName}
              </ThemedText>
              {user.bio && (
                <ThemedText className="text-sm leading-5">
                  {user.bio}
                </ThemedText>
              )}
              {user.instagramUsername && (
                <ThemedText className="text-sm mt-1" style={{ color: mutedTextColor }}>
                  Instagram: @{user.instagramUsername}
                </ThemedText>
              )}
            </ThemedView>

            {/* Action Buttons */}
            {pendingRequestsCount > 0 && (
              <ThemedView className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => router.push("/follow-requests")}
                  className="flex-1 py-2 rounded-lg items-center bg-gray-200 dark:bg-white/20"
                >
                  <ThemedText type="defaultSemiBold" className="text-sm">
                    Solicitações de Amizade ({pendingRequestsCount})
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>

          {/* Pins Section */}
          <ThemedView className="px-4 py-4">
            {loading ? (
              <ThemedView className="py-12 items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
              </ThemedView>
            ) : pins.length > 0 ? (
              pins.map((pin) => (
                <PinCard key={pin.id} pin={pin} onUpdate={loadProfileData} />
              ))
            ) : (
              <ThemedView className="py-12 items-center">
                <Ionicons name="map-outline" size={48} color={mutedTextColor} />
                <ThemedText className="mt-4 text-center" style={{ color: mutedTextColor }}>
                  Seus pins aparecerão aqui
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
