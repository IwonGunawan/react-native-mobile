import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import { logger } from "../../utils/logcat";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info });
    // Log via logger so it hits logcat (ReactNativeJS tag) AND persistent buffer.
    logger.error("ErrorBoundary caught", {
      message: error?.message,
      stack: error?.stack,
      componentStack: info?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            Terjadi Error
          </Text>
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorText}>{this.state.error?.message}</Text>
            {__DEV__ && (
              <>
                <Text style={styles.stackText}>
                  {this.state.error?.stack}
                </Text>
                <Text style={styles.stackText}>
                  {this.state.info?.componentStack}
                </Text>
              </>
            )}
          </ScrollView>
          <Button mode="contained" onPress={this.handleReset}>
            Coba Lagi
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { color: "#c62828", marginBottom: 16 },
  errorBox: {
    backgroundColor: "#fce4ec",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxHeight: 300,
  },
  errorText: { color: "#c62828", fontSize: 13 },
  stackText: { color: "#999", fontSize: 11, marginTop: 8 },
});
