import { Linking } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import ScreenBackground from "../components/ScreenBackground";
import ScreenHeader from "../components/ScreenHeader";
import { api } from "../services/api.js";
import { colors, radius, shadow, spacing } from "../constants/theme";

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState(null);
  const [interval, setIntervalChoice] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [planData, billingStatus] = await Promise.all([
        api.billing.plans(),
        api.billing.me(),
      ]);
      setPlans(planData);
      setStatus(billingStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const planInfo = plans?.plans?.job_seeker;
  const isPremium = status?.plan === "premium";

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setError("");
    try {
      const result = await api.billing.checkout({ interval });
      if (result.checkoutUrl) {
        await Linking.openURL(result.checkoutUrl);
      } else {
        setError("No checkout URL returned");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
        }}
      >
        <ScreenHeader title="Premium" />
        <Text style={styles.subtitle}>
          Unlock unlimited AI coach, exact match scores, and personalized career roadmaps.
        </Text>

        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={[styles.card, shadow.card]}>
          <Text style={styles.label}>Current plan</Text>
          <Text style={styles.planName}>{isPremium ? "Premium" : "Free"}</Text>
          {status?.features?.coachChat ? (
            <Text style={styles.meta}>
              Coach today:{" "}
              {status.features.coachChat.limit == null
                ? "Unlimited"
                : `${status.features.coachChat.used}/${status.features.coachChat.limit}`}
            </Text>
          ) : null}
        </View>

        {!isPremium && planInfo ? (
          <View style={[styles.card, shadow.card]}>
            <Text style={styles.sectionTitle}>{planInfo.name}</Text>
            <View style={styles.row}>
              {["monthly", "yearly"].map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.chip, interval === opt && styles.chipActive]}
                  onPress={() => setIntervalChoice(opt)}
                >
                  <Text style={[styles.chipText, interval === opt && styles.chipTextActive]}>
                    {opt === "monthly" ? `${planInfo.monthly} GMD/mo` : `${planInfo.yearly} GMD/yr`}
                  </Text>
                </Pressable>
              ))}
            </View>
            {(planInfo.features || []).map((feature) => (
              <Text key={feature} style={styles.feature}>
                • {feature}
              </Text>
            ))}
            <PrimaryButton
              title={checkoutLoading ? "Opening ModemPay…" : "Upgrade with ModemPay"}
              onPress={startCheckout}
              loading={checkoutLoading}
              disabled={!status?.modemPayConfigured}
            />
            {!status?.modemPayConfigured ? (
              <Text style={styles.meta}>ModemPay is not configured on the server yet.</Text>
            ) : null}
          </View>
        ) : null}

        <PrimaryButton title="Back to profile" variant="outline" onPress={() => router.back()} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.muted, marginBottom: spacing.lg, lineHeight: 22 },
  error: { color: colors.error, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  label: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  planName: { fontSize: 28, fontWeight: "900", color: colors.ink },
  meta: { color: colors.muted, fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.ink },
  row: { flexDirection: "row", gap: 8, marginVertical: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: "700", color: colors.ink, fontSize: 13 },
  chipTextActive: { color: "#fff" },
  feature: { color: colors.ink, lineHeight: 22 },
});
