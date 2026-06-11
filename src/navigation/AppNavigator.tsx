import { useTheme } from "react-native-paper";
import { colors, theme } from "../theme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import HomeScreen from "../screens/home/HomeScreen";
import WaterUsageScreen from "../screens/water-usage/WaterUsageScreen";
import PaymentScreen from "../screens/payments/PaymentScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import HomeStack from "./stacks/HomeStack";

export type AppTabParams = {
  Home: undefined;
  WaterUsage: undefined;
  Payment: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParams>();

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#9e9e9e",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e0e0e0",
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: "home",
            WaterUsage: "clipboard-list",
            Payment: "cash",
            Profile: "account",
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name] as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="WaterUsage"
        component={WaterUsageScreen}
        options={{ tabBarLabel: "Cek Air" }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ tabBarLabel: "Bayar Air" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </Tab.Navigator>
  );
}
