import { ThemedText } from "@/components/themed-text";
import { STORAGE_CONFIG } from "@/config/api.config";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { pinService } from "@/services/pin.service";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_CONTENT_LENGTH = 140;

type StepType = "content" | "image" | "mood" | "feeling";

export default function CreatePinScreen() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [moodScale, setMoodScale] = useState<number>(5);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Current step
  const [currentStep, setCurrentStep] = useState<StepType>("content");

  // Media upload hook
  const { uploading, progress, showImagePicker } = useMediaUpload();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Permissão de localização negada");
        Alert.alert(
          "Permissão Necessária",
          "Por favor, habilite a permissão de localização nas configurações para criar pins.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir Configurações",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error("Location error:", error);
      setLocationError("Erro ao obter localização");
      Alert.alert(
        "Erro",
        "Não foi possível obter sua localização. Verifique se o GPS está ativado."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCreatePin = async () => {
    if (!location) {
      Alert.alert("Erro", "Localização não disponível. Tente novamente.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Erro", "Por favor, escreva algo para o seu pin");
      return;
    }

    try {
      setLoading(true);

      const pinData = {
        lat: location.latitude,
        lng: location.longitude,
        content: content.trim(),
        moodScale: moodScale !== 5 ? moodScale : undefined,
        feeling: feeling ?? undefined,
        isPublic: isPublic,
        mediaUrls: imageUrl
          ? [{ url: imageUrl, type: "IMAGE" as const }]
          : undefined,
      };

      await pinService.createPin(pinData);

      Alert.alert("Sucesso", "Pin criado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            setContent("");
            setImageUrl("");
            setMoodScale(5);
            setFeeling(null);
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error) {
      console.error("Create pin error:", error);
      Alert.alert("Erro", "Não foi possível criar o pin. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleImageSelection = async () => {
    const result = await showImagePicker({
      bucket: STORAGE_CONFIG.BUCKET,
      folder: STORAGE_CONFIG.FOLDERS.PINS,
      quality: 0.8,
    });

    if (result) {
      setImageUrl(result.url);
      setCurrentStep("content");
    }
  };

  const getMoodIcon = (scale: number): keyof typeof Ionicons.glyphMap => {
    if (scale <= 2) return "sad";
    if (scale <= 4) return "sad-outline";
    if (scale <= 6) return "ellipse";
    if (scale <= 8) return "happy-outline";
    return "happy";
  };

  const getMoodColor = (scale: number) => {
    if (scale <= 2) return "#EF4444";
    if (scale <= 4) return "#F97316";
    if (scale <= 6) return "#EAB308";
    if (scale <= 8) return "#22C55E";
    return "#10B981";
  };

  const getMoodLabel = (scale: number) => {
    if (scale <= 2) return "Muito mal";
    if (scale <= 4) return "Mal";
    if (scale <= 6) return "Neutro";
    if (scale <= 8) return "Bem";
    return "Muito bem";
  };

  const hasContent = content.trim().length > 0;
  const hasMood = moodScale !== 5;
  const hasFeeling = feeling !== null;
  const hasImage = imageUrl.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={["top"]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-black/20 dark:border-white/20">
        <TouchableOpacity
          onPress={handleCancel}
          disabled={loading}
          className="py-2 px-3"
        >
          <Text className="text-base text-black dark:text-white font-medium">
            Cancelar
          </Text>
        </TouchableOpacity>

        <ThemedText type="defaultSemiBold" className="text-lg">
          Novo Pin
        </ThemedText>

        <TouchableOpacity
          onPress={handleCreatePin}
          disabled={loading || !location || !content.trim()}
          className={`py-2 px-4 rounded-full ${
            loading || !location || !content.trim()
              ? "bg-blue-300 dark:bg-blue-800"
              : "bg-blue-600 dark:bg-blue-500"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-sm">Publicar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Bar - Top */}
      <View className="border-b border-black/20 dark:border-white/20 px-4 py-3 bg-white dark:bg-black">
        <View className="flex-row items-center justify-between">
          {/* Step Icons */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => setCurrentStep("content")}
              className={`p-2 rounded-full ${
                currentStep === "content" || hasContent
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : ""
              }`}
            >
              <View className="relative">
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={
                    currentStep === "content" || hasContent
                      ? "#3B82F6"
                      : "#6B7280"
                  }
                />
                {hasContent && currentStep !== "content" && (
                  <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-black" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentStep("image")}
              className={`p-2 rounded-full ${
                currentStep === "image" || hasImage
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : ""
              }`}
            >
              <View className="relative">
                <Ionicons
                  name="image-outline"
                  size={24}
                  color={
                    currentStep === "image" || hasImage ? "#3B82F6" : "#6B7280"
                  }
                />
                {hasImage && currentStep !== "image" && (
                  <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-black" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentStep("mood")}
              className={`p-2 rounded-full ${
                currentStep === "mood" || hasMood
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : ""
              }`}
            >
              <View className="relative">
                <Ionicons
                  name="happy-outline"
                  size={24}
                  color={
                    currentStep === "mood" || hasMood ? "#3B82F6" : "#6B7280"
                  }
                />
                {hasMood && currentStep !== "mood" && (
                  <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-black" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentStep("feeling")}
              className={`p-2 rounded-full ${
                currentStep === "feeling" || hasFeeling
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "6B7280"
              }`}
            >
              <View className="relative">
                <Ionicons
                  name="heart-outline"
                  size={24}
                  color={
                    currentStep === "feeling" || hasFeeling
                      ? "#3B82F6"
                      : "#6B7280"
                  }
                />
                {hasFeeling && currentStep !== "feeling" && (
                  <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-black" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Privacy Buttons */}
          <View className="flex-row border border-black/20 dark:border-white/20 rounded-full p-1">
            <TouchableOpacity
              onPress={() => setIsPublic(true)}
              className={`px-3 py-2 rounded-full ${
                isPublic ? "bg-blue-300 dark:bg-blue-800" : "bg-transparent"
              }`}
            >
              <Ionicons
                name="globe-outline"
                size={18}
                color={isPublic ? "white" : "#6B7280"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPublic(false)}
              className={`px-3 py-2 rounded-full ${
                !isPublic ? "bg-green-700 dark:bg-green-700" : "bg-transparent"
              }`}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={!isPublic ? "white" : "#6B7280"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Main Content Area */}
        <View className="flex-1 p-4">
          {/* Location Badge */}
          {loadingLocation ? (
            <View className="flex-row items-center mb-3 bg-black/20 dark:bg-white/20 self-start px-3 py-2 rounded-full">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="ml-2 text-xs text-black/60 dark:text-white/60">
                Obtendo localização...
              </Text>
            </View>
          ) : locationError ? (
            <TouchableOpacity
              onPress={requestLocationPermission}
              className="flex-row items-center mb-3 bg-red-100 dark:bg-red-900/30 self-start px-3 py-2 rounded-full"
            >
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <Text className="ml-1 text-xs text-red-600 dark:text-red-400">
                {locationError} - Tocar para tentar novamente
              </Text>
            </TouchableOpacity>
          ) : location ? (
            <View className="flex-row items-center mb-3 bg-blue-50 dark:bg-blue-900/20 self-start px-3 py-2 rounded-full">
              <Ionicons name="location" size={14} color="#3B82F6" />
              <Text className="ml-1 text-xs text-blue-700 dark:text-blue-300 font-medium">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          ) : null}

          {/* Step Content */}
          <View className="flex-1">
            {/* Content Step */}
            {currentStep === "content" && (
              <View className="flex-1">
                <TextInput
                  value={content}
                  onChangeText={(text) => {
                    if (text.length <= MAX_CONTENT_LENGTH) {
                      setContent(text);
                    }
                  }}
                  placeholder="O que está acontecendo?"
                  placeholderTextColor="#00000060"
                  className="text-black dark:text-white text-lg flex-1"
                  multiline
                  textAlignVertical="top"
                  maxLength={MAX_CONTENT_LENGTH}
                  autoFocus
                />
                <Text className="text-right text-sm text-black/60 dark:text-white/60 mt-2">
                  {content.length}/{MAX_CONTENT_LENGTH}
                </Text>
              </View>
            )}

            {/* Image Step */}
            {currentStep === "image" && (
              <View className="flex-1 justify-center">
                {imageUrl ? (
                  <View className="flex-1 justify-center items-center">
                    <View className="w-full mt-4 relative">
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-full h-64 rounded-2xl"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => setImageUrl("")}
                        className="absolute top-3 right-3 bg-black/70 rounded-full p-2"
                      >
                        <Ionicons name="close" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCurrentStep("content")}
                      className="mt-4 py-3 bg-blue-600 dark:bg-blue-500 rounded-xl w-full"
                    >
                      <Text className="text-center text-white font-bold">
                        Continuar
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View className="items-center mb-8">
                      <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
                        <Ionicons name="image" size={40} color="#3B82F6" />
                      </View>
                      <Text className="text-xl font-bold text-black dark:text-white mb-2">
                        Adicionar imagem
                      </Text>
                      <Text className="text-center text-black/60 dark:text-white/60">
                        Compartilhe uma foto do momento
                      </Text>
                    </View>

                    {uploading && (
                      <View className="mb-6">
                        <View className="h-2 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                        <Text className="text-center text-black/60 dark:text-white/60 mt-2">
                          Enviando... {progress}%
                        </Text>
                      </View>
                    )}

                    <View className="mb-6">
                      <TouchableOpacity
                        onPress={handleImageSelection}
                        disabled={uploading}
                        className={`flex-row items-center justify-center py-4 rounded-xl ${
                          uploading
                            ? "bg-blue-300 dark:bg-blue-800"
                            : "bg-blue-600 dark:bg-blue-500"
                        }`}
                      >
                        {uploading ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <Ionicons
                              name="image-outline"
                              size={24}
                              color="white"
                            />
                            <Text className="ml-2 text-base font-bold text-white">
                              Escolher Imagem
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>

                    <View className="border-t border-black/20 dark:border-white/20 pt-4">
                      <Text className="text-sm text-black/60 dark:text-white/60 mb-2">
                        Ou cole um link
                      </Text>
                      <TextInput
                        value={imageUrl}
                        onChangeText={setImageUrl}
                        placeholder="https://example.com/image.jpg"
                        placeholderTextColor="#00000060"
                        className="bg-white dark:bg-black rounded-xl px-4 py-3 text-base text-black dark:text-white border border-black/20 dark:border-white/20"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                      />
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Mood Step */}
            {currentStep === "mood" && (
              <View className="flex-1 justify-center">
                <View className="items-center mb-8">
                  <Ionicons
                    name={getMoodIcon(moodScale)}
                    size={80}
                    color={getMoodColor(moodScale)}
                  />
                  <Text
                    className="text-4xl font-bold mb-2 mt-4"
                    style={{ color: getMoodColor(moodScale) }}
                  >
                    {moodScale}
                  </Text>
                  <Text
                    className="text-xl font-semibold"
                    style={{ color: getMoodColor(moodScale) }}
                  >
                    {getMoodLabel(moodScale)}
                  </Text>
                </View>

                <View className="px-4">
                  <Slider
                    style={{ width: "100%", height: 50 }}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={moodScale}
                    onValueChange={setMoodScale}
                    minimumTrackTintColor={getMoodColor(moodScale)}
                    maximumTrackTintColor="#00000020"
                    thumbTintColor={getMoodColor(moodScale)}
                  />
                  <View className="flex-row justify-between mt-2">
                    <View className="items-center">
                      <Ionicons name="sad" size={24} color="#00000060" />
                      <Text className="text-xs text-black/60 dark:text-white/60 mt-1">
                        Muito mal
                      </Text>
                    </View>
                    <View className="items-center">
                      <Ionicons name="happy" size={24} color="#00000060" />
                      <Text className="text-xs text-black/60 dark:text-white/60 mt-1">
                        Muito bem
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setCurrentStep("content")}
                  className="mt-8 py-4 bg-blue-600 dark:bg-blue-500 rounded-xl mx-4"
                >
                  <Text className="text-center text-white font-bold text-base">
                    Confirmar Humor
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Feeling Step */}
            {currentStep === "feeling" && (
              <View className="flex-1 justify-center px-4">
                <View className="items-center mb-8">
                  <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
                    <Ionicons name="heart" size={40} color="#3B82F6" />
                  </View>
                  <Text className="text-xl font-bold text-black dark:text-white mb-2">
                    Como você se sente?
                  </Text>
                  <Text className="text-center text-black/60 dark:text-white/60">
                    Descreva seu sentimento em uma palavra
                  </Text>
                </View>

                <View className="mb-6">
                  <TextInput
                    value={feeling || ""}
                    onChangeText={(text) => {
                      // Only allow single word, no spaces
                      const singleWord = text.trim().split(" ")[0];
                      setFeeling(singleWord || null);
                    }}
                    placeholder="Ex: feliz, animado, tranquilo..."
                    placeholderTextColor="#00000060"
                    className="bg-white dark:bg-black rounded-xl px-4 py-4 text-2xl text-center text-black dark:text-white border-2 border-black/20 dark:border-white/20"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                    autoFocus
                  />
                </View>

                {feeling && (
                  <TouchableOpacity
                    onPress={() => setCurrentStep("content")}
                    className="py-4 bg-blue-600 dark:bg-blue-500 rounded-xl"
                  >
                    <Text className="text-center text-white font-bold text-base">
                      Confirmar Sentimento
                    </Text>
                  </TouchableOpacity>
                )}

                {feeling && (
                  <TouchableOpacity
                    onPress={() => {
                      setFeeling(null);
                    }}
                    className="mt-4"
                  >
                    <Text className="text-center text-black/60 dark:text-white/60">
                      Limpar
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
