import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { useState } from "react";
import {
  Text,
  Card,
  List,
  Divider,
  TextInput,
  Button,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Device from "expo-device";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { authService } from "../../services/auth.service";
import { colors } from "../../theme";
import { useAuthStore } from "../../stores/auth.store";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levelLabel = user?.level === "0" ? "Admin" : "Petugas";
  const levelColor = user?.level === "0" ? colors.info : colors.primary;

  const handleLogout = () => {
    Alert.alert("Keluar", "Apakah kamu yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: logout },
    ]);
  };

  const handleChangePassword = async () => {
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError("Semua field wajib diisi");
    }
    if (newPassword.length < 6) {
      return setError("Password baru minimal 6 karakter");
    }
    if (newPassword !== confirmPassword) {
      return setError("Konfirmasi password tidak cocok");
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setShowChangePass(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Berhasil", "Password berhasil diubah");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal mengubah password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                Profil
              </Text>
            </View>

            {/* Account Card */}
            <Card style={styles.card}>
              <Card.Content style={styles.accountContent}>
                {/* Avatar */}
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarText}>
                    {user?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.accountInfo}>
                  <Text variant="titleMedium" style={styles.accountName}>
                    {user?.name}
                  </Text>
                  {/* Level badge */}
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: levelColor + "20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        user?.level === "0"
                          ? "shield-account"
                          : "account-hard-hat"
                      }
                      size={14}
                      color={levelColor}
                    />
                    <Text style={[styles.levelText, { color: levelColor }]}>
                      {levelLabel}
                    </Text>
                  </View>
                </View>
              </Card.Content>

              <Divider />

              {/* Info rows */}
              <Card.Content style={styles.infoRows}>
                <InfoRow
                  icon="email-outline"
                  label="Email"
                  value={user?.email ?? "-"}
                />
                <InfoRow
                  icon="clock-outline"
                  label="Login Terakhir"
                  value="Belum tersedia" // placeholder — perlu endpoint BE
                  valueStyle={styles.pending}
                />
              </Card.Content>
            </Card>

            {/* Settings */}
            <Card style={[styles.card, { marginTop: 12 }]}>
              <Text variant="labelSmall" style={styles.sectionLabel}>
                PENGATURAN AKUN
              </Text>

              <List.Item
                title="Ganti Password"
                description={showChangePass ? undefined : "••••••••••••"}
                left={(p) => (
                  <List.Icon
                    {...p}
                    icon="lock-outline"
                    color={colors.primary}
                  />
                )}
                right={(p) => (
                  <List.Icon
                    {...p}
                    icon={showChangePass ? "chevron-up" : "chevron-right"}
                    color={colors.textSecondary}
                  />
                )}
                onPress={() => {
                  setShowChangePass(!showChangePass);
                  setError(null);
                }}
                titleStyle={styles.listTitle}
                descriptionStyle={styles.listDesc}
              />

              {showChangePass && (
                <View style={styles.passwordForm}>
                  {error && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                  <TextInput
                    label="Password Lama"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    mode="outlined"
                    secureTextEntry={!showCurrent}
                    right={
                      <TextInput.Icon
                        icon={showCurrent ? "eye-off" : "eye"}
                        onPress={() => setShowCurrent(!showCurrent)}
                      />
                    }
                    style={styles.passInput}
                    dense
                  />
                  <TextInput
                    label="Password Baru"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    mode="outlined"
                    secureTextEntry={!showNew}
                    right={
                      <TextInput.Icon
                        icon={showNew ? "eye-off" : "eye"}
                        onPress={() => setShowNew(!showNew)}
                      />
                    }
                    style={styles.passInput}
                    dense
                  />
                  <TextInput
                    label="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.passInput}
                    dense
                  />
                  <View style={styles.passActions}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowChangePass(false);
                        setError(null);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      style={styles.btnHalf}
                      disabled={isLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleChangePassword}
                      loading={isLoading}
                      disabled={isLoading}
                      style={styles.btnHalf}
                    >
                      Simpan
                    </Button>
                  </View>
                </View>
              )}

              <Divider />

              <List.Item
                title="Keluar"
                titleStyle={[styles.listTitle, { color: colors.danger }]}
                left={(p) => (
                  <List.Icon {...p} icon="logout" color={colors.danger} />
                )}
                onPress={handleLogout}
              />
            </Card>

            {/* Device Info */}
            <Card style={[styles.card, { marginTop: 12 }]}>
              <Text variant="labelSmall" style={styles.sectionLabel}>
                INFORMASI PERANGKAT
              </Text>
              <Card.Content style={styles.deviceContent}>
                <InfoRow
                  icon="cellphone"
                  label="Perangkat"
                  value={Device.modelName ?? "-"}
                />
                <InfoRow
                  icon="android"
                  label="Android"
                  value={Device.osVersion ?? "-"}
                />
                <InfoRow icon="application" label="Versi App" value="1.0.0" />
              </Card.Content>
            </Card>

            <Text variant="bodySmall" style={styles.footer}>
              Cikaret Setra © {new Date().getFullYear()}
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// ─── Info Row Component ─────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: string;
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={infoStyles.row}>
      <MaterialCommunityIcons
        name={icon as any}
        size={18}
        color={colors.primary}
      />
      <View style={infoStyles.content}>
        <Text variant="bodySmall" style={infoStyles.label}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={[infoStyles.value, valueStyle]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  content: { flex: 1 },
  label: { color: colors.textSecondary, marginBottom: 2 },
  value: { color: colors.textPrimary, fontWeight: "500" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontWeight: "700", color: colors.textPrimary },

  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden",
  },

  // Account
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight + "25",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: colors.primary },
  accountInfo: { flex: 1, gap: 8 },
  accountName: { fontWeight: "700", color: colors.textPrimary },
  levelBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  levelText: { fontWeight: "600", fontSize: 13 },
  infoRows: { paddingVertical: 8 },

  pending: { color: colors.textSecondary, fontStyle: "italic" },

  // Section label
  sectionLabel: {
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    letterSpacing: 1,
  },

  // List
  listTitle: { fontSize: 14, color: colors.textPrimary },
  listDesc: { fontSize: 12 },

  // Password form
  passwordForm: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  errorBox: {
    backgroundColor: "#fce4ec",
    borderRadius: 8,
    padding: 10,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  passInput: { backgroundColor: "#fff" },
  passActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  btnHalf: { flex: 1 },

  // Device
  deviceContent: { paddingVertical: 4 },

  footer: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 24,
  },
});
