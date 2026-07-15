import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { theme } from "./src/theme";
import RootNavigator from "./src/navigation/Index";
import ErrorBoundary from "./src/components/shared/ErrorBoundary";
import Splash from "./src/components/shared/Splash";
import {
  setupAxiosInterceptors,
  setupGlobalErrorHandler,
  logger,
} from "./src/utils/debug";
import OfflineIndicator from "./src/components/shared/OfflineIndicator";

// Tell the native splash to stay visible until JS is ready and we hide it.
// Must run at module load (before the first render) so the native splash
// doesn't auto-hide in release builds where the JS bundle takes longer to
// parse. Calling it from useEffect is too late.
SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore — splash may already be gone
});

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      // Always install global handlers — even in release, so we capture
      // every error path including the persistence buffer.
      setupGlobalErrorHandler();

      if (__DEV__) {
        logger.info("App started in development mode");
        setupAxiosInterceptors();

        // Surface crashes from the previous session (force close) to logcat.
        // Fire-and-forget; do not block UI.
        void logger.dumpCrashBuffer();

        // Disable non-critical warnings
        LogBox.ignoreLogs([
          "Non-serializable values were found in the navigation state",
          "ViewPropTypes will be removed",
        ]);
      }

      // Wait for the native splash to finish (1.5s gives a comfortable read
      // time for the branded JS splash). The JS <Splash /> is rendered first,
      // so the user sees the branded screen, then we hide the native splash
      // and the JS splash will fade out itself.
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!isMounted) return;
      try {
        await SplashScreen.hideAsync();
      } catch {
        // ignore
      }
      setAppReady(true);
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
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

        {/* Branded JS splash on top of the navigator until app is ready.
            The component handles its own absolute positioning. */}
        <Splash visible={!appReady} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
