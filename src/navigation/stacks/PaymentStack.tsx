import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PaymentScreen from "../../screens/payments/PaymentScreen";
import BillScreen from "../../screens/payments/BillScreen";
import PayScreen from "../../screens/payments/PayScreen";
import ReceiptScreen from "../../screens/payments/ReceiptScreen";
import PaymentHistoryScreen from "../../screens/payments/PaymentHistoryScreen";
import {
  Bill,
  Payment as Customer,
  PaymentReceipt,
} from "../../services/payment.service";

export type PaymentStackParams = {
  PaymentList: undefined;
  Bill: { customer: Customer };
  Pay: { customer: Customer; bill: Bill };
  Receipt: { customer: Customer; receipt: PaymentReceipt; savedAmount: number };
  PaymentHistory: { customer: Customer };
};

const Stack = createNativeStackNavigator<PaymentStackParams>();

export default function PaymentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PaymentList" component={PaymentScreen} />
      <Stack.Screen name="Bill" component={BillScreen} />
      <Stack.Screen name="Pay" component={PayScreen} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    </Stack.Navigator>
  );
}
