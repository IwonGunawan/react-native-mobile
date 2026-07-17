import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Text, Card, IconButton, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../theme";
import {
  MonthlyReportItem,
  reportService,
} from "../../services/report.service";
import { formatRupiah } from "../../utils";

export default function PaymentHistoryScreen() {
  const navigation = useNavigation();

  const now = new Date();
  const [data, setData] = useState<MonthlyReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIncome, setTotalIncome] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchData = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (pageNum === 1) {
      isRefresh ? setIsRefreshing(true) : setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await reportService.getMonthly({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        page: pageNum,
        limit: 15,
        sortOrder: "DESC",
      });

      setData((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
      setTotalPages(res.meta.totalPages);
      setHasMore(pageNum < res.meta.totalPages);
      if (res.summary) setTotalIncome(res.summary.totalIncome);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchData(1, true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <View style={styles.headerTitle}>
          <Text variant="titleMedium" style={styles.headerText}>
            Semua Transaksi
          </Text>
          <Text variant="bodySmall" style={styles.headerSub}>
            {new Date().toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.paymentId.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          // Summary card
          totalIncome > 0 ? (
            <Card style={styles.summaryCard}>
              <Card.Content style={styles.summaryContent}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={32}
                  color={colors.primary}
                />
                <View>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Total Pemasukan Bulan Ini
                  </Text>
                  <Text variant="titleLarge" style={styles.summaryValue}>
                    {formatRupiah(totalIncome)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Card
            style={[
              styles.txCard,
              index === 0 && styles.txCardFirst,
              index === data.length - 1 && styles.txCardLast,
            ]}
          >
            <Card.Content style={styles.txContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.customerName?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.txInfo}>
                <Text variant="bodyMedium" style={styles.txName}>
                  {item.customerName}
                </Text>
                <Text variant="bodySmall" style={styles.txMeta}>
                  {item.village} · {item.officer}
                </Text>
                <Text variant="bodySmall" style={styles.txMeta}>
                  {new Date(item.paidDate).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {new Date(item.paidDate).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <View style={styles.txAmount}>
                <Text variant="bodyMedium" style={styles.txTotal}>
                  {formatRupiah(item.total)}
                </Text>
                <Text variant="bodySmall" style={styles.txCash}>
                  Tunai {formatRupiah(item.cash)}
                </Text>
              </View>
            </Card.Content>
            <Divider />
          </Card>
        )}
        // Load more saat scroll ke bawah
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <Text variant="bodySmall" style={styles.loadingText}>
                Memuat lebih banyak...
              </Text>
            </View>
          ) : !hasMore && data.length > 0 ? (
            <View style={styles.loadingMore}>
              <Text variant="bodySmall" style={styles.loadingText}>
                Semua data ditampilkan
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: 32 },

  // Header
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

  // Summary
  summaryCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    elevation: 4,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  summaryLabel: { color: "rgba(255,255,255,0.8)", marginBottom: 2 },
  summaryValue: { color: "#fff", fontWeight: "700" },

  // Transaction
  txCard: {
    marginHorizontal: 16,
    borderRadius: 0,
    elevation: 1,
  },
  txCardFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  txCardLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  txContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  txInfo: { flex: 1 },
  txName: { fontWeight: "600", color: colors.textPrimary },
  txMeta: { color: colors.textSecondary, marginTop: 1 },
  txAmount: { alignItems: "flex-end", flexShrink: 0 },
  txTotal: { fontWeight: "700", color: colors.primary },
  txCash: { color: colors.textSecondary, marginTop: 2 },

  // Load more
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadingText: { color: colors.textSecondary },
});
