import { STORAGE_CONFIG } from "@/config/api.config";
import { createClient } from "@supabase/supabase-js";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { Alert, ActionSheetIOS, Platform } from "react-native";

// Initialize Supabase client with anon public key for storage uploads
const supabase = createClient(
  STORAGE_CONFIG.SUPABASE_URL,
  STORAGE_CONFIG.ANON_KEY
);

export interface UploadMediaOptions {
  bucket?: string;
  folder?: string;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export interface MediaUploadResult {
  url: string;
  fileName: string;
}

export const useMediaUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Request media library permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Precisamos de permissão para acessar suas fotos."
      );
      return false;
    }

    return true;
  };

  /**
   * Request camera permissions
   */
  const requestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Precisamos de permissão para acessar sua câmera."
      );
      return false;
    }

    return true;
  };

  /**
   * Pick an image from the gallery
   */
  const pickImage = async (
    options: UploadMediaOptions = {}
  ): Promise<string | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: options.quality ?? 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  };

  /**
   * Take a photo with the camera
   */
  const takePhoto = async (
    options: UploadMediaOptions = {}
  ): Promise<string | null> => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      quality: options.quality ?? 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  };

  /**
   * Upload media to Supabase storage
   */
  const uploadMedia = async (
    uri: string,
    options: UploadMediaOptions = {}
  ): Promise<MediaUploadResult | null> => {
    try {
      setUploading(true);
      setProgress(0);

      const bucket = options.bucket || STORAGE_CONFIG.BUCKET;
      const folder = options.folder || STORAGE_CONFIG.FOLDERS.PINS;

      // Generate a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

      setProgress(20);

      // Read the file using expo-file-system (more reliable in iOS simulator)
      // This works better than fetch() for local file URIs in React Native
      let arrayBuffer: ArrayBuffer;

      try {
        // Use the new File API which handles file URIs properly
        const file = new FileSystem.File(uri);
        const base64 = await file.base64();

        // Convert base64 to ArrayBuffer for Supabase
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } catch (fileSystemError) {
        // Fallback to fetch if File API fails (e.g., for certain content URIs)
        console.warn(
          "File API failed, falling back to fetch:",
          fileSystemError
        );
        const response = await fetch(uri);
        const blob = await response.blob();

        // Convert blob to ArrayBuffer
        if (blob.arrayBuffer) {
          arrayBuffer = await blob.arrayBuffer();
        } else {
          // Fallback for React Native: use FileReader
          arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) resolve(reader.result as ArrayBuffer);
              else reject(new Error("Failed to read file as ArrayBuffer"));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
          });
        }
      }

      setProgress(40);

      // Upload to Supabase Storage
      // Note: Network errors in iOS simulator are common and don't affect TestFlight/real devices
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExtension}`,
          upsert: false,
        });

      setProgress(80);

      if (error) {
        console.error("Supabase upload error:", error);
        // Provide more context about the error
        const errorMessage =
          error.message ||
          (error as any).originalError?.message ||
          "Network request failed";

        // Log additional info for debugging
        if (__DEV__) {
          console.log("Upload details:", {
            fileName,
            bucket,
            arrayBufferSize: arrayBuffer.byteLength,
            contentType: `image/${fileExtension}`,
          });
        }

        throw new Error(errorMessage);
      }

      setProgress(100);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Defensive: ensure the publicUrl is a direct image link
      let publicUrl = publicUrlData?.publicUrl;
      if (publicUrl && !publicUrl.endsWith(fileName)) {
        // If the returned URL is just the folder, append the fileName
        if (publicUrl.endsWith("/")) {
          publicUrl = publicUrl + fileName;
        } else {
          publicUrl = publicUrl + "/" + fileName;
        }
      }

      return {
        url: publicUrl,
        fileName,
      };
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Erro no Upload",
        "Não foi possível fazer o upload da imagem. Tente novamente."
      );
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /**
   * Pick and upload image from gallery
   */
  const pickAndUploadImage = async (
    options: UploadMediaOptions = {}
  ): Promise<MediaUploadResult | null> => {
    const uri = await pickImage(options);
    if (!uri) return null;

    return uploadMedia(uri, options);
  };

  /**
   * Take photo and upload
   */
  const takePhotoAndUpload = async (
    options: UploadMediaOptions = {}
  ): Promise<MediaUploadResult | null> => {
    const uri = await takePhoto(options);
    if (!uri) return null;

    return uploadMedia(uri, options);
  };

  /**
   * Show native action sheet and handle image selection/upload
   */
  const showImagePicker = async (
    options: UploadMediaOptions = {}
  ): Promise<MediaUploadResult | null> => {
    return new Promise((resolve) => {
      if (Platform.OS === "ios") {
        // iOS: Use native ActionSheet
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancelar", "Fototeca", "Tirar Foto"],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              // Fototeca (Photo Library)
              const result = await pickAndUploadImage(options);
              resolve(result);
            } else if (buttonIndex === 2) {
              // Tirar Foto (Take Photo)
              const result = await takePhotoAndUpload(options);
              resolve(result);
            } else {
              // Cancel
              resolve(null);
            }
          }
        );
      } else {
        // Android: Use Alert with action buttons
        Alert.alert(
          "Escolher imagem",
          "Selecione uma opção",
          [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(null) },
            {
              text: "Fototeca",
              onPress: async () => {
                const result = await pickAndUploadImage(options);
                resolve(result);
              },
            },
            {
              text: "Tirar Foto",
              onPress: async () => {
                const result = await takePhotoAndUpload(options);
                resolve(result);
              },
            },
          ],
          { cancelable: true, onDismiss: () => resolve(null) }
        );
      }
    });
  };

  /**
   * Show native action sheet and return image URI (without upload)
   */
  const showImagePickerForUri = async (
    options: UploadMediaOptions = {}
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      if (Platform.OS === "ios") {
        // iOS: Use native ActionSheet
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancelar", "Fototeca", "Tirar Foto"],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              // Fototeca (Photo Library)
              const uri = await pickImage(options);
              resolve(uri);
            } else if (buttonIndex === 2) {
              // Tirar Foto (Take Photo)
              const uri = await takePhoto(options);
              resolve(uri);
            } else {
              // Cancel
              resolve(null);
            }
          }
        );
      } else {
        // Android: Use Alert with action buttons
        Alert.alert(
          "Escolher imagem",
          "Selecione uma opção",
          [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(null) },
            {
              text: "Fototeca",
              onPress: async () => {
                const uri = await pickImage(options);
                resolve(uri);
              },
            },
            {
              text: "Tirar Foto",
              onPress: async () => {
                const uri = await takePhoto(options);
                resolve(uri);
              },
            },
          ],
          { cancelable: true, onDismiss: () => resolve(null) }
        );
      }
    });
  };

  return {
    uploading,
    progress,
    pickImage,
    takePhoto,
    uploadMedia,
    pickAndUploadImage,
    takePhotoAndUpload,
    showImagePicker,
    showImagePickerForUri,
    requestPermissions,
    requestCameraPermissions,
  };
};
