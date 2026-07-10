import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Divider, IconButton, Text } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { PaymentHistory, paymentService } from "../../services/payment.service";
import { PaymentStackParams } from "../../navigation/stacks/PaymentStack";
import { colors } from "../../theme";
import { formatRupiah, STATUS_MAP } from "../../utils";
import { usePrinter } from "../../hooks/usePrinter";
import { ReceiptData } from "../../services/receipt/printer.service";
import PrinterSelectorModal from "../../components/shared/PrinterSelectorModal";

type Route = RouteProp<PaymentStackParams, "PaymentHistory">;
type Navigation = NativeStackNavigationProp<
  PaymentStackParams,
  "PaymentHistory"
>;

export default function PaymentHistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { customer } = route.params;
  const printer = usePrinter();

  const [data, setData] = useState<PaymentHistory[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);

  const hasMore = page < totalPages;

  // Bangun ReceiptData dari history item + info customer
  const buildReceiptData = (item: PaymentHistory): ReceiptData => ({
    refNumber: item.refNumber || item.logUuid,
    paidDate: item.createdAt,
    prefix: customer.prefix,
    customerName: customer.name,
    monthTotal: item.monthTotal ?? 0,
    total: item.total,
    textInfo: item.textInfo || "Terima kasih atas pembayaran",
    cash: item.cash,
    change: item.change ?? Math.max(item.cash - item.total, 0),
    savedAmount: item.savedAmount ?? 0,
  });

  // Handler print struk per item history
  const handlePrint = async (item: PaymentHistory) => {
    if (printingId !== null) return;
    setPrintingId(item.id);
    try {
      await printer.print(buildReceiptData(item));
    } finally {
      setPrintingId(null);
    }
  };

  const fetchData = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      if (pageNum === 1) {
        isRefresh ? setIsRefreshing(true) : setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);
      try {
        const res = await paymentService.histories(customer.customerId, {
          page: pageNum,
          limit: 15,
        });

        setData((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
        setTotalPages(res.meta.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Gagal memuat transaksi");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [customer.customerId],
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleRefresh = () => {
    setPage(1);
    fetchData(1, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const renderItem = ({ item }: { item: PaymentHistory }) => {
    const paidDate = new Date(item.createdAt);
    const isPrintingThis = printingId === item.id;
    const statusInfo = STATUS_MAP[item.status] ?? STATUS_MAP["1"];

    return (
      <Card style={styles.txCard}>
        <Card.Content style={styles.txContent}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="cash-check"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.txInfo}>
            <Text variant="bodyMedium" style={styles.txTitle}>
              {formatRupiah(item.total)}
            </Text>
            <Text variant="bodySmall" style={styles.txMeta}>
              Tunai {formatRupiah(item.cash)}
            </Text>
            <Text variant="bodySmall" style={styles.txMeta}>
              {paidDate.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              {paidDate.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={styles.rightActions}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}
            >
              <Text
                variant="labelSmall"
                style={[styles.statusBadgeText, { color: statusInfo.color }]}
              >
                {statusInfo.label}
              </Text>
            </View>
            <IconButton
              icon="printer"
              size={20}
              iconColor={colors.primary}
              loading={isPrintingThis}
              disabled={printingId !== null}
              onPress={() => handlePrint(item)}
              style={styles.printBtn}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <View style={styles.headerTitle}>
          <Text variant="titleMedium" style={styles.headerText}>
            Semua Transaksi
          </Text>
          <Text variant="bodySmall" style={styles.headerSub}>
            {customer.name}
          </Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={40}
                color={colors.textSecondary}
              />
              <Text variant="bodyMedium" style={styles.emptyTitle}>
                Belum ada transaksi
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading || isLoadingMore ? (
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                Memuat transaksi...
              </Text>
            </View>
          ) : !hasMore && data.length > 0 ? (
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                Semua transaksi ditampilkan
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
      <PrinterSelectorModal
        visible={printer.showSelector}
        onSelect={printer.onPrinterSelected}
        onClose={printer.closeSelector}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 32 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1 },
  headerText: { fontWeight: "700", color: colors.textPrimary },
  headerSub: { color: colors.textSecondary },

  errorBox: {
    backgroundColor: colors.danger + "15",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13 },

  txCard: {
    borderRadius: 12,
    elevation: 1,
    backgroundColor: "#fff",
  },
  txContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txTitle: { fontWeight: "700", color: colors.primary },
  txMeta: { color: colors.textSecondary, marginTop: 2 },
  rightActions: {
    alignItems: "flex-end",
    gap: 2,
    flexShrink: 0,
  },
  printBtn: {
    margin: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  divider: { marginVertical: 6, opacity: 0 },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: { color: colors.textSecondary },

  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: { color: colors.textSecondary },
});
