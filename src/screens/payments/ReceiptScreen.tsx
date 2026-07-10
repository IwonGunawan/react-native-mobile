import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { PaymentStackParams } from "../../navigation/stacks/PaymentStack";
import { colors } from "../../theme";
import { formatRupiah } from "../../utils";
import { usePrinter } from "../../hooks/usePrinter";
import { ReceiptData } from "../../services/receipt/printer.service";
import PrinterSelectorModal from "../../components/shared/PrinterSelectorModal";
import PaymentStepHeader from "../../components/shared/PaymentStepHeader";

type Route = RouteProp<PaymentStackParams, "Receipt">;
type Navigation = NativeStackNavigationProp<PaymentStackParams, "Receipt">;

export default function ReceiptScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { customer, receipt, savedAmount } = route.params;
  const printer = usePrinter();

  const buildReceiptData = (): ReceiptData | null => ({
    prefix: customer.prefix,
    customerName: customer.name,
    refNumber: receipt.refNumber,
    paidDate: receipt.paidDate,
    monthTotal: receipt.monthTotal,
    total: receipt.total,
    textInfo: receipt.textInfo,
    cash: receipt.cash,
    change: receipt.change,
    savedAmount,
  });

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

  return (
    <SafeAreaView style={styles.safe}>
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
            {receipt.textInfo}
          </Text>
        </View>

        {/* Struk */}
        <Card style={styles.receiptCard}>
          <Card.Content>
            <Text style={styles.receiptHeader}>STRUK PEMBAYARAN AIR</Text>
            <Text style={styles.receiptSubHeader}>CIKARET SETRA</Text>
            <Text style={styles.receiptDivider}>{"─".repeat(36)}</Text>

            <ReceiptRow
              label="No. Ref"
              value={receipt.refNumber.slice(0, 8).toUpperCase()}
            />
            <ReceiptRow label="Kode. Pel" value={customer.code} />
            <ReceiptRow
              label="Nama"
              value={`${customer.prefix} ${customer.name}`}
            />
            <ReceiptRow
              label="Tgl Bayar"
              value={new Date(receipt.paidDate).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <ReceiptRow
              label="Jam"
              value={new Date(receipt.paidDate).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <ReceiptRow
              label="Jml Bulan"
              value={`${receipt.monthTotal} bulan`}
            />

            <Text style={styles.receiptDivider}>{"─".repeat(36)}</Text>

            <ReceiptRow label="-Jan 2026" value="Rp50.000" />
            <ReceiptRow label="-Feb 2026" value="Rp40.000" />
            <ReceiptRow label="-Mar 2026" value="Rp30.000" />

            <Text style={styles.receiptDivider}>{"─".repeat(36)}</Text>

            <ReceiptRow
              label="Tagihan"
              value={formatRupiah(receipt.total)}
              bold
            />
            <ReceiptRow label="Tunai" value={formatRupiah(receipt.cash)} />
            <ReceiptRow
              label="Kembalian"
              value={formatRupiah(receipt.change)}
            />
            {savedAmount > 0 && (
              <ReceiptRow label="Disimpan" value={formatRupiah(savedAmount)} />
            )}

            <Text style={styles.receiptDivider}>{"─".repeat(36)}</Text>
            <Text style={styles.receiptFooter}>{receipt.textInfo}</Text>
          </Card.Content>
        </Card>

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
            style={[styles.actionBtn, { flex: 1 }]}
            contentStyle={styles.actionBtnContent}
          >
            Print
          </Button>
          <Button
            mode="outlined"
            onPress={handleSharePdf}
            disabled={printer.isPrinting}
            icon="share-variant"
            style={[styles.actionBtn, { flex: 1 }]}
            contentStyle={styles.actionBtnContent}
          >
            Share PDF
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
