import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Tela do futuro mapa</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
