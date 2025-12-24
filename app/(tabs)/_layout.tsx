import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { DynamicColorIOS, Platform } from "react-native";

export default function TabLayout() {
  return (
    <NativeTabs
      labelStyle={{
        // For the text color - adapts to light/dark backgrounds for liquid glass effect
        color: DynamicColorIOS({
          dark: "white",
          light: "black",
        }),
      }}
      // For the selected icon color - adapts to light/dark backgrounds
      tintColor={DynamicColorIOS({
        dark: "white",
        light: "black",
      })}
      minimizeBehavior="onScrollDown"
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
          ios: (
            <Icon
              sf={{ default: "magnifyingglass", selected: "magnifyingglass" }}
            />
          ),
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
      <NativeTabs.Trigger name="create-pin" role="search">
        <Label>Novo Pin</Label>
        {Platform.select({
          ios: (
            <Icon
              sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
            />
          ),
          android: (
            <Icon
              src={<VectorIcon family={MaterialIcons} name="add-circle" />}
            />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
