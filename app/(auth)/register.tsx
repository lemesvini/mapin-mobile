import { useState, useEffect, useRef } from "react";
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  View,
  Image,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth.context";
import { StatusBar } from "expo-status-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { userService } from "@/services/user.service";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor(
    { light: "#D1D5DB", dark: "#374151" },
    "icon"
  );
  const tintColor = useThemeColor({}, "tint");
  const mapinIcon =
    colorScheme === "dark"
      ? require("@/assets/images/mapin-icon-dark.png")
      : require("@/assets/images/mapin-icon.png");
  const isDark = colorScheme === "dark";

  // Check username availability with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    // Reset state if username is too short
    if (username.length < 3) {
      setIsUsernameAvailable(null);
      setIsCheckingUsername(false);
      return;
    }

    // Validate username format (alphanumeric and underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setIsUsernameAvailable(false);
      setIsCheckingUsername(false);
      return;
    }

    // Set loading state
    setIsCheckingUsername(true);
    setIsUsernameAvailable(null);

    // Debounce the API call
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const available = await userService.checkUsernameAvailability(username);
        setIsUsernameAvailable(available);
      } catch {
        // On error, assume not available
        setIsUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500); // 500ms debounce

    // Cleanup function
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [username]);

  const handleRegister = async () => {
    // Validation
    if (!email || !username || !fullName || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      Alert.alert(
        "Error",
        "Nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números e sublinhados"
      );
      return;
    }

    // Check if username is available
    if (isUsernameAvailable === false) {
      Alert.alert("Error", "Este nome de usuário já está em uso");
      return;
    }

    if (isCheckingUsername) {
      Alert.alert("Error", "Aguarde enquanto verificamos o nome de usuário");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, username, fullName, password });
      // Navigation will be handled automatically by the root layout
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Unable to create account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-12">
            {/* Header */}
            <View className="items-center mb-10">
              <Image
                source={mapinIcon}
                style={{ width: 80, height: 80, marginBottom: 16 }}
                resizeMode="contain"
              />
              <ThemedText type="title" className="mb-2">
                MAPIN
              </ThemedText>
              <ThemedText type="default" style={{ opacity: 0.7 }}>
                Crie sua conta e comece a explorar
              </ThemedText>
            </View>

            {/* Form */}
            <View className="space-y-4">
              {/* Full Name Input */}
              <View className="mb-4">
                <ThemedText
                  type="defaultSemiBold"
                  style={{ marginBottom: 8, opacity: 0.8 }}
                >
                  Nome Completo
                </ThemedText>
                <View
                  className="flex-row items-center rounded-lg px-4 py-3 bg-transparent"
                  style={{
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Ionicons name="person-outline" size={20} color={iconColor} />
                  <TextInput
                    className="flex-1 ml-3"
                    style={{ color: isDark ? "white" : "black", fontSize: 16 }}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor={iconColor}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Username Input */}
              <View className="mb-4">
                <ThemedText
                  type="defaultSemiBold"
                  style={{ marginBottom: 8, opacity: 0.8 }}
                >
                  Nome de Usuário
                </ThemedText>
                <View
                  className="flex-row items-center rounded-lg px-4 py-3 bg-transparent"
                  style={{
                    borderWidth: 1,
                    borderColor:
                      isUsernameAvailable === false
                        ? "#EF4444"
                        : isUsernameAvailable === true
                        ? "#10B981"
                        : borderColor,
                  }}
                >
                  <Ionicons name="at-outline" size={20} color={iconColor} />
                  <TextInput
                    className="flex-1 ml-3"
                    style={{ color: isDark ? "white" : "black", fontSize: 16 }}
                    placeholder="Escolha um nome de usuário"
                    placeholderTextColor={iconColor}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  {username.length >= 3 && (
                    <View className="ml-2">
                      {isCheckingUsername ? (
                        <ActivityIndicator size="small" color={iconColor} />
                      ) : isUsernameAvailable === true ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                      ) : isUsernameAvailable === false ? (
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#EF4444"
                        />
                      ) : null}
                    </View>
                  )}
                </View>
                {username.length >= 3 &&
                  isUsernameAvailable !== null &&
                  !isCheckingUsername && (
                    <ThemedText
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        color:
                          isUsernameAvailable === true ? "#10B981" : "#EF4444",
                      }}
                    >
                      {isUsernameAvailable
                        ? "Nome de usuário disponível"
                        : "Este nome de usuário já está em uso"}
                    </ThemedText>
                  )}
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <ThemedText
                  type="defaultSemiBold"
                  style={{ marginBottom: 8, opacity: 0.8 }}
                >
                  Email:
                </ThemedText>
                <View
                  className="flex-row items-center rounded-lg px-4 py-3 bg-transparent"
                  style={{
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color={iconColor} />
                  <TextInput
                    className="flex-1 ml-3"
                    style={{ color: isDark ? "white" : "black", fontSize: 16 }}
                    placeholder="Enter your email"
                    placeholderTextColor={iconColor}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <ThemedText
                  type="defaultSemiBold"
                  style={{ marginBottom: 8, opacity: 0.8 }}
                >
                  Senha
                </ThemedText>
                <View
                  className="flex-row items-center rounded-lg px-4 py-3 bg-transparent"
                  style={{
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={iconColor}
                  />
                  <TextInput
                    className="flex-1 ml-3"
                    style={{ color: isDark ? "white" : "black", fontSize: 16 }}
                    placeholder="Crie uma senha"
                    placeholderTextColor={iconColor}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password-new"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-4">
                <ThemedText
                  type="defaultSemiBold"
                  style={{ marginBottom: 8, opacity: 0.8 }}
                >
                  Confirmar Senha
                </ThemedText>
                <View
                  className="flex-row items-center rounded-lg px-4 py-3 bg-transparent"
                  style={{
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={iconColor}
                  />
                  <TextInput
                    className="flex-1 ml-3"
                    style={{ color: isDark ? "white" : "black", fontSize: 16 }}
                    placeholder="Confirme sua senha"
                    placeholderTextColor={iconColor}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoComplete="password-new"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                className="w-full py-4 rounded-lg mt-6"
                style={{
                  backgroundColor: tintColor,
                  opacity: isLoading ? 0.7 : 1,
                }}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText
                    className="text-center font-semibold text-lg"
                    style={{ color: isDark ? "black" : "white" }}
                  >
                    Criar Conta
                  </ThemedText>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                disabled={isLoading}
                className="mt-6"
              >
                <ThemedText className="text-center" style={{ opacity: 0.7 }}>
                  Já tem uma conta?{" "}
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: tintColor }}
                  >
                    Entrar
                  </ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
