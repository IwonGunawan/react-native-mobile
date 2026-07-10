import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { Text, Button, Card, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { paymentService, Bill } from "../../services/payment.service";
import { PaymentStackParams } from "../../navigation/stacks/PaymentStack";
import { colors } from "../../theme";
import { formatRupiah, MONTHS } from "../../utils";
import PaymentStepHeader from "../../components/shared/PaymentStepHeader";

type Route = RouteProp<PaymentStackParams, "Bill">;
type Navigation = NativeStackNavigationProp<PaymentStackParams, "Bill">;

export default function BillScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { customer } = route.params;

  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBill = async (refresh = false) => {
    refresh ? setIsRefresh(true) : setIsLoading(true);
    setError(null);
    try {
      const data = await paymentService.getBill(customer.customerId);
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

  const goToPay = () => {
    if (!bill) return;
    navigation.navigate("Pay", { customer, bill });
  };

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
      <PaymentStepHeader
        customer={customer}
        step="bill"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={() => fetchBill(true)}
            colors={[colors.primary]}
          />
        }
      >
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {bill && (
          <>
            {/* Total card */}
            <Card style={styles.totalCard}>
              <Card.Content style={styles.totalContent}>
                {bill.finalTotal > 0 && (
                  <Text variant="bodyMedium" style={styles.totalLabel}>
                    Total yang harus dibayar
                  </Text>
                )}
                <Text variant="headlineMedium" style={styles.totalValue}>
                  {bill.finalTotal > 0
                    ? formatRupiah(bill.finalTotal)
                    : "LUNAS"}
                </Text>
              </Card.Content>
            </Card>

            {/* Detail tagihan */}
            <Card style={styles.detailCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.detailTitle}>
                  Rincian Tagihan{" "}
                  <Text style={{ color: colors.warning }}>
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
                          <Text variant="bodySmall" style={styles.detailLabel}>
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

            {bill.finalTotal > 0 && (
              <Button
                mode="contained"
                onPress={goToPay}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                icon="cash"
              >
                Lanjut ke Pembayaran
              </Button>
            )}

            <Card style={[styles.infoCard, { marginTop: 24 }]}>
              <Card.Content style={styles.infoContent}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={colors.info}
                />
                <Text variant="bodySmall" style={styles.infoText}>
                  {bill.textInfo}
                </Text>
              </Card.Content>
            </Card>

            <Button
              mode="outlined"
              onPress={() =>
                navigation.navigate("PaymentHistory", { customer })
              }
              style={styles.historyBtn}
              contentStyle={styles.historyBtnContent}
              icon="format-list-bulleted"
            >
              Lihat Semua Transaksi
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorBox: {
    backgroundColor: colors.danger + "15",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  totalCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.primary,
  },
  totalContent: { alignItems: "center", paddingVertical: 20 },
  totalLabel: { color: "rgba(255,255,255,0.8)", marginBottom: 8 },
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
  infoCard: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: colors.textPrimary,
    lineHeight: 19,
    fontSize: 13,
  },
  historyBtn: {
    borderRadius: 12,
    marginBottom: 12,
    borderColor: colors.primary,
  },
  historyBtnContent: { paddingVertical: 6 },
  actionBtn: { borderRadius: 10, marginTop: 4 },
  actionBtnContent: { paddingVertical: 6 },
});
