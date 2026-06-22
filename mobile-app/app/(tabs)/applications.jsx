import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../../components/GlassBackground";
import { api } from "../../services/api.js";
import { colors, radius, spacing } from "../../constants/theme";

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.applications
      .mine()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  return (
    <GlassBackground>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>My Applications</Text>
            <Text style={styles.subtitle}>Track status and match scores</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{item.job?.title || "Job"}</Text>
            <Text style={styles.meta}>
              {item.job?.employer?.companyName || item.job?.employer?.fullName} · {item.job?.location}
            </Text>
            <View style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
              {item.matchScore != null && (
                <Text style={styles.score}>{Math.round(item.matchScore)}% match</Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No applications yet. Browse jobs on Home.</Text> : null
        }
      />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  jobTitle: { fontSize: 18, fontWeight: "700", color: colors.ink },
  meta: { color: colors.muted, marginTop: 4, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { color: colors.primary, fontWeight: "700", textTransform: "capitalize" },
  score: { color: colors.primary, fontWeight: "700" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
