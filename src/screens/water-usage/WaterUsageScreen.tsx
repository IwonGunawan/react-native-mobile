import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip, Searchbar, Text, Divider } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { WaterUsageStackParams } from "../../navigation/stacks/WaterUsageStack";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Village } from "../../types";
import { villageService } from "../../services/village.service";
import { useWaterUsageList } from "../../hooks/useWaterUsage";
import { WaterUsageList } from "../../services/water-usage.service";
import { colors } from "../../theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";

type Nav = NativeStackNavigationProp<WaterUsageStackParams, "WaterUsageList">;

// Village filter hooks
function useVillages() {
  const [villages, setVillages] = useState<Village[]>([]);
  useEffect(() => {
    villageService
      .getAll()
      .then(setVillages)
      .catch(() => {});
  }, []);

  return villages;
}
// End villages hooks

export default function WaterUsageScreen() {
  const navigation = useNavigation<Nav>();
  const villages = useVillages();
  const {
    data,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    totalData,
    totalPages,
    query,
    updateQuery,
    loadMore,
    refresh,
  } = useWaterUsageList();

  // defined states
  const [searchText, setSearchText] = useState<string>("");

  // debounce search - wait 500ms after user stop typing
  useEffect(() => {
    const timer = setTimeout(() => {
      updateQuery({ search: searchText || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const renderItem = ({ item }: { item: WaterUsageList }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("InputMeter", { customer: item })}
      activeOpacity={0.7}
    >
      <Card style={styles.customerCard}>
        <Card.Content style={styles.customerContent}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.customerInfo}>
            <Text variant="bodyMedium" style={styles.customerName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.customerCode}>
              {item.code}
            </Text>
          </View>

          {/* Status */}
          <View style={styles.statusWrapper}>
            {item.isChecked == 1 ? (
              <View style={[styles.statusBadge, styles.statusChecked]}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={12}
                  color={colors.success}
                />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Sudah
                </Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.statusUnchecked]}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={12}
                  color={colors.warning}
                />
                <Text style={[styles.statusText, { color: colors.warning }]}>
                  Belum
                </Text>
              </View>
            )}
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Cek Air
        </Text>
        <Text variant="bodySmall" style={styles.headerSub}>
          {totalData} customers
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Searchbar
          placeholder="Cari nama atau kode"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          elevation={0}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chips}>
        {/* a. village filter */}
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

        {/* b. separator */}
        <View style={styles.chipDivider} />

        {/* c. not checked filter */}
        {/* <Chip
          selected={query.only_unchecked}
          onPress={() => updateQuery({ only_unchecked: !query.only_unchecked })}
          style={[styles.chip, query.only_unchecked && styles.chipWarning]}
          icon="clock-outline"
        >
          Belum dicek
        </Chip> */}
      </View>

      {/* Progress Summary */}
      {/* <View style={styles.progressRow}>
        <View style={styles.progressStat}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text variant="bodySmall" style={styles.progressText}>
            {checkCount} sudah dicek
          </Text>
        </View>
        <View style={styles.progressStat}>
          <View style={[styles.dot, { backgroundColor: colors.warning }]} />
          <Text variant="bodySmall" style={styles.progressText}>
            {unCheckCount} belum dicek
          </Text>
        </View>
      </View> */}

      {/* List */}
      {error ? (
        <View style={styles.errorWrapper}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
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
                  name="clipboard-list-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {query.isUnchecked
                    ? "Semua sudah dicek "
                    : "Tidak ada customer"}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadMore}>
                <Text
                  variant="bodySmall"
                  style={{ color: colors.textSecondary }}
                >
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
      )}
    </SafeAreaView>
  );
} // end screen

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerSub: {
    marginTop: 2,
    color: colors.textSecondary,
  },

  // Search
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    fontSize: 14,
  },

  // Chips
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipWarning: {
    backgroundColor: colors.warning + "20",
  },
  chipDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
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

  // Progress
  progressRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 8,
  },
  progressStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressText: {
    color: colors.textSecondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  listEmpty: {
    flexGrow: 1,
  },

  // Customer Card
  customerCard: {
    borderRadius: 12,
    elevation: 1,
  },
  customerContent: {
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
  avatarText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 18,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: "600",
    color: colors.textPrimary,
  },
  customerCode: {
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Status
  statusWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChecked: { backgroundColor: colors.success + "15" },
  statusUnchecked: { backgroundColor: colors.warning + "15" },
  statusText: { fontSize: 12, fontWeight: "600" },

  // Error & Empty
  errorWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: colors.danger },
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
