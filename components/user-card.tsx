import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { router } from "expo-router";

interface UserCardProps {
  user: User;
  onFollowChange?: () => void;
}

export const UserCard = ({ user, onFollowChange }: UserCardProps) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [followRequestStatus, setFollowRequestStatus] = useState(
    user.followRequestStatus || null
  );
  const [loading, setLoading] = useState(false);

  // Update local state when user prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
    setFollowRequestStatus(user.followRequestStatus || null);
  }, [user.isFollowing, user.followRequestStatus]);

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

        console.log("Follow response:", response);

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

  const getFollowButtonStyle = () => {
    if (isFollowing || followRequestStatus === "PENDING") {
      return "bg-gray-200 dark:bg-gray-700";
    }
    return "bg-blue-500";
  };

  const getFollowButtonTextStyle = () => {
    if (isFollowing || followRequestStatus === "PENDING") {
      return "text-gray-700 dark:text-gray-300";
    }
    return "text-white";
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/user-profile?username=${user.username}`)}
      className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row flex-1 items-center">
        {user.profilePictureUrl ? (
          <Image
            source={{ uri: user.profilePictureUrl }}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 mr-3 items-center justify-center">
            <Text className="text-gray-600 dark:text-gray-400 text-lg font-bold">
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {user.username}
          </Text>
          <Text
            className="text-sm text-gray-600 dark:text-gray-400"
            numberOfLines={1}
          >
            {user.fullName}
          </Text>
          {user.bio && (
            <Text
              className="text-xs text-gray-500 dark:text-gray-500 mt-1"
              numberOfLines={1}
            >
              {user.bio}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleFollowToggle}
        disabled={loading}
        activeOpacity={0.7}
        className={`px-4 py-2 rounded-lg ${getFollowButtonStyle()} min-w-[100px] items-center`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            className={`text-sm font-semibold ${getFollowButtonTextStyle()}`}
          >
            {getFollowButtonText()}
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
