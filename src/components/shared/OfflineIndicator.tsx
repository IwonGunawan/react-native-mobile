import { useEffect, useRef } from "react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { Animated, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";

export default function OfflineIndicator() {
  const { isConnected } = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <MaterialCommunityIcons name="wifi-off" size={16} color="#fff" />
      <Text style={styles.text}>Tidak ada koneksi internet</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: "#c62828",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 13,
  },
});
