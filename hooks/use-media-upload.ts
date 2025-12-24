import { STORAGE_CONFIG } from "@/config/api.config";
import { createClient } from "@supabase/supabase-js";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

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

      // Read the file as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer for Supabase (React Native workaround)
      let arrayBuffer;
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

      setProgress(40);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExtension}`,
          upsert: false,
        });

      setProgress(80);

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(error.message);
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

  return {
    uploading,
    progress,
    pickImage,
    takePhoto,
    uploadMedia,
    pickAndUploadImage,
    takePhotoAndUpload,
    requestPermissions,
    requestCameraPermissions,
  };
};
