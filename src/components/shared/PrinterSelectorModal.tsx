import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Text, Button, IconButton } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  printerService,
  PrinterDevice,
} from "../../services/receipt/printer.service";
import { colors } from "../../theme";

interface Props {
  visible: boolean;
  onSelect: (device: PrinterDevice) => void;
  onClose: () => void;
}

export default function PrinterSelectorModal({
  visible,
  onSelect,
  onClose,
}: Props) {
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    scanDevices();
  }, [visible]);

  const scanDevices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await printerService.getPairedDevices();
      setDevices(list);
      if (list.length === 0) {
        setError(
          "Tidak ada perangkat Bluetooth yang di-pair.\nPair printer di Settings → Bluetooth terlebih dahulu.",
        );
      }
    } catch (err: any) {
      setError(err.message ?? "Gagal scan perangkat Bluetooth");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text variant="titleMedium" style={styles.title}>
                Pilih Printer
              </Text>
              <Text variant="bodySmall" style={styles.sub}>
                Perangkat Bluetooth yang sudah di-pair
              </Text>
            </View>
            <IconButton icon="close" onPress={onClose} />
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text variant="bodySmall" style={styles.loadingText}>
                Mencari perangkat...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <MaterialCommunityIcons
                name="bluetooth-off"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.errorText}>{error}</Text>
              <Button
                mode="outlined"
                onPress={scanDevices}
                style={{ marginTop: 12 }}
              >
                Coba Lagi
              </Button>
            </View>
          ) : (
            <FlatList
              data={devices}
              keyExtractor={(item) => item.innerMacAddress}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.deviceIcon}>
                    <MaterialCommunityIcons
                      name="printer-wireless"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text variant="bodyMedium" style={styles.deviceName}>
                      {item.deviceName}
                    </Text>
                    <Text variant="bodySmall" style={styles.deviceMac}>
                      {item.innerMacAddress}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: { fontWeight: "700", color: colors.textPrimary },
  sub: { color: colors.textSecondary, marginTop: 2 },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  loadingText: { color: colors.textSecondary },
  errorText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
  },

  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontWeight: "600", color: colors.textPrimary },
  deviceMac: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  separator: { height: 1, backgroundColor: "#f5f5f5", marginLeft: 72 },
});
