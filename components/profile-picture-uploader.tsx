import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./themed-text";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { STORAGE_CONFIG } from "@/config/api.config";

interface ProfilePictureUploaderProps {
  currentImageUrl?: string;
  onImageUploaded?: (url: string) => void;
  size?: number;
}

/**
 * Profile Picture Uploader Component
 *
 * Reusable component for uploading profile pictures with a circular preview.
 * Shows upload progress and handles both gallery and camera uploads.
 *
 * @example
 * ```tsx
 * <ProfilePictureUploader
 *   currentImageUrl={user?.profilePictureUrl}
 *   onImageUploaded={(url) => updateUserProfile({ profilePictureUrl: url })}
 *   size={120}
 * />
 * ```
 */
export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  size = 120,
}) => {
  const { uploading, progress, pickAndUploadImage, takePhotoAndUpload } =
    useMediaUpload();
  const [localImageUrl, setLocalImageUrl] = useState(currentImageUrl);
  const [showOptions, setShowOptions] = useState(false);

  const handleUploadComplete = (url: string) => {
    setLocalImageUrl(url);
    setShowOptions(false);
    onImageUploaded?.(url);
  };

  const handleGalleryUpload = async () => {
    const result = await pickAndUploadImage({
      bucket: STORAGE_CONFIG.BUCKET,
      folder: STORAGE_CONFIG.FOLDERS.PROFILES,
      allowsEditing: true,
      aspect: [1, 1], // Square for profile pictures
      quality: 0.9,
    });

    if (result) {
      handleUploadComplete(result.url);
    }
  };

  const handleCameraUpload = async () => {
    const result = await takePhotoAndUpload({
      bucket: STORAGE_CONFIG.BUCKET,
      folder: STORAGE_CONFIG.FOLDERS.PROFILES,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result) {
      handleUploadComplete(result.url);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      "Remover Foto",
      "Tem certeza que deseja remover sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            setLocalImageUrl(undefined);
            onImageUploaded?.("");
          },
        },
      ]
    );
  };

  return (
    <View className="items-center">
      {/* Profile Picture Circle */}
      <TouchableOpacity
        onPress={() => !uploading && setShowOptions(!showOptions)}
        disabled={uploading}
        style={{ width: size, height: size }}
        className="relative"
      >
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-black/20 dark:bg-white/20 items-center justify-center overflow-hidden border-4 border-white dark:border-black"
        >
          {localImageUrl ? (
            <Image
              source={{ uri: localImageUrl }}
              style={{ width: size, height: size }}
              className="rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={size * 0.5} color="#6B7280" />
          )}
        </View>

        {/* Edit Button Badge */}
        {!uploading && (
          <View
            className="absolute bottom-0 right-0 bg-blue-600 dark:bg-blue-500 rounded-full p-2 border-2 border-white dark:border-black"
            style={{ width: size * 0.25, height: size * 0.25 }}
          >
            <Ionicons name="camera" size={size * 0.15} color="white" />
          </View>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <View
            style={{ width: size, height: size }}
            className="absolute inset-0 bg-black/50 rounded-full items-center justify-center"
          >
            <ActivityIndicator size="large" color="white" />
            <ThemedText className="text-white text-xs mt-2">
              {progress}%
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>

      {/* Upload Options */}
      {showOptions && !uploading && (
        <View className="mt-4 w-full max-w-xs">
          <TouchableOpacity
            onPress={handleGalleryUpload}
            className="flex-row items-center justify-center py-3 px-4 bg-blue-600 dark:bg-blue-500 rounded-xl mb-2"
          >
            <Ionicons name="images-outline" size={20} color="white" />
            <ThemedText className="ml-2 text-white font-semibold">
              Escolher da Galeria
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCameraUpload}
            className="flex-row items-center justify-center py-3 px-4 bg-green-600 dark:bg-green-500 rounded-xl mb-2"
          >
            <Ionicons name="camera-outline" size={20} color="white" />
            <ThemedText className="ml-2 text-white font-semibold">
              Tirar Foto
            </ThemedText>
          </TouchableOpacity>

          {localImageUrl && (
            <TouchableOpacity
              onPress={handleRemoveImage}
              className="flex-row items-center justify-center py-3 px-4 bg-red-600 dark:bg-red-500 rounded-xl mb-2"
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <ThemedText className="ml-2 text-white font-semibold">
                Remover Foto
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowOptions(false)}
            className="flex-row items-center justify-center py-2 px-4"
          >
            <ThemedText className="text-black/60 dark:text-white/60">
              Cancelar
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
