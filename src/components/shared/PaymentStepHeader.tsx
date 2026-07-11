import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../theme";
import { ListPayment } from "../../services/payment.service";

export type PaymentStep = "bill" | "pay" | "receipt";

type Props = {
  customer: ListPayment;
  step: PaymentStep;
  onBack?: () => void;
  backLabel?: string;
  showBack?: boolean;
};

const STEPS: { key: PaymentStep; label: string }[] = [
  { key: "bill", label: "Tagihan" },
  { key: "pay", label: "Bayar" },
  { key: "receipt", label: "Struk" },
];

export default function PaymentStepHeader({
  customer,
  step,
  onBack,
  backLabel = "Kembali",
  showBack = true,
}: Props) {
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <View style={styles.header}>
      {showBack && onBack && (
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={styles.backBtn}
          labelStyle={{ color: colors.primary }}
          compact
        >
          {backLabel}
        </Button>
      )}

      <View style={styles.customerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text variant="titleSmall" style={styles.customerName}>
            {customer.prefix} {customer.name}
          </Text>
          <Text variant="bodySmall" style={styles.customerCode}>
            {customer.code}
          </Text>
        </View>
      </View>

      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <View key={s.key} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                step === s.key && styles.stepDotActive,
                i < stepIndex && styles.stepDotDone,
              ]}
            >
              {i < stepIndex ? (
                <MaterialCommunityIcons name="check" size={10} color="#fff" />
              ) : (
                <Text style={styles.stepDotText}>{i + 1}</Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                step === s.key && styles.stepLabelActive,
              ]}
            >
              {s.label}
            </Text>
            {i < STEPS.length - 1 && <View style={styles.stepLine} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { alignSelf: "flex-start", marginBottom: 12 },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: colors.primary, fontWeight: "700", fontSize: 20 },
  customerName: { fontWeight: "700", color: colors.textPrimary },
  customerCode: { color: colors.textSecondary, marginTop: 2 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: { fontSize: 11, color: "#999", fontWeight: "700" },
  stepLabel: { fontSize: 11, color: colors.textSecondary },
  stepLabelActive: { color: colors.primary, fontWeight: "600" },
  stepLine: {
    width: 32,
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
  },
});
