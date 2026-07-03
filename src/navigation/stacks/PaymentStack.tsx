import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PaymentScreen from "../../screens/payments/PaymentScreen";
import BillScreen from "../../screens/payments/BillScreen";
import { Payment } from "../../services/payment.service";

export type PaymentStackParams = {
  PaymentList: undefined;
  Bill: { customer: Payment };
};

const Stack = createNativeStackNavigator<PaymentStackParams>();

export default function PaymentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PaymentList" component={PaymentScreen} />
      <Stack.Screen name="Bill" component={BillScreen} />
    </Stack.Navigator>
  );
}
