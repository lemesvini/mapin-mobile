import {
  View,
  Image,
  TouchableOpacity,
  Pressable,
  Text,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "@/utils/date";
import { Pin } from "@/types/pin";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

interface MapPinCardProps {
  pin: Pin;
  onClose: () => void;
  onLike?: (pinId: string) => void;
}

export function MapPinCard({ pin, onClose, onLike }: MapPinCardProps) {
  const insets = useSafeAreaInsets();
  const timeAgo = formatDistanceToNow(new Date(pin.createdAt));
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const screenDimensions = Dimensions.get("window");

  // Tab bar height + gap
  const tabBarHeight = insets.bottom + 49;
  const gap = 16;
  const bottomPosition = tabBarHeight + gap;

  const handleLike = () => {
    onLike?.(pin.id);
  };

  const handleAuthorPress = () => {
    router.push(`/user-profile?username=${pin.author.username}`);
  };

  const handleImagePress = () => {
    if (pin.media && pin.media.length > 0) {
      setIsImageFullscreen(true);
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomPosition,
        left: 16,
        right: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        padding: 16,
      }}
    >
      {/* Close button */}
      <TouchableOpacity
        onPress={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={18} color="#000" />
      </TouchableOpacity>

      {/* Author info */}
      <Pressable
        onPress={handleAuthorPress}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        {pin.author.profilePictureUrl ? (
          <Image
            source={{ uri: pin.author.profilePictureUrl }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#E5E5E5",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>
              {pin.author.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#000" }}>
            {pin.author.fullName}
          </Text>
          <Text style={{ fontSize: 13, color: "#666" }}>
            @{pin.author.username} · {timeAgo}
          </Text>
        </View>
      </Pressable>

      {/* Feeling tag */}
      {pin.feeling && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 13, color: "#666", marginRight: 4 }}>
            se sentindo
          </Text>
          <View
            style={{
              backgroundColor: "rgba(29, 155, 240, 0.1)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1D9BF0" }}>
              {pin.feeling}
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      {pin.content && (
        <Text
          style={{
            fontSize: 15,
            color: "#000",
            lineHeight: 20,
            marginBottom: 12,
          }}
        >
          {pin.content}
        </Text>
      )}

      {/* Media */}
      {pin.media && pin.media.length > 0 && (
        <Pressable
          onPress={handleImagePress}
          style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden" }}
        >
          <Image
            source={{ uri: pin.media[0].url }}
            style={{ width: "100%", height: 200, borderRadius: 12 }}
            resizeMode="cover"
          />
          {pin.media.length > 1 && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>
                1 / {pin.media.length}
              </Text>
            </View>
          )}
        </Pressable>
      )}

      {/* Fullscreen Image Modal */}
      <Modal
        visible={isImageFullscreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageFullscreen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setIsImageFullscreen(false)}
            style={{
              position: "absolute",
              top: insets.top + 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Fullscreen image */}
          {pin.media && pin.media.length > 0 && (
            <Image
              source={{ uri: pin.media[0].url }}
              style={{
                width: screenDimensions.width,
                height: screenDimensions.height,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Actions */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
        <TouchableOpacity
          onPress={handleLike}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={pin.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={pin.isLiked ? "#F91880" : "#666"}
          />
          {pin._count.likes > 0 && (
            <Text
              style={{
                fontSize: 14,
                color: pin.isLiked ? "#F91880" : "#666",
              }}
            >
              {pin._count.likes}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          {pin._count.comments > 0 && (
            <Text style={{ fontSize: 14, color: "#666" }}>
              {pin._count.comments}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
