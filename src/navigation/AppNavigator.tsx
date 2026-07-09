import { useTheme } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProfileScreen from "../screens/profile/ProfileScreen";
import HomeStack from "./stacks/HomeStack";
import WaterUsageStack from "./stacks/WaterUsageStack";
import PaymentStack from "./stacks/PaymentStack";

export type AppTabParams = {
  Home: undefined;
  WaterUsage: undefined;
  Payment: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParams>();

const BASE_TAB_HEIGHT = 60;

export default function AppNavigator() {
  const { colors } = useTheme();
  // Pakai inset bottom Android agar tab bar tidak tertutup gesture/3-button nav.
  const insets = useSafeAreaInsets();
  const tabBarHeight = BASE_TAB_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // Warna
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#9e9e9e",

        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e0e0e0",
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 4,
          // Tambahkan inset.bottom supaya label tidak mepet ke navigation bar.
          paddingBottom: 4 + insets.bottom,
        },

        // Label
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: -2,
        },

        // Icon
        tabBarIconStyle: {
          marginBottom: 0,
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
        component={WaterUsageStack}
        options={{ tabBarLabel: "Cek Air" }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentStack}
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
