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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(error.response?.data?.message ?? "Username atau Password salah");
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
                label="username"
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
              Cikaret Setra v2.0 © 2026
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
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#0f6b85",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconText: {
    fontSize: 42,
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
  },

  // CARD
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 16,
    color: colors.textPrimary,
  },

  // ERROR
  errorBox: {
    backgroundColor: "#eef9fc",
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
    backgroundColor: colors.card,
  },

  // BUTTON
  button: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
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
    color: "rgba(255,255,255,0.72)",
    marginTop: 32,
  },
});
