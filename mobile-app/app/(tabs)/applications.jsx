import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import MatchRing from "../../components/MatchRing";
import ScreenBackground from "../../components/ScreenBackground";
import ScreenHeader from "../../components/ScreenHeader";
import StatusBadge from "../../components/StatusBadge";
import { ApplicationRowSkeleton } from "../../components/Skeleton";
import { api } from "../../services/api.js";
import { colors, radius, shadow, spacing } from "../../constants/theme";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interviews" },
];

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.applications
      .mine()
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((a) => (a.status || "").toLowerCase() === filter);
  }, [applications, filter]);

  return (
    <ScreenBackground>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Applications" onBack={() => router.replace("/profile")} />
            <Text style={styles.subtitle}>Track status and match scores</Text>

            <View style={styles.filters}>
              {FILTERS.map((item) => (
                <Pressable
                  key={item.value}
                  style={[styles.filterChip, filter === item.value && styles.filterChipActive]}
                  onPress={() => setFilter(item.value)}
                >
                  <Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {loading ? (
              <View>
                {Array.from({ length: 4 }).map((_, i) => (
                  <ApplicationRowSkeleton key={i} />
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) =>
          loading ? null : (
            <Pressable
              style={[styles.card, shadow.card]}
              onPress={() => item.job?.id && router.push(`/job/${item.job.id}`)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardBody}>
                  <Text style={styles.jobTitle}>{item.job?.title || "Job"}</Text>
                  <Text style={styles.meta}>
                    {item.job?.employer?.companyName || item.job?.employer?.fullName} · {item.job?.location}
                  </Text>
                </View>
                {item.matchScore != null ? <MatchRing score={item.matchScore} size={48} /> : null}
              </View>
              <View style={styles.row}>
                <StatusBadge status={item.status} />
                <Text style={styles.viewLink}>View job</Text>
              </View>
            </Pressable>
          )
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="briefcase-outline"
              title={filter === "all" ? "No applications yet" : "No applications in this filter"}
              message="Browse jobs on Home and apply to roles that match your skills."
              actionLabel="Browse jobs"
              onAction={() => router.replace("/(tabs)")}
            />
          ) : null
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.muted, marginBottom: spacing.md },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.lg },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  filterTextActive: { color: "#fff" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: spacing.sm },
  cardBody: { flex: 1 },
  jobTitle: { fontSize: 18, fontWeight: "700", color: colors.ink },
  meta: { color: colors.muted, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewLink: { color: colors.primary, fontWeight: "700", fontSize: 13 },
});
