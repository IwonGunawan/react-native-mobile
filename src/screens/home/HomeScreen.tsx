import { Pressable, StyleSheet, View } from "react-native";
import { useAuthStore } from "../../stores/auth.store";
import { Text } from "react-native-paper";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Selamat Datang, {user?.name}</Text>
      <Pressable onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
});
