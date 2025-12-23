import { View, ActivityIndicator, Text } from 'react-native';

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-4 text-gray-600 dark:text-gray-400">Loading...</Text>
    </View>
  );
}

