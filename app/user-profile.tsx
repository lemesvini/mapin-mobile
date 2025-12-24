import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { userService } from "@/services/user.service";
import { pinService } from "@/services/pin.service";
import { useAuth } from "@/contexts/auth.context";
import { useQuery } from "@tanstack/react-query";
import { PinCard } from "@/components/pin-card";
import { Pin } from "@/types/pin";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const mutedTextColor = useThemeColor({ light: "#666", dark: "#999" }, "icon");

  const isOwnProfile = currentUser?.username === username;

  // Fetch user profile data
  const {
    data: user,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      if (!username) throw new Error("No username");
      const data = await userService.getUserProfile(username);
      return data;
    },
    enabled: !!username,
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Fetch user pins - show all pins for now
  const {
    data: pinsData,
    isLoading: isLoadingPins,
    refetch: refetchPins,
  } = useQuery({
    queryKey: ["userPins", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user id");
      const data = await pinService.getUserPins(user.id, { limit: 50 });
      return data.pins || [];
    },
    enabled: !!user?.id,
  });

  const pins = pinsData || [];
  const loading = isLoadingUser || isLoadingPins;

  const onRefresh = async () => {
    await Promise.all([refetchUser(), refetchPins()]);
  };

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      if (user.isFollowing) {
        // Unfollow
        await userService.unfollowUser(user.id);
        await refetchUser();
      } else if (user.followRequestStatus === "PENDING") {
        // Cancel follow request
        await userService.cancelFollowRequest(user.id);
        await refetchUser();
      } else {
        // Follow or send request
        await userService.followUser(user.id);
        await refetchUser();
      }
      // Refresh pins after follow/unfollow
      await refetchPins();
    } catch (error: any) {
      console.error("Follow error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Não foi possível realizar a ação";
      Alert.alert("Erro", errorMessage);
    }
  };

  const getFollowButtonText = () => {
    if (user?.isFollowing) return "Seguindo";
    if (user?.followRequestStatus === "PENDING") return "Solicitado";
    return "Seguir";
  };

  if (loading) {
    return (
      <ThemedView className="flex-1">
        <Stack.Screen
          options={{
            headerShown: true,
            title: username || "Perfil",
            headerBackTitle: "Voltar",
          }}
        />
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE2C55" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView className="flex-1">
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Perfil",
            headerBackTitle: "Voltar",
          }}
        />
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Ionicons name="person-outline" size={64} color={mutedTextColor} />
          <ThemedText
            type="defaultSemiBold"
            className="mt-4 text-lg text-center"
          >
            Usuário não encontrado
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerShown: false,
          title: `@${username}`,
          headerBackTitle: "Voltar",
        }}
      />
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Fixed Header */}
        <ThemedView className="px-4 py-3 mb-6 flex-row justify-start gap-2 items-center border-b border-gray-200 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={mutedTextColor} />
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" className="text-xl">
            @{user.username}
          </ThemedText>
        </ThemedView>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        >
          {/* Profile Header */}
          <ThemedView className="items-center border-b border-black/20 dark:border-white/20 pb-6">
            {/* Avatar */}
            {user.profilePictureUrl ? (
              <Image
                source={{ uri: user.profilePictureUrl }}
                className="w-28 h-28 rounded-full mb-4"
                style={{
                  borderWidth: 2,
                  borderColor: isDark ? "#fff" : "#808080",
                }}
              />
            ) : (
              <ThemedView
                className="w-28 h-28 rounded-full mb-4 items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
                style={{
                  borderWidth: 2,
                  borderColor: isDark ? "#808080" : "#808080",
                }}
              >
                <Ionicons name="person" size={48} color="#808080" />
              </ThemedView>
            )}

            {/* Name */}
            <ThemedText type="defaultSemiBold" className="text-xl mb-1">
              {user.fullName}
            </ThemedText>

            {/* Stats Row */}
            <View className="p-2 rounded-xl flex-row items-center justify-center gap-6 mb-4 mt-3">
              <TouchableOpacity
                className="items-center w-24"
                onPress={() =>
                  router.push(
                    `/following?userId=${user.id}&username=${user.username}`
                  )
                }
              >
                <ThemedText type="defaultSemiBold" className="text-lg">
                  {user.followingCount || 0}
                </ThemedText>
                <ThemedText
                  className="text-sm"
                  style={{ color: mutedTextColor }}
                >
                  Seguindo
                </ThemedText>
              </TouchableOpacity>

              <ThemedView
                className="w-px h-4"
                style={{ backgroundColor: mutedTextColor }}
              />

              <TouchableOpacity
                className="items-center w-24"
                onPress={() =>
                  router.push(
                    `/followers?userId=${user.id}&username=${user.username}`
                  )
                }
              >
                <ThemedText type="defaultSemiBold" className="text-lg">
                  {user.followersCount || 0}
                </ThemedText>
                <ThemedText
                  className="text-sm"
                  style={{ color: mutedTextColor }}
                >
                  Seguidores
                </ThemedText>
              </TouchableOpacity>

              <ThemedView
                className="w-px h-4"
                style={{ backgroundColor: mutedTextColor }}
              />

              <TouchableOpacity className="items-center w-24">
                <ThemedText type="defaultSemiBold" className="text-lg">
                  {pins.length}
                </ThemedText>
                <ThemedText
                  className="text-sm"
                  style={{ color: mutedTextColor }}
                >
                  Pins
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Bio */}
            {user.bio && (
              <ThemedText className="text-sm text-center px-8 mb-3 leading-5">
                {user.bio}
              </ThemedText>
            )}

            {/* Instagram */}
            {/* {user.instagramUsername && (
              <TouchableOpacity className="flex-row items-center gap-1 mb-4">
                <Ionicons
                  name="logo-instagram"
                  size={16}
                  color={mutedTextColor}
                />
                <ThemedText
                  className="text-sm"
                  style={{ color: mutedTextColor }}
                >
                  @{user.instagramUsername}
                </ThemedText>
              </TouchableOpacity>
            )} */}

            {/* Private Account Indicator */}
            {/* {user.isPrivate && (
              <View className="flex-row items-center mb-4">
                <Ionicons name="lock-closed" size={14} color={mutedTextColor} />
                <ThemedText
                  className="text-sm ml-1"
                  style={{ color: mutedTextColor }}
                >
                  Conta privada
                </ThemedText>
              </View>
            )} */}

            {/* Follow Button (if not own profile) */}
            <ThemedView className="flex-row items-center gap-1">
              {!isOwnProfile && (
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  disabled={loading}
                  className={`px-8 py-3 rounded-xl items-center ${
                    user.isFollowing || user.followRequestStatus === "PENDING"
                      ? "bg-black/20 dark:bg-white/10"
                      : "bg-blue-500"
                  }`}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    className={
                      user.isFollowing || user.followRequestStatus === "PENDING"
                        ? "text-black/80 dark:text-white/80"
                        : "text-white"
                    }
                  >
                    {getFollowButtonText()}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {user.instagramUsername && (
                <TouchableOpacity className="flex-row items-center gap-1 bg-black/20 dark:bg-white/10 rounded-xl p-3">
                  <Ionicons
                    name="logo-instagram"
                    size={24}
                    color={isDark ? "#fff" : "#000"}
                  />
                  {/* <ThemedText
                    className="text-sm"
                    style={{ color: mutedTextColor }}
                  >
                    @{user.instagramUsername}
                  </ThemedText> */}
                </TouchableOpacity>
              )}
            </ThemedView>
          </ThemedView>
          {/* Pins Grid */}
          <ThemedView className="py-4 pb-8">
            {loading ? (
              <ThemedView className="py-12 items-center">
                <ActivityIndicator size="large" color="#FE2C55" />
              </ThemedView>
            ) : pins.length > 0 ? (
              <ThemedView>
                {pins.map((pin: Pin) => (
                  <PinCard
                    key={pin.id}
                    pin={pin}
                    onPress={(pinId) => {
                      router.push(`/?pinId=${pinId}` as any);
                    }}
                  />
                ))}
              </ThemedView>
            ) : (
              <ThemedView className="py-16 items-center px-8">
                <Ionicons name="map-outline" size={64} color={mutedTextColor} />
                <ThemedText
                  type="defaultSemiBold"
                  className="mt-4 text-center text-base"
                >
                  Nenhum pin ainda
                </ThemedText>
                <ThemedText
                  className="mt-2 text-center text-sm"
                  style={{ color: mutedTextColor }}
                >
                  {isOwnProfile
                    ? "Seus pins aparecerão aqui quando você criá-los"
                    : `${user.username} ainda não tem pins`}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
