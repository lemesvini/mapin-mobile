import { useState } from "react";
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      : require("@/assets/images/mapin-transparent-light.png");
  const isDark = colorScheme === "dark";
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      // Navigation will be handled automatically by the root layout
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
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
              {/* <ThemedText type="subtitle" style={{ opacity: 0.7 }}>
                Bem-vindo de volta, entre para continuar
              </ThemedText> */}
            </View>

            {/* Form */}
            <View className="space-y-4">
              {/* Email Input */}
              <View className="mb-4">
                <ThemedText
                  type="defaultSemiBold"
                  style={{ marginBottom: 8, opacity: 0.8 }}
                >
                  Email
                </ThemedText>
                <View
                  className="flex-row items-center justify-center rounded-lg px-4 py-3"
                  style={{
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color={iconColor} />
                  <TextInput
                    placeholder="Digite seu email"
                    className="flex-1 ml-3"
                    style={{ color: isDark ? "white" : "black", fontSize: 16 }}
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
              <View>
                <ThemedText
                  type="defaultSemiBold"
                  style={{ marginBottom: 8, opacity: 0.8 }}
                >
                  Senha
                </ThemedText>
                <View
                  className="flex-row items-center rounded-lg px-4 py-3"
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
                    placeholder="Digite sua senha"
                    placeholderTextColor={iconColor}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="ml-2"
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={iconColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                className="w-full py-4 rounded-lg mt-6"
                style={{
                  backgroundColor: tintColor,
                  opacity: isLoading ? 0.7 : 1,
                }}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText
                    className="text-center font-semibold text-lg"
                    style={{ color: isDark ? "#000000" : "#FFFFFF" }}
                  >
                    Entrar
                  </ThemedText>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
                disabled={isLoading}
                className="mt-6"
              >
                <ThemedText className="text-center" style={{ opacity: 0.7 }}>
                  Não tem uma conta?{" "}
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: tintColor }}
                  >
                    Crie sua conta
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
