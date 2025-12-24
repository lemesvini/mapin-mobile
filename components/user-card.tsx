import React, { useState, useEffect } from "react";
import {
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/contexts/auth.context";

interface UserCardProps {
  user: User;
  onFollowChange?: () => void;
}

export const UserCard = ({ user, onFollowChange }: UserCardProps) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);
  const [followRequestStatus, setFollowRequestStatus] = useState<
    "PENDING" | "ACCEPTED" | "REJECTED" | null
  >(user.followRequestStatus ?? null);
  const [loading, setLoading] = useState(false);
  const mutedTextColor = useThemeColor({ light: "#666", dark: "#999" }, "icon");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isOwnProfile = currentUser?.id === user.id;

  // Update local state when user prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing ?? false);
    setFollowRequestStatus(user.followRequestStatus ?? null);
  }, [user.id, user.isFollowing, user.followRequestStatus]);

  const handleFollowToggle = async (e: any) => {
    e.stopPropagation(); // Prevent navigation when clicking the button

    try {
      setLoading(true);

      if (isFollowing) {
        // Unfollow
        await userService.unfollowUser(user.id);
        setIsFollowing(false);
        setFollowRequestStatus(null);
        onFollowChange?.();
      } else if (followRequestStatus === "PENDING") {
        // Cancel follow request
        await userService.cancelFollowRequest(user.id);
        setFollowRequestStatus(null);
        onFollowChange?.();
      } else {
        // Follow or send request
        const response = await userService.followUser(user.id);

        if (response.request) {
          // Follow request sent
          setFollowRequestStatus("PENDING");
        } else if (response.follow) {
          // Followed directly
          setIsFollowing(true);
        }
        onFollowChange?.();
      }
    } catch (error: any) {
      console.error("Follow error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Não foi possível realizar a ação";

      // If the error is about already pending request, just refresh to update the UI
      if (
        errorMessage.includes("already pending") ||
        errorMessage.includes("already following")
      ) {
        onFollowChange?.();
      } else {
        Alert.alert("Erro", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFollowButtonText = () => {
    if (isFollowing) return "Seguindo";
    if (followRequestStatus === "PENDING") return "Solicitado";
    return "Seguir";
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/user-profile?username=${user.username}`)}
      className="flex-row items-center p-4 border-b border-black/20 dark:border-white/20"
    >
      <ThemedView className="flex-row flex-1 items-center">
        {user.profilePictureUrl ? (
          <Image
            source={{ uri: user.profilePictureUrl }}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <ThemedView className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3 items-center justify-center">
            <Ionicons name="person" size={24} color="#808080" />
          </ThemedView>
        )}

        <ThemedView className="flex-1">
          <ThemedText
            type="defaultSemiBold"
            className="text-base"
            numberOfLines={1}
          >
            @{user.username}
          </ThemedText>
          <ThemedText
            className="text-sm"
            style={{ color: mutedTextColor }}
            numberOfLines={1}
          >
            {user.fullName}
          </ThemedText>
          {/* {user.bio && (
            <ThemedText
              className="text-xs mt-1"
              style={{ color: mutedTextColor }}
              numberOfLines={1}
            >
              {user.bio}
            </ThemedText>
          )} */}
        </ThemedView>
      </ThemedView>

      {!isOwnProfile && (
        <TouchableOpacity
          onPress={handleFollowToggle}
          disabled={loading}
          activeOpacity={0.7}
          className={`hidden px-4 py-2 rounded-xl min-w-[100px] items-center ${
            isFollowing || followRequestStatus === "PENDING"
              ? "bg-black/20 dark:bg-white/10"
              : "bg-blue-500"
          }`}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                isFollowing || followRequestStatus === "PENDING"
                  ? isDark
                    ? "#fff"
                    : "#000"
                  : "#fff"
              }
            />
          ) : (
            <ThemedText
              type="defaultSemiBold"
              className={`text-sm ${
                isFollowing || followRequestStatus === "PENDING"
                  ? "text-black/80 dark:text-white/80"
                  : "text-white"
              }`}
            >
              {getFollowButtonText()}
            </ThemedText>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
