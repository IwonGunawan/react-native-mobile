import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { WaterUsageStackParams } from "../../navigation/stacks/WaterUsageStack";
import {
  useWaterUsageHistory,
  useWaterUsageList,
} from "../../hooks/useWaterUsage";
import { useState } from "react";
import { waterUsageService } from "../../services/water-usage.service";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Card,
  Chip,
  Divider,
  Text,
  TextInput,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MONTHS, STATUS_MAP } from "../../utils";

type Route = RouteProp<WaterUsageStackParams, "InputMeter">;

export default function InputMeterScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { customer } = route.params;
  const { refresh } = useWaterUsageList();
  const { history, isLoading, refetch } = useWaterUsageHistory(
    customer.customerId,
  );
  const lastRecord = history[0]; // sort DESC - index 0 = paling baru

  const [meterNumber, setMeterNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacing, setIsReplacing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!meterNumber) return setError("Angka meter wajib diisi");
    setError(null);
    setIsSaving(true);

    try {
      await waterUsageService.create({
        customerId: customer.customerId,
        meterNumber: Number(meterNumber),
      });
      Alert.alert("Berhasil", "Data meter berhasil disimpan", [
        {
          text: "OK",
          onPress: () => {
            refetch();
            refresh();
            navigation.goBack();
          },
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkReplace = (waterUsageId: number) => {
    Alert.alert(
      "Ganti Meter",
      "Tandai bulan ini sebagai terakhir meter lama ?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya, Ganti",
          style: "destructive",
          onPress: async () => {
            setIsReplacing(waterUsageId);
            try {
              await waterUsageService.markReplaced(waterUsageId);
              refetch();
            } catch (error) {
              Alert.alert("Error", "Failed Marked Replace");
            } finally {
              setIsReplacing(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Button
              icon="arrow-left"
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              labelStyle={styles.backLabel}
              compact
            >
              Kembali
            </Button>
            <View style={styles.customerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {customer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text variant="titleMedium" style={styles.customerName}>
                  {customer.prefix} {customer.name}
                </Text>
                <Text variant="bodySmall" style={styles.customerCode}>
                  {customer.code}
                </Text>
              </View>
            </View>
          </View>

          {/* Input form — hanya tampil kalau belum dicek */}
          {customer.isChecked === 0 ? (
            <Card style={styles.inputCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.inputTitle}>
                  Input Kilometer Bulan Ini
                </Text>

                {/* Meter sebelumnya */}
                {lastRecord && (
                  <View style={styles.prevMeter}>
                    <MaterialCommunityIcons
                      name="gauge"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text variant="bodySmall" style={styles.prevMeterText}>
                      Meter bulan lalu:{" "}
                      <Text style={styles.prevMeterValue}>
                        {lastRecord.meterNumber}
                      </Text>
                      {lastRecord.lastUsed === "1" && (
                        <Text style={styles.replacedNote}>
                          {" "}
                          (meter baru — mulai dari 0)
                        </Text>
                      )}
                    </Text>
                  </View>
                )}

                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TextInput
                  label="Angka Meter"
                  value={meterNumber}
                  onChangeText={(v) => {
                    setMeterNumber(v);
                    setError(null);
                  }}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.meterInput}
                  right={<TextInput.Affix text="m" />}
                  autoFocus
                />

                {/* Preview pemakaian */}
                {meterNumber && lastRecord && (
                  <View style={styles.previewBox}>
                    <Text variant="bodySmall" style={styles.previewLabel}>
                      Estimasi pemakaian
                    </Text>
                    <Text variant="titleMedium" style={styles.previewValue}>
                      {Math.max(
                        0,
                        Number(meterNumber) -
                          (lastRecord.lastUsed === "1"
                            ? 0
                            : lastRecord.meterNumber),
                      )}{" "}
                      m³
                    </Text>
                  </View>
                )}

                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={isSaving}
                  disabled={isSaving || !meterNumber}
                  style={styles.saveBtn}
                  contentStyle={styles.saveBtnContent}
                >
                  Simpan
                </Button>
              </Card.Content>
            </Card>
          ) : (
            // Sudah dicek — tampilkan info
            <Card style={styles.checkedCard}>
              <Card.Content style={styles.checkedContent}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={32}
                  color={colors.success}
                />
                <View>
                  <Text variant="titleSmall" style={{ color: colors.success }}>
                    Sudah Dicek Bulan Ini
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.textSecondary }}
                  >
                    Meter: {lastRecord?.meterNumber ?? "-"} m
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* History */}
          <View style={styles.historySection}>
            <Text variant="titleSmall" style={styles.historyTitle}>
              History Pemakaian
            </Text>
            {isLoading ? (
              <Text
                variant="bodySmall"
                style={{ color: colors.textSecondary, padding: 16 }}
              >
                Memuat...
              </Text>
            ) : history.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <MaterialCommunityIcons
                    name="history"
                    size={32}
                    color={colors.textSecondary}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: colors.textSecondary }}
                  >
                    Belum ada history pemakaian
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.historyCard}>
                {history.map((h, index) => {
                  const statusInfo = STATUS_MAP[h.status];
                  return (
                    <View key={h.id}>
                      <View style={styles.historyItem}>
                        {/* Bulan & tahun */}
                        <View style={styles.historyLeft}>
                          <Text
                            variant="bodyMedium"
                            style={styles.historyMonth}
                          >
                            {MONTHS[h.month]} {h.year}
                          </Text>

                          {/* Marking for last usage kilometer physic */}
                          {h.lastUsed == "1" && (
                            <Chip
                              compact
                              style={styles.meterLamaBadge}
                              textStyle={styles.meterLamaText}
                            >
                              Meter Lama
                            </Chip>
                          )}

                          {/* Tombol ganti meter — hanya record terbaru, belum ditandai */}
                          {index === 0 && h.lastUsed === "0" && (
                            <Button
                              mode="outlined"
                              compact
                              onPress={() => handleMarkReplace(h.id)}
                              loading={isReplacing === h.id}
                              disabled={isReplacing !== null}
                              labelStyle={styles.replaceLabel}
                              style={styles.replaceBtn}
                              contentStyle={styles.replaceBtnContent}
                            >
                              Ganti Meter
                            </Button>
                          )}
                        </View>

                        {/* Detail meter */}
                        <View style={styles.historyMid}>
                          <Text
                            variant="bodySmall"
                            style={styles.historyDetail}
                          >
                            {h.meterNumber} m
                          </Text>
                          <Text variant="bodySmall" style={styles.historyUsage}>
                            Pakai: {h.meterUsage} m³
                          </Text>
                        </View>

                        {/* Status + action */}
                        <View style={styles.historyRight}>
                          {/* <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusInfo.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: statusInfo.color },
                              ]}
                            >
                              {statusInfo.label}
                            </Text>
                          </View> */}
                        </View>
                      </View>
                      {index < history.length - 1 && <Divider />}
                    </View>
                  );
                })}
              </Card>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },

  // Header
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { alignSelf: "flex-start", marginBottom: 12 },
  backLabel: { color: colors.primary },
  customerInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: colors.primary, fontWeight: "700", fontSize: 20 },
  customerName: { fontWeight: "700", color: colors.textPrimary },
  customerCode: { color: colors.textSecondary, marginTop: 2 },

  // Input card
  inputCard: { margin: 16, borderRadius: 12, elevation: 2 },
  inputTitle: {
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  prevMeter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  prevMeterText: { color: colors.textSecondary, flex: 1 },
  prevMeterValue: { fontWeight: "700", color: colors.textPrimary },
  replacedNote: { color: colors.warning, fontStyle: "italic" },
  errorBox: {
    backgroundColor: colors.danger + "15",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  meterInput: { backgroundColor: "#fff", marginBottom: 12 },
  previewBox: {
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  previewLabel: { color: colors.textSecondary, marginBottom: 4 },
  previewValue: { color: colors.primary, fontWeight: "700" },
  saveBtn: { borderRadius: 8, marginTop: 4 },
  saveBtnContent: { paddingVertical: 4 },

  // Checked card
  checkedCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  checkedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // History
  historySection: { paddingHorizontal: 16 },
  historyTitle: {
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  historyCard: { borderRadius: 12, elevation: 2, overflow: "hidden" },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    gap: 8,
  },
  historyLeft: { flex: 1.2, gap: 4 },
  historyMonth: { fontWeight: "600", color: colors.textPrimary },
  meterLamaBadge: {
    backgroundColor: colors.warning + "20",
  },
  meterLamaText: { fontSize: 10, color: colors.warning },
  historyMid: { flex: 1 },
  historyDetail: { color: colors.textSecondary },
  historyUsage: { color: colors.textSecondary, marginTop: 2 },
  historyRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  replaceLabel: { fontSize: 11, color: colors.warning },
  replaceBtn: {
    alignSelf: "flex-start",
    borderColor: colors.warning,
    borderRadius: 8,
    minHeight: 32,
  },
  replaceBtnContent: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },

  // Empty
  emptyCard: { borderRadius: 12 },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
});
