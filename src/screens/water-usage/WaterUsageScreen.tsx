import { StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../stores/auth.store";

export default function WaterUsageScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text>Water Usage Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
