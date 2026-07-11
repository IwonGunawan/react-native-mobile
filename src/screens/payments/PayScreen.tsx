import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState } from "react";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { paymentService } from "../../services/payment.service";
import { PaymentStackParams } from "../../navigation/stacks/PaymentStack";
import { colors } from "../../theme";
import { formatRupiah, formatNumberInput, parseNumberInput } from "../../utils";
import PaymentStepHeader from "../../components/shared/PaymentStepHeader";

type Route = RouteProp<PaymentStackParams, "Pay">;
type Navigation = NativeStackNavigationProp<PaymentStackParams, "Pay">;

export default function PayScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { customer, bill } = route.params;

  const [cash, setCash] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const cashAmount = Number(parseNumberInput(cash)) || 0;
  const change = cashAmount - bill.finalTotal;
  const isShort = change < 0;
  const isOver = change > 0;
  const savedRupiah = Number(parseNumberInput(savedAmount)) || 0;
  const cashBack = isOver ? change - savedRupiah : 0;
  const savedError =
    savedRupiah > change ? `Maksimal simpan ${formatRupiah(change)}` : null;

  const handlePay = () => {
    if (cashAmount <= 0) return;
    setError(null);

    Alert.alert("Yakin ?", "Sudah Yakin Mau bayar ?", [
      { text: "Gak jadi", style: "cancel" },
      {
        text: "OKE",
        style: "destructive",
        onPress: async () => {
          setIsPaying(true);
          try {
            const receipt = await paymentService.create({
              customerId: customer.customerId,
              cash: cashAmount,
              saveChange: savedRupiah,
            });
            navigation.replace("Receipt", {
              customer,
              paymentId: receipt.paymentId,
            });
          } catch (err: any) {
            setError(err.response?.data?.message ?? "Pembayaran gagal");
          } finally {
            setIsPaying(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <PaymentStepHeader
          customer={customer}
          step="pay"
          onBack={() => navigation.goBack()}
          backLabel="Tagihan"
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Total tagihan */}
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

          {/* Input cash + simpan kembalian */}
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

              {isOver && (
                <View style={styles.saveChangeSection}>
                  <Text variant="titleSmall" style={styles.saveChangeTitle}>
                    Simpan Kembalian
                  </Text>
                  <Text variant="bodySmall" style={styles.saveChangeSub}>
                    Masukan nominal yang ingin disimpan untuk bulan depan
                  </Text>

                  <TextInput
                    value={formatNumberInput(savedAmount)}
                    onChangeText={setSavedAmount}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.savedInput}
                    left={<TextInput.Affix text="Rp" />}
                  />

                  {savedError && (
                    <Text style={styles.savedErrorText}>{savedError}</Text>
                  )}

                  {savedRupiah > 0 && !savedError && (
                    <View style={styles.breakdownBox}>
                      <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLeft}>
                          <MaterialCommunityIcons
                            name="piggy-bank-outline"
                            size={16}
                            color={colors.primary}
                          />
                          <Text
                            variant="bodySmall"
                            style={styles.breakdownLabel}
                          >
                            Disimpan
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.breakdownSaved}>
                          {formatRupiah(savedRupiah)}
                        </Text>
                      </View>
                      <View style={[styles.breakdownRow, { marginTop: 8 }]}>
                        <View style={styles.breakdownLeft}>
                          <MaterialCommunityIcons
                            name="cash"
                            size={16}
                            color={colors.textSecondary}
                          />
                          <Text
                            variant="bodySmall"
                            style={styles.breakdownLabel}
                          >
                            Uang Kembalian
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.breakdownCash}>
                          {formatRupiah(cashBack)}
                        </Text>
                      </View>
                    </View>
                  )}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  errorBox: {
    backgroundColor: colors.danger + "15",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  totalCard: {
    borderRadius: 12,
    marginBottom: 0,
    elevation: 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingVertical: 20,
  },
  totalValue: { color: "#fff", fontWeight: "700" },
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
  cashInput: { backgroundColor: "#fff", marginBottom: 12 },
  cashInputContent: { fontSize: 20, fontWeight: "700", textAlign: "center" },
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
  saveChangeSection: {
    marginTop: 4,
    padding: 14,
    backgroundColor: colors.primary + "08",
    borderRadius: 10,
    gap: 8,
  },
  saveChangeTitle: { fontWeight: "600", color: colors.textPrimary },
  saveChangeSub: { color: colors.textSecondary, marginBottom: 4 },
  savedInput: { backgroundColor: "#fff" },
  savedErrorText: { color: colors.danger, fontSize: 12, marginTop: -4 },
  breakdownBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  breakdownLabel: { color: colors.textSecondary },
  breakdownSaved: { fontWeight: "700", color: colors.primary },
  breakdownCash: { fontWeight: "600", color: colors.textPrimary },
  actionBtn: { borderRadius: 10, marginTop: 4 },
  actionBtnContent: { paddingVertical: 6 },
});
