import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { VillageStat } from "../../hooks/useHomeData";
import { colors } from "../../theme";
import { Button, ProgressBar, Text } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Props {
  visible: boolean;
  stats: VillageStat[];
  onClose: () => void;
}

export default function VillageProgressModal({
  visible,
  stats,
  onClose,
}: Props) {
  const totalAll = stats.reduce((s, v) => s + v.total, 0);
  const checkedAll = stats.reduce((s, v) => s + v.checked, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle Bar */}
          <View style={styles.handle} />
          <Text variant="titleMedium" style={styles.title}>
            Detail Progress per Wilayah
          </Text>
          <Text variant="bodySmall" style={styles.subTitle}>
            Total: {checkedAll} dari {totalAll} customer dicek
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {stats.map((s) => (
              <View key={s.village.id} style={styles.villageItem}>
                {/* header */}
                <View style={styles.villageHeader}>
                  <View style={styles.villageLeft}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color={colors.primary}
                    />
                    <Text variant="bodyMedium" style={styles.villageName}>
                      {s.village.name}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.villageCount}>
                    {s.checked / s.total}
                  </Text>
                </View>

                {/* Progress Bar */}
                <ProgressBar
                  progress={s.total > 0 ? s.checked / s.total : 0}
                  color={
                    s.percent == 100
                      ? colors.success
                      : s.percent >= 50
                        ? colors.primary
                        : colors.warning
                  }
                  style={styles.progressBar}
                />

                {/* Percent & status */}
                <View style={styles.villageFooter}>
                  <Text variant="bodySmall" style={styles.percentText}>
                    {s.percent}%
                  </Text>
                  {s.percent == 100 && (
                    <View style={styles.doneBadge}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={12}
                        color={colors.success}
                      />
                      <Text style={styles.doneText}>Selesai</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Close button */}
          <Button mode="contained" onPress={onClose} style={styles.closeBtn}>
            Tutup
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgb(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "700",
    marginBottom: 4,
  },
  subTitle: {
    color: colors.textSecondary,
    marginBottom: 20,
  },
  villageItem: {
    marginBottom: 20,
  },
  villageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  villageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  villageName: {
    fontWeight: "600",
    color: colors.textPrimary,
  },
  villageCount: {
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  villageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  percentText: {
    color: colors.textSecondary,
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  doneText: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.success,
  },
  closeBtn: {
    marginTop: 16,
  },
});
