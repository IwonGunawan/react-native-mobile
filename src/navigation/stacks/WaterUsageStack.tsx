import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WaterUsageList } from "../../services/water-usage.service";
import WaterUsageScreen from "../../screens/water-usage/WaterUsageScreen";
import InputMeterScreen from "../../screens/water-usage/InputMeterScreen";

export type WaterUsageStackParams = {
  WaterUsageList: undefined;
  InputMeter: { customer: WaterUsageList };
};

const Stack = createNativeStackNavigator<WaterUsageStackParams>();

export default function WaterUsageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WaterUsageList" component={WaterUsageScreen} />
      <Stack.Screen name="InputMeter" component={InputMeterScreen} />
    </Stack.Navigator>
  );
}
