import { Fragment, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { paymentService, Receipt } from "../../services/payment.service";
import { PaymentStackParams } from "../../navigation/stacks/PaymentStack";
import { colors } from "../../theme";
import { formatRupiah, MONTHS } from "../../utils";
import { usePrinter } from "../../hooks/usePrinter";
import { ReceiptData } from "../../services/receipt/printer.service";
import PrinterSelectorModal from "../../components/shared/PrinterSelectorModal";
import PaymentStepHeader from "../../components/shared/PaymentStepHeader";

type Route = RouteProp<PaymentStackParams, "Receipt">;
type Navigation = NativeStackNavigationProp<PaymentStackParams, "Receipt">;

export default function ReceiptScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { customer, paymentId } = route.params;
  const printer = usePrinter();

  const [detail, setDetail] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentService.getReceipt(paymentId);
      setDetail(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal memuat struk");
    } finally {
      setIsLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const buildReceiptData = (): ReceiptData | null => {
    if (!detail) return null;
    return {
      prefix: customer.prefix,
      customerName: customer.name,
      customerCode: customer.code,
      refNumber: detail.refNumber,
      paidDate: detail.paidDate,
      total: detail.total,
      cash: detail.cash,
      change: detail.change,
      textInfo: detail.textInfo,
      monthTotal: detail.monthTotal,
      monthList: detail.monthList,
      underpayment: detail.underpayment,
      overpayment: detail.overpayment,
    };
  };

  const handlePrint = async () => {
    const data = buildReceiptData();
    if (!data) return;
    await printer.print(data);
  };

  const handleSharePdf = async () => {
    const data = buildReceiptData();
    if (!data) return;
    await printer.shareAsPdf(data);
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  const handleRetry = () => {
    fetchDetail();
  };

  // Error state — tampilkan opsi retry / keluar
  if (error && !detail) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.feedbackWrapper}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={56}
            color={colors.danger}
          />
          <Text variant="titleMedium" style={styles.feedbackTitle}>
            Tidak dapat memuat struk
          </Text>
          <Text variant="bodySmall" style={styles.feedbackSub}>
            {error}
          </Text>
          <View style={styles.feedbackActions}>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.actionBtn}
              contentStyle={styles.actionBtnContent}
              icon="refresh"
            >
              Coba Lagi
            </Button>
            <Button
              mode="outlined"
              onPress={handleDone}
              style={styles.actionBtn}
              contentStyle={styles.actionBtnContent}
              icon="home"
            >
              Kembali ke Home
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading || !detail) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.feedbackWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="bodyMedium" style={styles.feedbackSub}>
            Memuat struk...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <PaymentStepHeader customer={customer} step="receipt" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
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
            {detail.textInfo}
          </Text>
        </View>

        {/* Struk */}
        <Card style={styles.receiptCard}>
          <Card.Content>
            <Text style={styles.receiptHeader}>STRUK PEMBAYARAN AIR</Text>
            <Text style={styles.receiptSubHeader}>CIKARET SETRA</Text>
            <View style={styles.receiptDivider} />

            <ReceiptRow
              label="No. Ref"
              value={detail.refNumber.slice(0, 8).toUpperCase()}
            />
            <ReceiptRow label="Kode. Pel" value={customer.code} />
            <ReceiptRow
              label="Nama"
              value={`${customer.prefix} ${customer.name}`}
            />
            <ReceiptRow
              label="Tgl Bayar"
              value={new Date(detail.paidDate).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <ReceiptRow
              label="Jam"
              value={new Date(detail.paidDate).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <ReceiptRow
              label="Jml Bulan"
              value={`${detail.monthTotal} bulan`}
            />

            {detail.monthList.length > 0 && (
              <>
                <View style={styles.receiptDivider} />
                {detail.monthList
                  .filter((item) => item.totalPrice != null)
                  .map((item) => {
                    return (
                      <Fragment key={`${item.year}-${item.month}`}>
                        <ReceiptRow
                          label={`${MONTHS[item.month]} ${item.year}`}
                          value={formatRupiah(item.totalPrice)}
                        />
                      </Fragment>
                    );
                  })}
              </>
            )}

            {detail.underpayment != null &&
              Object.keys(detail.underpayment).length > 0 && (
                <>
                  <View style={styles.receiptDivider} />
                  <ReceiptRow
                    label={`Kurang bayar bln ${MONTHS[detail.underpayment.month]} ${detail.underpayment.year}`}
                    value={formatRupiah(detail.underpayment.totalPrice)}
                  />
                </>
              )}

            {detail.overpayment != null &&
              Object.keys(detail.overpayment).length > 0 && (
                <>
                  <View style={styles.receiptDivider} />
                  <ReceiptRow
                    label={`Lebih bayar bln ${MONTHS[detail.overpayment.month]} ${detail.overpayment.year}`}
                    value={formatRupiah(detail.overpayment.totalPrice)}
                  />
                </>
              )}

            <View style={styles.receiptDivider} />
            <ReceiptRow label="Total" value={formatRupiah(detail.total)} bold />
            <ReceiptRow label="Bayar" value={formatRupiah(detail.cash)} bold />

            <View style={styles.receiptDivider} />
            <Text style={styles.receiptFooter}>{detail.textInfo}</Text>
          </Card.Content>
        </Card>

        {/* Inline error banner kalau gagal refresh setelah sempat load */}
        {error && (
          <View style={styles.inlineErrorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Button compact mode="text" onPress={handleRetry} icon="refresh">
              Coba Lagi
            </Button>
          </View>
        )}

        {/* Print status */}
        {printer.isPrinting && (
          <View style={styles.printStatus}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              {printer.status === "connecting"
                ? "Menghubungkan Printer..."
                : "Mencetak..."}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.receiptActions}>
          <Button
            mode="contained"
            onPress={handlePrint}
            disabled={printer.isPrinting}
            loading={printer.isPrinting}
            icon="printer"
            style={[styles.actionBtn, { flex: 0.6 }]}
            contentStyle={styles.actionBtnContent}
          >
            Cetak
          </Button>
          <Button
            mode="outlined"
            onPress={handleSharePdf}
            disabled={printer.isPrinting}
            icon="share-variant"
            style={[styles.actionBtn, { flex: 0.4 }]}
            contentStyle={styles.actionBtnContent}
          >
            Share
          </Button>
        </View>

        {printer.savedPrinter && (
          <TouchableOpacity
            style={styles.changePrinter}
            onPress={() => {
              const data = buildReceiptData();
              if (data) printer.changePrinter(data);
            }}
          >
            <MaterialCommunityIcons
              name="printer-settings"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.changePrinterText}>
              Printer: {printer.savedPrinter.device_name} · Ganti
            </Text>
          </TouchableOpacity>
        )}

        <Button
          mode="contained"
          onPress={handleDone}
          style={styles.actionBtn}
          contentStyle={styles.actionBtnContent}
          icon="check"
        >
          Selesai
        </Button>

        <PrinterSelectorModal
          visible={printer.showSelector}
          onSelect={printer.onPrinterSelected}
          onClose={printer.closeSelector}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  scroll: { padding: 16, paddingBottom: 32 },
  feedbackWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  feedbackTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: 8,
  },
  feedbackSub: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  feedbackActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#bbb",
    borderStyle: "dashed",
    marginVertical: 10,
  },
  receiptFooter: {
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "center",
    color: "#555",
    marginTop: 4,
  },
  inlineErrorBox: {
    backgroundColor: colors.danger + "15",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  printStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  receiptActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  changePrinter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  changePrinterText: { fontSize: 12, color: colors.textSecondary },
  actionBtn: { borderRadius: 10, marginTop: 4 },
  actionBtnContent: { paddingVertical: 6 },
});
