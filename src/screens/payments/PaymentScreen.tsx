import { StyleSheet, View } from "react-native";
import { useAuthStore } from "../../stores/auth.store";
import { Text } from "react-native-paper";

export default function PaymentScreen() {
  const { user } = useAuthStore();
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Payment Page</Text>
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
