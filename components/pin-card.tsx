import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function PinCard() {
  return (
    <ThemedView className="p-4 w-full border-t border-gray-200 dark:border-white/20">
      <ThemedText className="text-lg font-bold">Pin Card</ThemedText>
      <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
        Pin Card Description
      </ThemedText>
    </ThemedView>
  );
}
