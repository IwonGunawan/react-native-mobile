import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log ke console untuk debugging
    console.error("ErrorBoundary caught:", error, info);
  }

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
              <Text style={styles.stackText}>{this.state.error?.stack}</Text>
            )}
          </ScrollView>
          <Button
            mode="contained"
            onPress={() => this.setState({ hasError: false, error: null })}
          >
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
