import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  FlatList,
  Modal,
  TouchableOpacity,
  View,
  type ViewProps,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export type DropdownOption = {
  label: string;
  value: string;
};

export type ThemedDropdownProps = ViewProps & {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function ThemedDropdown({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
  style,
  ...otherProps
}: ThemedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={className} style={style} {...otherProps}>
      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        className="flex-row items-center justify-between px-4 py-3 rounded-lg gap-2"
        style={{ borderColor }}
      >
        <ThemedText className="text-base">
          {selectedOption?.label || placeholder}
        </ThemedText>
        <ThemedText className="text-lg">{isOpen ? "▲" : "▼"}</ThemedText>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-center items-center px-4">
            <ThemedView className="w-full max-w-xs rounded-lg overflow-hidden shadow-lg">
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className="px-4 py-4 border-b border-gray-200 dark:border-gray-700"
                    style={
                      item.value === value
                        ? { backgroundColor: tintColor + "20" }
                        : undefined
                    }
                  >
                    <ThemedText
                      className="text-base"
                      style={
                        item.value === value
                          ? { color: tintColor, fontWeight: "600" }
                          : undefined
                      }
                    >
                      {item.label}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              />
            </ThemedView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

