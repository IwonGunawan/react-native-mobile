import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./src/theme";
import RootNavigator from "./src/navigation/Index";

export default function App() {
  return (
    // GestureHandlerRootView: wajib diroot untuk gesture navigation
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider: handle notch & status bar otomatis */}
      <SafeAreaProvider>
        {/* PaperProvider: inject theme ke semua komponen Paper */}
        <PaperProvider theme={theme}>
          <RootNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
