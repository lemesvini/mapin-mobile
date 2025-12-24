import { View, ActivityIndicator } from "react-native";

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#F91880" />
    </View>
  );
}
