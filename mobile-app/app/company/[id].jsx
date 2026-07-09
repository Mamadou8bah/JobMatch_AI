import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CompanyLogo from "../../components/CompanyLogo";
import GlassPanel from "../../components/GlassPanel";
import EmptyState from "../../components/EmptyState";
import JobCard from "../../components/JobCard";
import ScreenBackground from "../../components/ScreenBackground";
import ScreenHeader from "../../components/ScreenHeader";
import { JobCardSkeleton } from "../../components/Skeleton";
import { useSavedJobs } from "../../hooks/useSavedJobs";
import { api } from "../../services/api.js";
import { colors, radius, shadow, spacing } from "../../constants/theme";

export default function CompanyDetailScreen() {
  const { id, name: nameParam } = useLocalSearchParams();
  const employerId = Array.isArray(id) ? id[0] : id;
  const fallbackName = Array.isArray(nameParam) ? nameParam[0] : nameParam;
  const insets = useSafeAreaInsets();

  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const { isSaved, toggleSaved } = useSavedJobs();

  const load = useCallback(async () => {
    if (!employerId) return;
    try {
      setError("");
      const [jobList, applications] = await Promise.all([
        api.jobs.list({ status: "published", employerId }),
        api.applications.mine(),
      ]);
      const companyJobs = jobList.filter(
        (job) => job.employer?.id === employerId || job.employerId === employerId
      );
      setJobs([...companyJobs].sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0)));
      setAppliedIds(new Set(applications.map((a) => a.job?.id).filter(Boolean)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employerId]);

  useEffect(() => {
    load();
  }, [load]);

  const employer = jobs[0]?.employer;
  const companyName =
    employer?.companyName || employer?.fullName || fallbackName || "Company";
  const companyLocation = employer?.location;
  const companyDescription = employer?.companyDescription;

  return (
    <ScreenBackground>
      <FlatList
        data={loading ? [] : jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Company" onBack={() => router.back()} showLogo={false} />

            <GlassPanel borderRadius={radius.xl} contentStyle={styles.hero}>
              <CompanyLogo
                name={companyName}
                avatarUrl={employer?.avatarUrl}
                employerId={employerId}
                size={72}
                rounded="circle"
              />
              <Text style={styles.companyName}>{companyName}</Text>
              {companyLocation ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.muted} />
                  <Text style={styles.location}>{companyLocation}</Text>
                </View>
              ) : null}
              {companyDescription ? (
                <Text style={styles.description}>{companyDescription}</Text>
              ) : null}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{loading ? "—" : jobs.length}</Text>
                  <Text style={styles.statLabel}>Open roles</Text>
                </View>
              </View>
            </GlassPanel>

            <Text style={styles.sectionTitle}>Jobs at {companyName}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading ? (
              <View>
                {Array.from({ length: 3 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) =>
          loading ? null : (
            <JobCard
              job={item}
              applied={appliedIds.has(item.id)}
              saved={isSaved(item.id)}
              onToggleSave={() => toggleSaved(item.id)}
              onPress={() => router.push(`/job/${item.id}`)}
            />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="briefcase-outline"
              title="No open roles"
              message="This company has no published jobs right now. Check back later."
              actionLabel="Browse all jobs"
              onAction={() => router.replace("/(tabs)")}
            />
          ) : null
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
    marginTop: spacing.md,
    textAlign: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  location: { color: colors.muted, fontSize: 14 },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  stat: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.primaryDark },
  statLabel: { fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.md,
  },
  error: { color: colors.error, marginBottom: spacing.sm },
});
