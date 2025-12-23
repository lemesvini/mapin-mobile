import { PinCard } from "@/components/pin-card";
import { ThemedDropdown } from "@/components/themed-dropdown";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const [selectedView, setSelectedView] = useState("mundo");

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
      <ThemedView className="flex-1">
        <ThemedView className="p-6 flex-row items-center justify-between">
          <ThemedDropdown
            options={[
              { label: "Mundo", value: "mundo" },
              { label: "Amigos", value: "amigos" },
            ]}
            value={selectedView}
            onValueChange={setSelectedView}
            placeholder="Selecione uma opção"
          />
        </ThemedView>
        <PinCard />
        <PinCard />
        <PinCard />
      </ThemedView>
    </SafeAreaView>
  );
}
