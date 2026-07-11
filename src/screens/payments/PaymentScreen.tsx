import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { Text, Searchbar, Chip, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { villageService } from "../../services/village.service";
import { PaymentStackParams } from "../../navigation/stacks/PaymentStack";
import { colors } from "../../theme";
import { usePaymentList } from "../../hooks/usePayment";
import { ListPayment } from "../../services/payment.service";
import { formatRupiah } from "../../utils";

type Nav = NativeStackNavigationProp<PaymentStackParams, "PaymentList">;

export default function PaymentsScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();

  const [villages, setVillages] = useState<{ id: number; name: string }[]>([]);
  const [searchText, setSearchText] = useState("");

  const {
    data,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    totalData,
    query,
    updateQuery,
    loadMore,
    refresh,
  } = usePaymentList();

  // Fetch villages untuk filter
  useEffect(() => {
    villageService
      .getAll()
      .then(setVillages)
      .catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateQuery({ search: searchText || undefined });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Refetch
  useEffect(() => {
    if (isFocused) {
      refresh();
    }
  }, [isFocused]);

  const renderItem = ({ item }: { item: ListPayment }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Bill", { customer: item })}
        activeOpacity={0.7}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text variant="bodyMedium" style={styles.name}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.code}>
                {item.code}
              </Text>
            </View>

            {/* Status */}
            <View style={styles.right}>
              {item.finalTotal > 0 ? (
                <View style={styles.readyBadge}>
                  <Text style={[styles.statusText, { color: colors.warning }]}>
                    {formatRupiah(item.finalTotal)}
                  </Text>
                </View>
              ) : (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color={colors.primary}
                />
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Bayar Air
          </Text>
          <Text variant="bodySmall" style={styles.headerSub}>
            {totalData} customers
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Searchbar
          placeholder="Cari nama atau kode..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchbar}
          inputStyle={{ fontSize: 14 }}
          elevation={0}
        />
      </View>

      {/* Village Chips */}
      <View style={styles.chips}>
        {villages.map((v) => (
          <Chip
            key={v.id}
            selected={query.villageId === v.id}
            onPress={() =>
              updateQuery({
                villageId: query.villageId === v.id ? undefined : v.id,
              })
            }
            style={[
              styles.chip,
              query.villageId === v.id && styles.chipSelected,
            ]}
            textStyle={
              query.villageId == v.id
                ? styles.chipSelectedText
                : styles.chipText
            }
            selectedColor="#fff"
            showSelectedCheck
            compact
          >
            {v.name}
          </Chip>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.customerId.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrapper}>
              <MaterialCommunityIcons
                name="cash-off"
                size={48}
                color={colors.textSecondary}
              />
              <Text variant="bodyMedium" style={styles.emptyText}>
                Tidak ada pelanggan ditemukan
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadMore}>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                Memuat...
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={[
          styles.list,
          data.length === 0 && styles.listEmpty,
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontWeight: "700", color: colors.textPrimary },
  headerSub: { color: colors.textSecondary, marginTop: 2 },

  searchWrapper: { paddingHorizontal: 16, marginBottom: 8 },
  searchbar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  chip: { backgroundColor: "#fff" },
  chipText: {
    color: colors.textPrimary,
    fontWeight: "500",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipSelectedText: {
    color: "#fff",
    fontWeight: "600",
  },

  list: { paddingHorizontal: 16, paddingBottom: 32 },
  listEmpty: { flexGrow: 1 },

  // Card
  card: { borderRadius: 12, elevation: 1 },
  cardDisabled: { opacity: 0.55 },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarDisabled: { backgroundColor: "#e0e0e0" },
  avatarText: { color: colors.primary, fontWeight: "700", fontSize: 18 },
  avatarTextDisabled: { color: colors.textSecondary },
  info: { flex: 1 },
  name: { fontWeight: "600", color: colors.textPrimary },
  textDisabled: { color: colors.textSecondary },
  code: { color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: "flex-end", gap: 4, flexShrink: 0 },

  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.success + "15",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  statusText: { fontSize: 13, fontWeight: "700" },

  notReadyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notReadyText: { fontSize: 11, color: colors.textSecondary },

  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: { color: colors.textSecondary },
  loadMore: { paddingVertical: 16, alignItems: "center" },
});
