import { PinCard } from "@/components/pin-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth.context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const borderColor = useThemeColor({}, "icon");
  const mutedTextColor = useThemeColor({ light: "#666", dark: "#999" }, "icon");
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert("Error", "Failed to logout");
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

  const StatItem = ({ label, value }: { label: string; value: number }) => (
    <ThemedView className="items-center">
      <ThemedText type="defaultSemiBold" className="text-2xl">
        {value}
      </ThemedText>
      <ThemedText className="text-sm" style={{ color: mutedTextColor }}>
        {label}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView className="flex-1">
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
                <StatItem label="Pins" value={0} />
                <StatItem label="Places" value={0} />
                <StatItem label="Friends" value={0} />
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
            <ThemedView className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 py-2 rounded-lg items-center bg-gray-200 dark:bg-white/20"
                style={
                  {
                    // borderWidth: 1,
                    // borderColor: borderColor,
                  }
                }
              >
                <ThemedText type="defaultSemiBold" className="text-sm">
                  Solicitações de Amizade (3)
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Pins Section */}
          <ThemedView className="">
            <PinCard />
            <PinCard />
            <PinCard />
            <PinCard />
            <PinCard />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
