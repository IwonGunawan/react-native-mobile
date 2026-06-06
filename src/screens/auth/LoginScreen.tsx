import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/auth.store";
import { Text, TextInput, Button } from "react-native-paper";
import { useState } from "react";
import { authService } from "../../services/auth.service";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("iwon@gmail.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email & Password wajib diisi");
      return;
    }

    Keyboard.dismiss();
    setError(null);
    setIsLoading(true);

    try {
      const { access_token, user } = await authService.login(email, password);
      setAuth(user, access_token);
      // tidak perlu navigate - RootNavigator otomatis switch ke AppNavigator
      // karena isAuth di authStore berubah jadi true
    } catch (error: any) {
      setError(error.response?.data?.message ?? "Email atau Password salah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            // keyboardShouldPersistTaps=handled - tap tombol login
            // tetap jalan meski keyboard sedang terbuka
          >
            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <Text style={styles.iconText}>💧</Text>
              </View>
              <Text variant="headlineSmall" style={styles.title}>
                Cikaret Setra
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Sistem Pembayaran Air
              </Text>
            </View>

            {/* FORM CARD */}
            <View style={styles.card}>
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              {/* Email Input */}
              <TextInput
                label="email"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(null);
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
                disabled={isLoading}
              />

              {/* Password Input */}
              <TextInput
                label="password"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setError(null);
                }}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                disabled={isLoading}
                // submit keyboard action
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {isLoading ? "Masuk..." : "Masuk"}
              </Button>
            </View>

            {/* FOOTER */}
            <Text variant="bodySmall" style={styles.footer}>
              Cikaret Setra © 2026
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  // HEADER
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 4, // shadow on android
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 16,
    color: colors.textPrimary,
  },

  // ERROR
  errorBox: {
    backgroundColor: "#fce4ec",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },

  // INPUT
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  // BUTTON
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  // FOOTER
  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    marginTop: 32,
  },
});
