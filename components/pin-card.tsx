import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Pin } from "@/types/pin";
import { View, Image, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDistanceToNow } from "@/utils/date";
import { useState } from "react";

interface PinCardProps {
  pin: Pin;
  onLike?: (pinId: string) => void;
  onComment?: (pinId: string) => void;
  onPress?: (pinId: string) => void;
}

export function PinCard({ pin, onLike, onComment, onPress }: PinCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isLiked, setIsLiked] = useState(pin.isLiked);
  const [likesCount, setLikesCount] = useState(pin._count.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike?.(pin.id);
  };

  const timeAgo = formatDistanceToNow(new Date(pin.createdAt));

  return (
    <Pressable
      onPress={() => onPress?.(pin.id)}
      className="border-b border-gray-200 dark:border-gray-800"
    >
      <ThemedView className="p-4">
        {/* Header */}
        <View className="flex-row items-start mb-3">
          {/* Avatar */}
          <View className="mr-3">
            {pin.author.profilePictureUrl ? (
              <Image
                source={{ uri: pin.author.profilePictureUrl }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 items-center justify-center">
                <ThemedText className="text-xl font-bold">
                  {pin.author.fullName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Author Info */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <ThemedText className="font-bold text-base">
                {pin.author.fullName}
              </ThemedText>
              <ThemedText className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                @{pin.author.username}
              </ThemedText>
              <ThemedText className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                · {timeAgo}
              </ThemedText>
            </View>

            {/* Mood indicator */}
            {pin.moodScale && (
              <View className="flex-row items-center mt-1">
                <View
                  className="px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <ThemedText className="text-xs text-blue-600 dark:text-blue-400">
                    {pin.feeling || "Mood"} {pin.moodScale}/10
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <ThemedText className="text-base mb-3 leading-5">
          {pin.content}
        </ThemedText>

        {/* Media */}
        {pin.media && pin.media.length > 0 && (
          <View className="mb-3 rounded-2xl overflow-hidden">
            <Image
              source={{ uri: pin.media[0].url }}
              className="w-full h-64"
              resizeMode="cover"
            />
            {pin.media.length > 1 && (
              <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-full">
                <ThemedText className="text-white text-xs">
                  +{pin.media.length - 1}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row items-center justify-between pt-2">
          {/* Comment */}
          <TouchableOpacity
            onPress={() => onComment?.(pin.id)}
            className="flex-row items-center"
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            {pin._count.comments > 0 && (
              <ThemedText className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {pin._count.comments}
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Like */}
          <TouchableOpacity
            onPress={handleLike}
            className="flex-row items-center"
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#EF4444" : isDark ? "#9CA3AF" : "#6B7280"}
            />
            {likesCount > 0 && (
              <ThemedText
                className={`ml-2 text-sm ${
                  isLiked
                    ? "text-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {likesCount}
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Location indicator */}
          <TouchableOpacity className="flex-row items-center">
            <Ionicons
              name="location-outline"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity className="flex-row items-center">
            <Ionicons
              name="share-outline"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Pressable>
  );
}
