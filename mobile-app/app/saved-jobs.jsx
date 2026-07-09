import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import ScreenBackground from "../components/ScreenBackground";
import ScreenHeader from "../components/ScreenHeader";
import { useSavedJobs } from "../hooks/useSavedJobs";
import { api } from "../services/api.js";
import { colors, spacing } from "../constants/theme";

export default function SavedJobsScreen() {
  const insets = useSafeAreaInsets();
  const { savedIds, toggleSaved, isSaved } = useSavedJobs();
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allJobs, applications] = await Promise.all([
        api.jobs.list({ status: "published" }),
        api.applications.mine(),
      ]);
      setJobs(allJobs.filter((job) => savedIds.includes(job.id)));
      setAppliedIds(new Set(applications.map((a) => a.job?.id).filter(Boolean)));
    } finally {
      setLoading(false);
    }
  }, [savedIds]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenBackground>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Saved Jobs" />
            <Text style={styles.subtitle}>Jobs you bookmarked for later</Text>
            {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            applied={appliedIds.has(item.id)}
            saved={isSaved(item.id)}
            onToggleSave={() => toggleSaved(item.id)}
            onPress={() => router.push(`/job/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="heart-outline"
              title="No saved jobs yet"
              message="Tap the heart on any job card to save it here."
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
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
});
