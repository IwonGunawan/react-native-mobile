import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/auth.store";
import { Card, Divider, ProgressBar, Surface, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParams } from "../../navigation/stacks/HomeStack";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import useHomeData from "../../hooks/useHomeData";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import VillageProgressModal from "../../components/shared/VillageProgressModal";
import { TopArrear } from "../../services/report.service";
import { formatRupiah } from "../../utils";

type Nav = NativeStackNavigationProp<HomeStackParams, "HomeMain">;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { data, isLoading, isRefresh, refetch } = useHomeData();

  const [modalVisible, setModalVisible] = useState(false);
  const [showAllArrears, setShowAllArrears] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
        ? "Selamat siang"
        : hour < 18
          ? "Selamat sore"
          : "Selamat malam";
  const greetingIcon =
    hour < 11
      ? "weather-sunny"
      : hour < 15
        ? "weather-sunny"
        : hour < 18
          ? "weather-sunset-up"
          : "weather-night";

  const allArrears = (data?.topArrears ?? []) as TopArrear[];
  const visibleArrears = showAllArrears ? allArrears : allArrears.slice(0, 5);
  const arrearsHasMore = allArrears.length > 5;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <FlatList
        data={data?.recentPayments ?? []}
        keyExtractor={(item) => item.paymentId.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ── Greeting ── */}
            <View style={styles.greeting}>
              <View style={styles.greetingAvatar}>
                <MaterialCommunityIcons
                  name={greetingIcon}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.greetingTexts}>
                <Text variant="bodySmall" style={styles.greetText}>
                  {greeting}
                </Text>
                <Text
                  variant="titleLarge"
                  style={styles.nameText}
                  numberOfLines={1}
                >
                  {user?.name ?? "Pengguna"}
                </Text>
              </View>
            </View>

            {/* ── Payment Status Cards ── */}
            {user?.level == "0" && (
              <View style={styles.statsRow}>
                <Surface style={styles.statCard} elevation={1}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={28}
                    color={colors.success}
                  />
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {isLoading ? "-" : (data?.paidCount ?? 0)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Sudah Bayar
                  </Text>
                </Surface>

                <Surface style={styles.statCard} elevation={1}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={28}
                    color={colors.warning}
                  />
                  <Text
                    variant="headlineMedium"
                    style={[styles.statNumber, { color: colors.warning }]}
                  >
                    {isLoading ? "-" : (data?.unpaidCount ?? 0)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Belum Bayar
                  </Text>
                </Surface>
              </View>
            )}

            {/* ── Total Pemakaian Air ── */}
            <Card style={styles.m3Card}>
              <Card.Content style={styles.m3Content}>
                <View style={styles.m3Left}>
                  <MaterialCommunityIcons
                    name="gauge"
                    size={32}
                    color={colors.primary}
                  />
                  <View>
                    <Text variant="titleSmall" style={styles.m3Title}>
                      Total Pemakaian Air
                    </Text>
                    <Text variant="bodySmall" style={styles.m3Sub}>
                      Bulan ini (semua wilayah)
                    </Text>
                  </View>
                </View>
                <Text variant="headlineSmall" style={styles.m3Value}>
                  {isLoading
                    ? "-"
                    : `${(data?.totalM3 ?? 0).toLocaleString("id-ID")} m³`}
                </Text>
              </Card.Content>
            </Card>

            {/* ── Progress Cek Air ── */}
            <TouchableOpacity
              onPress={() => !isLoading && setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Card style={styles.progressCard}>
                <Card.Content>
                  <View style={styles.progressHeader}>
                    <View>
                      <Text variant="titleSmall" style={styles.progressTitle}>
                        Progress Cek Air Bulan Ini
                      </Text>
                      <Text variant="bodySmall" style={styles.progressSub}>
                        {isLoading
                          ? "Memuat..."
                          : `total customer yang sudah dicek meter air`}
                        {/* : `${(data?.totalCustomers ?? 0) - (data?.totalChecked ?? 0)} customer belum dicek`} */}
                      </Text>
                    </View>
                    <View style={styles.percentBadge}>
                      <Text style={styles.percentText}>
                        {isLoading ? "-" : `${data?.checkPercent ?? 0}%`}
                      </Text>
                    </View>
                  </View>

                  <ProgressBar
                    progress={isLoading ? 0 : (data?.checkPercent ?? 0) / 100}
                    color={
                      (data?.checkPercent ?? 0) === 100
                        ? colors.success
                        : colors.primary
                    }
                    style={styles.progressBar}
                  />

                  <View style={styles.progressFooter}>
                    <Text variant="bodySmall" style={styles.progressHint}>
                      Tap untuk detail per wilayah
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>

            {/* ── Top Tunggakan ── */}
            <View style={styles.sectionRow}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Top Sisa Tunggakan
              </Text>
            </View>

            <Card style={styles.arrearsCard}>
              {isLoading ? (
                <View style={styles.arrearItem}>
                  <Text variant="bodySmall" style={styles.loadingText}>
                    Memuat...
                  </Text>
                </View>
              ) : (data?.topArrears ?? []).length === 0 ? (
                <View style={styles.arrearItem}>
                  <Text variant="bodySmall" style={styles.loadingText}>
                    Tidak ada tunggakan
                  </Text>
                </View>
              ) : (
                <View>
                  {visibleArrears.map((item, index) => (
                    <View key={item.customerId}>
                      <View style={styles.arrearItem}>
                        <View style={styles.arrearRank}>
                          <Text style={styles.arrearRankText}>{index + 1}</Text>
                        </View>
                        <View style={styles.arrearInfo}>
                          <Text variant="bodyMedium" style={styles.arrearName}>
                            {item.name}
                          </Text>
                          <Text variant="bodySmall" style={styles.arrearCode}>
                            {item.code}
                          </Text>
                        </View>
                        <Text variant="bodyMedium" style={styles.arrearAmount}>
                          {formatRupiah(item.arrearsAmount)}
                        </Text>
                      </View>
                      {(index < visibleArrears.length - 1 ||
                        arrearsHasMore) && <Divider />}
                    </View>
                  ))}
                  {arrearsHasMore && (
                    <TouchableOpacity
                      style={styles.arrearsSeeMoreBtn}
                      onPress={() => setShowAllArrears((v) => !v)}
                    >
                      <Text style={styles.seeAllText}>
                        {showAllArrears
                          ? "Sembunyikan"
                          : "Lihat semua tunggakan"}
                      </Text>
                      <MaterialCommunityIcons
                        name={showAllArrears ? "chevron-up" : "arrow-right"}
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Card>

            {/* ── Transaksi Terakhir ── */}
            <View style={[styles.sectionRow, { marginTop: 16 }]}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Transaksi Terakhir
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("PaymentHistory")}
                style={styles.seeMore}
              >
                <Text style={styles.seeMoreText}>Lihat semua</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={14}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Empty state */}
            {!isLoading && (data?.recentPayments.length ?? 0) === 0 && (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <MaterialCommunityIcons
                    name="receipt-text-outline"
                    size={40}
                    color={colors.textSecondary}
                  />
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Belum ada transaksi bulan ini
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <Card style={[styles.txCard, index === 0 && styles.txCardFirst]}>
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
                <Text variant="bodySmall" style={styles.txVillage}>
                  {item.village} · {item.officer}
                </Text>
              </View>

              <View style={styles.txMeta}>
                <Text variant="bodySmall" style={styles.txDate}>
                  {new Date(item.paidDate).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
                <Text variant="bodySmall" style={styles.txTime}>
                  {new Date(item.paidDate).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </Card.Content>
            <Divider />
          </Card>
        )}
        ListFooterComponent={
          (data?.recentPayments.length ?? 0) > 0 ? (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => navigation.navigate("PaymentHistory")}
            >
              <Text style={styles.seeAllText}>Lihat semua transaksi</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      <VillageProgressModal
        visible={modalVisible}
        stats={data?.villageStats ?? []}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: 32 },

  // Greeting
  greeting: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  greetingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  greetingTexts: { flex: 1, minWidth: 0 },
  greetText: { color: colors.textSecondary, fontWeight: "500" },
  nameText: { color: colors.textPrimary, fontWeight: "700" },

  // Payment stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statNumber: { fontWeight: "700", color: colors.textPrimary },
  statLabel: { color: colors.textSecondary, textAlign: "center" },

  // m³ Card
  m3Card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  m3Content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  m3Left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  m3Title: { fontWeight: "600", color: colors.textPrimary },
  m3Sub: { color: colors.textSecondary, marginTop: 2 },
  m3Value: { fontWeight: "700", color: colors.textPrimary },

  // Progress
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  progressTitle: { fontWeight: "600", color: colors.textPrimary },
  progressSub: { color: colors.textSecondary, marginTop: 2 },
  percentBadge: {
    backgroundColor: colors.primaryLight + "20",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  percentText: { color: colors.primary, fontWeight: "700", fontSize: 15 },
  progressBar: { height: 10, borderRadius: 5 },
  progressFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 4,
  },
  progressHint: { color: colors.textSecondary },

  // Section header
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: { fontWeight: "600", color: colors.textPrimary },
  seeMore: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeMoreText: { color: colors.primary, fontSize: 13, fontWeight: "600" },

  // Top Tunggakan
  arrearsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  arrearItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  arrearRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  arrearRankText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  arrearInfo: { flex: 1 },
  arrearName: { fontWeight: "600", color: colors.textPrimary },
  arrearCode: { color: colors.textSecondary, marginTop: 1 },
  arrearAmount: { color: colors.danger, fontWeight: "700", flexShrink: 0 },
  arrearsSeeMoreBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  loadingText: { color: colors.textSecondary },

  // Empty
  emptyCard: { marginHorizontal: 16, borderRadius: 12 },
  emptyContent: { alignItems: "center", paddingVertical: 32, gap: 12 },
  emptyText: { color: colors.textSecondary },

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
  txContent: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
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
  txVillage: { color: colors.textSecondary, marginTop: 1 },
  txOfficer: { color: colors.textSecondary, marginTop: 1 },
  txMeta: { alignItems: "flex-end", flexShrink: 0 },
  txDate: { color: colors.textSecondary },
  txTime: { color: colors.textSecondary, marginTop: 1 },

  // See All
  seeAllBtn: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  seeAllText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
});
