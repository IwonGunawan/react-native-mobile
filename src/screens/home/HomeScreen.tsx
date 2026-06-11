import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/auth.store";
import { Card, Divider, ProgressBar, Surface, Text } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParams } from "../../navigation/stacks/HomeStack";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import useHomeData from "../../hooks/useHomeData";
import { DAYS, MONTHS } from "../../utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import VillageProgressModal from "../../components/shared/VillageProgressModal";

type Nav = NativeStackNavigationProp<HomeStackParams, "HomeMain">;

function useClock() {
  const [now, setNow] = useState(new Date());
  useState(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  });

  return now;
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const now = useClock();
  const { user } = useAuthStore();
  const { data, isLoading, isRefresh, refetch } = useHomeData();
  const [modalVisible, setModalVisible] = useState(false);

  const dateStr = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <SafeAreaView style={styles.safe}>
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
              <View>
                <Text variant="bodyLarge" style={styles.greetText}>
                  Selamat bekerja,
                </Text>
                <Text variant="headlineMedium" style={styles.nameText}>
                  {user?.name}
                </Text>
              </View>
            </View>

            {/* ── Clock Card ── */}
            <Card style={styles.clockCard}>
              <Card.Content style={styles.clockContent}>
                <View>
                  <Text style={styles.dateText}>{dateStr}</Text>
                  <Text style={styles.timeText}>{timeStr}</Text>
                </View>
                <MaterialCommunityIcons
                  name="water"
                  size={72}
                  color="rgba(255,255,255,0.2)"
                />
              </Card.Content>
            </Card>

            {/* ── Payment Status Cards ── */}
            <View style={styles.statsRow}>
              <Surface
                style={[styles.statCard, styles.statCardLeft]}
                elevation={1}
              >
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

              <Surface
                style={[styles.statCard, styles.statCardRight]}
                elevation={1}
              >
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

            {/* ── Check Progress Card ── */}
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
                          : `${(data?.totalCustomers ?? 0) - (data?.totalChecked ?? 0)} customer belum dicek`}
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

            {/* ── Total m³ Card (placeholder) ── */}
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
                <View style={styles.m3Right}>
                  <Text variant="headlineSmall" style={styles.m3Value}>
                    {isLoading ? "-" : `${(data?.totalM3 ?? 0).toLocaleString("id-ID")} m³`}
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* ── Recent Transactions Header ── */}
            <View style={styles.sectionRow}>
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
                  {item.prefix} {item.customerName}
                </Text>
                <Text variant="bodySmall" style={styles.txVillage}>
                  {item.village}
                </Text>
                <Text variant="bodySmall" style={styles.txOfficer}>
                  diterima oleh{" "}
                  <Text style={{ fontWeight: "700" }}>{item.officer}</Text>
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

      {/* Village Progress Modal */}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greetText: { color: colors.textSecondary },
  nameText: { color: colors.primary, fontWeight: "700" },

  // Clock
  clockCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
    elevation: 4,
  },
  clockContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  dateText: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 4 },
  timeText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // Stats
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
  statCardLeft: {},
  statCardRight: {},
  statNumber: { fontWeight: "700", color: colors.textPrimary },
  statLabel: { color: colors.textSecondary, textAlign: "center" },

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

  // m³ Card
  m3Card: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  m3Right: { alignItems: "flex-end" },
  m3Value: { fontWeight: "700", color: colors.textPrimary },
  m3Pending: { color: colors.textSecondary, fontSize: 11 },

  // Section
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: { fontWeight: "600", color: colors.textPrimary },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeMoreText: { color: colors.primary, fontSize: 13, fontWeight: "600" },

  // Empty
  emptyCard: { marginHorizontal: 16, borderRadius: 12 },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
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
  txContent: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  txVillage: { color: colors.textSecondary, marginTop: 1 },
  txOfficer: { color: colors.textSecondary, marginTop: 1 },
  txMeta: { alignItems: "flex-end", flexShrink: 0 },
  txDate: { color: colors.textSecondary },
  txTime: { color: colors.textSecondary, marginTop: 1 },

  // See All
  seeAllBtn: {
    marginHorizontal: 16,
    marginTop: 2,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
    elevation: 1,
  },
  seeAllText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
});
