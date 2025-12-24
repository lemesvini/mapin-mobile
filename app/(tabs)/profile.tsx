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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth.context";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { pinService } from "@/services/pin.service";
import { PinCard } from "@/components/pin-card";
import { Pin } from "@/types/pin";
import { ProfilePictureUploader } from "@/components/profile-picture-uploader";

// const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  // const borderColor = useThemeColor({}, "icon");
  const mutedTextColor = useThemeColor({ light: "#666", dark: "#999" }, "icon");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#1a1a1a" },
    "background"
  );
  const { user, refreshUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBio, setEditingBio] = useState("");
  const [editingFullName, setEditingFullName] = useState("");
  const [editingInstagramUsername, setEditingInstagramUsername] = useState("");
  const [editingProfilePictureUrl, setEditingProfilePictureUrl] = useState<
    string | undefined
  >(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile data
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile", user?.username],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      const data = await userService.getUserProfile(user.username);
      return {
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
      };
    },
    enabled: !!user?.username,
  });

  // Fetch user pins
  const {
    data: pinsData,
    isLoading: isLoadingPins,
    refetch: refetchPins,
  } = useQuery({
    queryKey: ["userPins", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      const data = await pinService.getUserPins(user.id, { limit: 50 });
      return data.pins || [];
    },
    enabled: !!user?.id,
  });

  // Fetch pending requests
  const { data: pendingRequestsData, refetch: refetchPendingRequests } =
    useQuery({
      queryKey: ["pendingRequests"],
      queryFn: async () => {
        const data = await userService.getPendingRequests({ limit: 100 });
        return data.total || 0;
      },
      enabled: !!user,
    });

  const pins = pinsData || [];
  const pendingRequestsCount = pendingRequestsData || 0;
  const loading = isLoadingProfile || isLoadingPins;

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchPins();
      refetchPendingRequests();
    }, [refetchProfile, refetchPins, refetchPendingRequests])
  );

  const onRefresh = async () => {
    await Promise.all([
      refetchProfile(),
      refetchPins(),
      refetchPendingRequests(),
      refreshUser(),
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
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
          } catch {
            Alert.alert("Erro", "Falha ao sair");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const openEditModal = () => {
    if (!user) return;
    setEditingBio(user.bio || "");
    setEditingFullName(user.fullName || "");
    setEditingInstagramUsername(user.instagramUsername || "");
    setEditingProfilePictureUrl(user.profilePictureUrl);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingBio("");
    setEditingFullName("");
    setEditingInstagramUsername("");
    setEditingProfilePictureUrl(undefined);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await userService.updateProfile({
        bio: editingBio.trim() || undefined,
        fullName: editingFullName.trim(),
        instagramUsername: editingInstagramUsername.trim() || undefined,
        profilePictureUrl: editingProfilePictureUrl,
      });

      await refreshUser();
      await Promise.all([
        refetchProfile(),
        refetchPins(),
        refetchPendingRequests(),
      ]);
      closeEditModal();
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Erro", error.message || "Falha ao atualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Fixed Header */}
        <ThemedView className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200 dark:border-gray-800">
          <ThemedText type="defaultSemiBold" className="text-xl">
            @{user.username}
          </ThemedText>
          <ThemedView className="flex-row items-center gap-4">
            <TouchableOpacity onPress={openEditModal}>
              <Ionicons name="create-outline" size={24} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <ActivityIndicator size="small" />
              ) : (
                <Ionicons name="menu-outline" size={28} color={textColor} />
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        >
          {/* Profile Header */}
          <ThemedView className="items-center py-6">
            {/* Avatar */}
            {user.profilePictureUrl ? (
              <Image
                source={{ uri: user.profilePictureUrl }}
                className="w-28 h-28 rounded-full mb-4"
                style={{ borderWidth: 2, borderColor: "#FE2C55" }}
              />
            ) : (
              <ThemedView
                className="w-28 h-28 rounded-full mb-4 items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
                style={{ borderWidth: 2, borderColor: "#FE2C55" }}
              >
                <ThemedText className="text-4xl text-white font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </ThemedText>
              </ThemedView>
            )}

            {/* Name */}
            <ThemedText type="defaultSemiBold" className="text-xl mb-1">
              {user.fullName}
            </ThemedText>

            {/* Stats Row */}
            <ThemedView className="flex-row items-center justify-center gap-6 mb-4 mt-3">
              <TouchableOpacity className="items-center">
                <ThemedText type="defaultSemiBold" className="text-lg">
                  {profileData?.followingCount || 0}
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
                className="items-center"
                onPress={() =>
                  router.push(
                    `/followers?userId=${user.id}&username=${user.username}`
                  )
                }
              >
                <ThemedText type="defaultSemiBold" className="text-lg">
                  {profileData?.followersCount || 0}
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

              <TouchableOpacity className="items-center">
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
            </ThemedView>

            {/* Bio */}
            {user.bio && (
              <ThemedText className="text-sm text-center px-8 mb-3 leading-5">
                {user.bio}
              </ThemedText>
            )}

            {/* Instagram */}
            {user.instagramUsername && (
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
            )}

            {/* Pending Requests Button */}
            {pendingRequestsCount > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/follow-requests")}
                className="mx-4 py-3 px-6 rounded-full items-center flex-row gap-2"
                style={{ backgroundColor: "#FE2C55" }}
              >
                <Ionicons name="person-add" size={18} color="#fff" />
                <ThemedText
                  type="defaultSemiBold"
                  className="text-sm text-white"
                >
                  {pendingRequestsCount} Solicitaç
                  {pendingRequestsCount === 1 ? "ão" : "ões"}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>

          {/* Divider */}
          <ThemedView
            className="h-2"
            style={{
              backgroundColor:
                backgroundColor === "#fff" ? "#f3f4f6" : "#0a0a0a",
            }}
          />

          {/* Pins Grid */}
          <ThemedView className="py-4">
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
                  Seus pins aparecerão aqui quando você criá-los
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <SafeAreaView edges={["top"]} className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ThemedView className="flex-1">
              {/* Modal Header */}
              <ThemedView className="px-4 py-4 flex-row justify-between items-center border-b border-gray-200 dark:border-gray-800">
                <TouchableOpacity onPress={closeEditModal}>
                  <Ionicons name="close" size={28} color={textColor} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" className="text-lg">
                  Editar Perfil
                </ThemedText>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={isSaving || !editingFullName.trim()}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FE2C55" />
                  ) : (
                    <Ionicons
                      name="checkmark"
                      size={28}
                      color={
                        !editingFullName.trim() ? mutedTextColor : "#FE2C55"
                      }
                    />
                  )}
                </TouchableOpacity>
              </ThemedView>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                <ThemedView className="px-4 py-6">
                  {/* Profile Picture Uploader */}
                  <ThemedView className="items-center mb-8">
                    <ProfilePictureUploader
                      currentImageUrl={editingProfilePictureUrl}
                      onImageUploaded={(url) =>
                        setEditingProfilePictureUrl(url || undefined)
                      }
                      size={120}
                    />
                    <ThemedText
                      className="text-sm mt-3"
                      style={{ color: mutedTextColor }}
                    >
                      Toque para alterar foto
                    </ThemedText>
                  </ThemedView>

                  {/* Full Name Input */}
                  <ThemedView className="mb-5">
                    <ThemedText
                      type="defaultSemiBold"
                      className="mb-2 text-sm"
                      style={{ color: mutedTextColor }}
                    >
                      NOME
                    </ThemedText>
                    <TextInput
                      value={editingFullName}
                      onChangeText={setEditingFullName}
                      placeholder="Seu nome completo"
                      placeholderTextColor={mutedTextColor}
                      className="border-b border-gray-300 dark:border-gray-700 pb-3 text-base"
                      style={{
                        color: textColor,
                        backgroundColor: "transparent",
                      }}
                      maxLength={100}
                    />
                  </ThemedView>

                  {/* Bio Input */}
                  <ThemedView className="mb-5">
                    <ThemedText
                      type="defaultSemiBold"
                      className="mb-2 text-sm"
                      style={{ color: mutedTextColor }}
                    >
                      BIO
                    </ThemedText>
                    <TextInput
                      value={editingBio}
                      onChangeText={setEditingBio}
                      placeholder="Conte um pouco sobre você..."
                      placeholderTextColor={mutedTextColor}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      className="border-b border-gray-300 dark:border-gray-700 pb-3 text-base min-h-[80px]"
                      style={{
                        color: textColor,
                        backgroundColor: "transparent",
                      }}
                      maxLength={500}
                    />
                    <ThemedText
                      className="text-xs mt-2 text-right"
                      style={{ color: mutedTextColor }}
                    >
                      {editingBio.length}/500
                    </ThemedText>
                  </ThemedView>

                  {/* Instagram Username Input */}
                  <ThemedView className="mb-5">
                    <ThemedText
                      type="defaultSemiBold"
                      className="mb-2 text-sm"
                      style={{ color: mutedTextColor }}
                    >
                      INSTAGRAM
                    </ThemedText>
                    <ThemedView className="flex-row items-center border-b border-gray-300 dark:border-gray-700 pb-3">
                      <Ionicons
                        name="logo-instagram"
                        size={20}
                        color={mutedTextColor}
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        value={editingInstagramUsername}
                        onChangeText={setEditingInstagramUsername}
                        placeholder="seu_usuario"
                        placeholderTextColor={mutedTextColor}
                        className="flex-1 text-base"
                        style={{
                          color: textColor,
                          backgroundColor: "transparent",
                        }}
                        autoCapitalize="none"
                      />
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              </ScrollView>
            </ThemedView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}
