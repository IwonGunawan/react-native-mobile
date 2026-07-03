import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  Switch,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  paymentService,
  Bill,
  PaymentReceipt,
} from "../../services/payment.service";
import { PaymentStackParams } from "../../navigation/stacks/PaymentStack";
import { colors } from "../../theme";
import {
  formatRupiah,
  MONTHS,
  formatNumberInput,
  parseNumberInput,
} from "../../utils";

type Route = RouteProp<PaymentStackParams, "Bill">;

type Step = "bill" | "pay" | "receipt";

export default function BillScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { customer } = route.params;

  const [step, setStep] = useState<Step>("bill");
  const [bill, setBill] = useState<Bill | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cash, setCash] = useState("");
  const [saveChange, setSaveChange] = useState(0);

  const cashAmount = Number(parseNumberInput(cash)) || 0;
  const change = bill ? cashAmount - bill.finalTotal : 0;
  const isShort = change < 0;
  const isOver = change > 0;

  // Fetch bill saat screen buka
  const fetchBill = async (isRefresh = false) => {
    isRefresh ? setIsRefresh(true) : setIsLoading(true);
    setError(null);
    try {
      const data = await paymentService.getBill(customer.customerId);
      console.log(data, "getBill");
      setBill(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal memuat tagihan");
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [customer.customerId]);

  const handlePay = async () => {
    if (!bill || cashAmount <= 0) return;
    setError(null);
    setIsPaying(true);

    try {
      const result = await paymentService.create({
        customerId: customer.customerId,
        cash: cashAmount,
        saveChange,
      });
      setReceipt(result);
      setStep("receipt");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Pembayaran gagal");
    } finally {
      setIsPaying(false);
    }
  };

  const handleDone = () => navigation.goBack();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrapper}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={colors.primary}
          />
          <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
            Memuat tagihan...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          {step !== "receipt" && (
            <Button
              icon="arrow-left"
              onPress={() =>
                step === "pay" ? setStep("bill") : navigation.goBack()
              }
              style={styles.backBtn}
              labelStyle={{ color: colors.primary }}
              compact
            >
              {step === "pay" ? "Tagihan" : "Kembali"}
            </Button>
          )}

          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text variant="titleSmall" style={styles.customerName}>
                {customer.prefix} {customer.name}
              </Text>
              <Text variant="bodySmall" style={styles.customerCode}>
                {customer.code}
              </Text>
            </View>
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {(["bill", "pay", "receipt"] as Step[]).map((s, i) => (
              <View key={s} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    step === s && styles.stepDotActive,
                    (step === "pay" && i === 0) || (step === "receipt" && i < 2)
                      ? styles.stepDotDone
                      : null,
                  ]}
                >
                  {(step === "pay" && i === 0) ||
                  (step === "receipt" && i < 2) ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={10}
                      color="#fff"
                    />
                  ) : (
                    <Text style={styles.stepDotText}>{i + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    step === s && styles.stepLabelActive,
                  ]}
                >
                  {s === "bill" ? "Tagihan" : s === "pay" ? "Bayar" : "Struk"}
                </Text>
                {i < 2 && <View style={styles.stepLine} />}
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            step == "bill" ? (
              <RefreshControl
                refreshing={isRefresh}
                onRefresh={() => fetchBill(true)}
                colors={[colors.primary]}
              />
            ) : undefined
          }
        >
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Step: BILL ── */}
          {step === "bill" && bill && (
            <View>
              {/* Total card */}
              <Card style={styles.totalCard}>
                <Card.Content style={styles.totalContent}>
                  <Text variant="bodyMedium" style={styles.totalLabel}>
                    Total yang harus dibayar
                  </Text>
                  <Text variant="headlineMedium" style={styles.totalValue}>
                    {formatRupiah(bill.finalTotal)}
                  </Text>
                </Card.Content>
              </Card>

              {/* Detail tagihan */}
              <Card style={styles.detailCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.detailTitle}>
                    Rincian Tagihan{" "}
                    <Text style={[{ color: colors.warning }]}>
                      ({bill.waterUsages.length} bulan)
                    </Text>
                  </Text>

                  {bill.waterUsages
                    .filter((b) => b.status == "0")
                    .map((b, i) => (
                      <View key={b.waterUsageId}>
                        <View style={styles.detailRow}>
                          <View style={styles.detailLeft}>
                            <MaterialCommunityIcons
                              name="water"
                              size={16}
                              color={colors.primary}
                            />
                            <Text
                              variant="bodySmall"
                              style={styles.detailLabel}
                            >
                              {MONTHS[b.month]} {b.year}
                            </Text>
                          </View>
                          <Text variant="bodySmall" style={styles.detailValue}>
                            {formatRupiah(b.totalPrice)}
                          </Text>
                        </View>
                        {i < bill.waterUsages.length - 1 && (
                          <Divider style={{ marginVertical: 4 }} />
                        )}
                      </View>
                    ))}

                  {bill.underpayment > 0 && (
                    <>
                      <Divider style={{ marginVertical: 8 }} />
                      <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                          <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={16}
                            color={colors.danger}
                          />
                          <Text
                            variant="bodySmall"
                            style={{ color: colors.danger }}
                          >
                            Kurang bayar sebelumnya
                          </Text>
                        </View>
                        <Text
                          variant="bodySmall"
                          style={{ color: colors.danger, fontWeight: "600" }}
                        >
                          + {formatRupiah(bill.underpayment)}
                        </Text>
                      </View>
                    </>
                  )}

                  {bill.overpayment > 0 && (
                    <>
                      <Divider style={{ marginVertical: 8 }} />
                      <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                          <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={16}
                            color={colors.success}
                          />
                          <Text
                            variant="bodySmall"
                            style={{ color: colors.success }}
                          >
                            Lebih bayar sebelumnya
                          </Text>
                        </View>
                        <Text
                          variant="bodySmall"
                          style={{ color: colors.success, fontWeight: "600" }}
                        >
                          - {formatRupiah(bill.overpayment)}
                        </Text>
                      </View>
                    </>
                  )}

                  <Divider style={{ marginVertical: 8 }} />

                  {/* Total */}
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={{ fontWeight: "700" }}>
                      Total
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.detailValue, { color: colors.primary }]}
                    >
                      {formatRupiah(bill.finalTotal)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <Button
                mode="contained"
                onPress={() => setStep("pay")}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                icon="cash"
              >
                Lanjut ke Pembayaran
              </Button>
            </View>
          )}

          {/* ── Step: PAY ── */}
          {step === "pay" && bill && (
            <View>
              <Card style={styles.detailCard}>
                <Card.Content style={styles.totalCard}>
                  <Text
                    variant="titleSmall"
                    style={[styles.detailTitle, { color: "#fff" }]}
                  >
                    Total Tagihan
                  </Text>
                  <Text variant="headlineSmall" style={styles.totalValue}>
                    {formatRupiah(bill.finalTotal)}
                  </Text>
                </Card.Content>
              </Card>

              {/* Input cash */}
              <Card style={styles.detailCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.detailTitle}>
                    Uang Tunai
                  </Text>
                  <TextInput
                    value={formatNumberInput(cash)}
                    onChangeText={(v) => {
                      setCash(v);
                      setError(null);
                    }}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.cashInput}
                    contentStyle={styles.cashInputContent}
                    left={<TextInput.Affix text="Rp" />}
                    autoFocus
                    placeholder="0"
                  />

                  {/* Kembalian preview */}
                  {cashAmount > 0 && (
                    <View
                      style={[
                        styles.changeBox,
                        isShort ? styles.changeBoxRed : styles.changeBoxGreen,
                      ]}
                    >
                      <View style={styles.changeRow}>
                        <Text variant="bodySmall" style={styles.changeLabel}>
                          {isShort ? "Kurang bayar" : "Kembalian"}
                        </Text>
                        <Text
                          variant="titleMedium"
                          style={[
                            styles.changeValue,
                            { color: isShort ? colors.danger : colors.success },
                          ]}
                        >
                          {formatRupiah(change)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Simpan kembalian toggle */}
                  {isOver && (
                    <View style={styles.saveChangeRow}>
                      <View style={styles.saveChangeLeft}>
                        <Text
                          variant="bodyMedium"
                          style={{ color: colors.textPrimary }}
                        >
                          Simpan kembalian
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: colors.textSecondary }}
                        >
                          Gunakan untuk tagihan bulan depan
                        </Text>
                      </View>
                      {/* <Switch
                        value={saveChange}
                        onValueChange={setSaveChange}
                        color={colors.primary}
                      /> */}
                    </View>
                  )}
                </Card.Content>
              </Card>

              <Button
                mode="contained"
                onPress={handlePay}
                loading={isPaying}
                disabled={isPaying || cashAmount <= 0}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                icon="check"
              >
                {isPaying ? "Memproses..." : "Proses Pembayaran"}
              </Button>
            </View>
          )}

          {/* ── Step: RECEIPT ── */}
          {step === "receipt" && receipt && (
            <View>
              {/* Success icon */}
              <View style={styles.successWrapper}>
                <View style={styles.successIcon}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={56}
                    color={colors.success}
                  />
                </View>
                <Text variant="titleLarge" style={styles.successTitle}>
                  Pembayaran Berhasil
                </Text>
                <Text variant="bodyMedium" style={styles.successSub}>
                  {receipt.textInfo}
                </Text>
              </View>

              {/* Struk */}
              <Card style={styles.receiptCard}>
                <Card.Content>
                  {/* Header struk */}
                  <Text style={styles.receiptHeader}>STRUK PEMBAYARAN AIR</Text>
                  <Text style={styles.receiptSubHeader}>CIKARET SETRA</Text>
                  <Text style={styles.receiptDivider}>{"─".repeat(36)}</Text>

                  {/* Info */}
                  <ReceiptRow
                    label="No. Ref"
                    value={receipt.refNumber.slice(0, 8).toUpperCase()}
                  />
                  <ReceiptRow
                    label="Pelanggan"
                    value={`${customer.prefix} ${customer.name}`}
                  />
                  <ReceiptRow
                    label="Tgl Bayar"
                    value={new Date(receipt.paidDate).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  />
                  <ReceiptRow
                    label="Jam"
                    value={new Date(receipt.paidDate).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  />
                  <ReceiptRow
                    label="Jml Bulan"
                    value={`${receipt.monthTotal} bulan`}
                  />

                  <Text style={styles.receiptDivider}>{"─".repeat(36)}</Text>

                  <ReceiptRow
                    label="Tagihan"
                    value={formatRupiah(receipt.total)}
                  />
                  <ReceiptRow
                    label="Tunai"
                    value={formatRupiah(receipt.cash)}
                  />
                  <ReceiptRow
                    label="Kembalian"
                    value={formatRupiah(receipt.change)}
                    bold
                  />

                  <Text style={styles.receiptDivider}>{"─".repeat(36)}</Text>
                  <Text style={styles.receiptFooter}>{receipt.textInfo}</Text>
                </Card.Content>
              </Card>

              <Button
                mode="contained"
                onPress={handleDone}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                icon="check"
              >
                Selesai
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Receipt Row Helper ─────────────────────────────────────────────
function ReceiptRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={receiptStyles.row}>
      <Text style={receiptStyles.label}>{label}</Text>
      <Text style={[receiptStyles.value, bold && receiptStyles.bold]}>
        {value}
      </Text>
    </View>
  );
}

const receiptStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontFamily: "monospace", fontSize: 13, color: "#555" },
  value: { fontFamily: "monospace", fontSize: 13, color: "#222" },
  bold: { fontWeight: "700", color: "#000" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },

  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  backBtn: { alignSelf: "flex-start", marginBottom: 12 },

  // Header
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: colors.primary, fontWeight: "700", fontSize: 20 },
  customerName: { fontWeight: "700", color: colors.textPrimary },
  customerCode: { color: colors.textSecondary, marginTop: 2 },

  // Step indicator
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: { fontSize: 11, color: "#999", fontWeight: "700" },
  stepLabel: { fontSize: 11, color: colors.textSecondary },
  stepLabelActive: { color: colors.primary, fontWeight: "600" },
  stepLine: {
    width: 32,
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
  },

  // Error
  errorBox: {
    backgroundColor: colors.danger + "15",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13 },

  // Total card
  totalCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.primary,
  },
  totalContent: { alignItems: "center", paddingVertical: 20 },
  totalLabel: { color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  totalValue: { color: "#fff", fontWeight: "700" },

  // Detail
  detailCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  detailTitle: {
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  detailLabel: { color: colors.textSecondary },
  detailValue: { fontWeight: "600", color: colors.textPrimary },

  // Cash input
  cashInput: { backgroundColor: "#fff", marginBottom: 12 },
  cashInputContent: { fontSize: 20, fontWeight: "700", textAlign: "center" },

  // Change box
  changeBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  changeBoxGreen: { backgroundColor: colors.success + "12" },
  changeBoxRed: { backgroundColor: colors.danger + "12" },
  changeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeLabel: { color: colors.textSecondary },
  changeValue: { fontWeight: "700" },

  // Save change
  saveChangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  saveChangeLeft: { flex: 1, marginRight: 12 },

  // Action button
  actionBtn: { borderRadius: 10, marginTop: 4 },
  actionBtnContent: { paddingVertical: 6 },

  // Receipt
  successWrapper: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  successTitle: { fontWeight: "700", color: colors.textPrimary },
  successSub: { color: colors.textSecondary, textAlign: "center" },

  receiptCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  receiptHeader: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
    marginBottom: 2,
  },
  receiptSubHeader: {
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "center",
    color: "#555",
    marginBottom: 8,
  },
  receiptDivider: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#ccc",
    marginVertical: 8,
  },
  receiptFooter: {
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "center",
    color: "#555",
    marginTop: 4,
  },
});
