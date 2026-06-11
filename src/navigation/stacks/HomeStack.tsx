import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../screens/home/HomeScreen";
import PaymentHistoryScreen from "../../screens/payments/PaymentHistoryScreen";

export type HomeStackParams = {
  HomeMain: undefined;
  PaymentHistory: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParams>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    </Stack.Navigator>
  );
}
