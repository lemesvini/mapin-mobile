import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import React from "react";
import { DynamicColorIOS, Platform } from "react-native";

export default function TabLayout() {
  // Liquid glass effect colors - iOS only feature
  const labelColor =
    Platform.OS === "ios"
      ? DynamicColorIOS({
          dark: "white",
          light: "black",
        })
      : undefined;

  const tintColor =
    Platform.OS === "ios"
      ? DynamicColorIOS({
          dark: "white",
          light: "black",
        })
      : undefined;

  return (
    <NativeTabs
      labelStyle={
        labelColor
          ? {
              // For the text color - adapts to light/dark backgrounds for liquid glass effect
              color: labelColor,
            }
          : undefined
      }
      // For the selected icon color - adapts to light/dark backgrounds
      tintColor={tintColor}
    >
      <NativeTabs.Trigger name="index">
        <Label>Mapa</Label>
        {Platform.select({
          ios: <Icon sf={{ default: "map", selected: "map.fill" }} />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="map" />} />
          ),
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Label>Pins</Label>
        {Platform.select({
          ios: <Icon sf={{ default: "pin", selected: "pin.fill" }} />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="pin" />} />
          ),
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Label>Buscar</Label>
        {Platform.select({
          ios: <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="search" />} />
          ),
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Perfil</Label>
        {Platform.select({
          ios: <Icon sf={{ default: "person", selected: "person.fill" }} />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
