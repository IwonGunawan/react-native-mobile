import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { theme } from "./src/theme";
import RootNavigator from "./src/navigation/Index";
import ErrorBoundary from "./src/components/shared/ErrorBoundary";
import {
  setupAxiosInterceptors,
  setupGlobalErrorHandler,
  logger,
} from "./src/utils/debug";
import OfflineIndicator from "./src/components/shared/OfflineIndicator";

export default function App() {
  useEffect(() => {
    // Setup debugging
    if (__DEV__) {
      logger.info("App started in development mode");
      setupAxiosInterceptors();
      setupGlobalErrorHandler();

      // Disable non-critical warnings
      LogBox.ignoreLogs([
        "Non-serializable values were found in the navigation state",
        "ViewPropTypes will be removed",
      ]);
    }
  }, []);

  return (
    // GestureHandlerRootView: wajib diroot untuk gesture navigation
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider: handle notch & status bar otomatis */}
      <SafeAreaProvider>
        {/* PaperProvider: inject theme ke semua komponen Paper */}
        <PaperProvider theme={theme}>
          <ErrorBoundary>
            <OfflineIndicator />
            <RootNavigator />
          </ErrorBoundary>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
