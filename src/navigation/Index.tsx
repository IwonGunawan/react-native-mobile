import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../stores/auth.store";
import AuthNavigator from "./AuthNavigation";
import AppNavigator from "./AppNavigator";

export default function RootNavigator() {
  const { isAuth } = useAuthStore();

  return (
    <NavigationContainer>
      {isAuth ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
