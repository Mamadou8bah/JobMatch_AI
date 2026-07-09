import { Ionicons } from "@expo/vector-icons";
import { router, useGlobalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AiOptimizationCard from "../../components/AiOptimizationCard";
import AppHeader from "../../components/AppHeader";
import FeaturedCompanyCard from "../../components/FeaturedCompanyCard";
import JobCard from "../../components/JobCard";
import ScreenBackground from "../../components/ScreenBackground";
import SearchBar from "../../components/SearchBar";
import { CompanyRowSkeleton, JobCardSkeleton } from "../../components/Skeleton";
import { useSavedJobs } from "../../hooks/useSavedJobs";
import { api } from "../../services/api.js";
import { employerFromJob } from "../../utils/companyLogo";
import { colors, spacing } from "../../constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { search: initialSearch } = useGlobalSearchParams();
  const [search, setSearch] = useState(typeof initialSearch === "string" ? initialSearch : "");
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const { isSaved, toggleSaved } = useSavedJobs();

  const load = useCallback(async () => {
    try {
      setError("");
      const [jobList, applications] = await Promise.all([
        api.jobs.list({ search: search || undefined, status: "published" }),
        api.applications.mine(),
      ]);
      setJobs([...jobList].sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0)));
      setAppliedIds(new Set(applications.map((a) => a.job?.id).filter(Boolean)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    if (typeof initialSearch === "string" && initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const companies = [...new Map(
    jobs.map((job) => {
      const employer = employerFromJob(job);
      return [employer.id || employer.name, employer];
    })
  ).values()].slice(0, 8);

  return (
    <ScreenBackground>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 110,
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
            <AppHeader onNotifications={() => router.push("/notifications")} />

            <SearchBar value={search} onChangeText={setSearch} onSubmit={load} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Companies</Text>
              <Pressable onPress={() => router.push("/companies")}>
                <Text style={styles.sectionLink}>View all</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyRow}>
              {loading
                ? <CompanyRowSkeleton />
                : companies.map((company) => (
                <FeaturedCompanyCard
                  key={company.id || company.name}
                  name={company.name}
                  logoUrl={company.logoUrl}
                  employerId={company.id}
                  onPress={() => {
                    if (company.id) {
                      router.push({
                        pathname: `/company/${company.id}`,
                        params: { name: company.name },
                      });
                    }
                  }}
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>

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
        renderItem={({ item, index }) =>
          loading ? null : (
            <View>
              <JobCard
                job={item}
                applied={appliedIds.has(item.id)}
                saved={isSaved(item.id)}
                onToggleSave={() => toggleSaved(item.id)}
                onPress={() => router.push(`/job/${item.id}`)}
              />
              {index === 0 ? (
                <AiOptimizationCard onPress={() => router.push("/(tabs)/coach")} />
              ) : null}
            </View>
          )
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No jobs found. Try another search.</Text> : null
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.ink },
  sectionLink: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  companyRow: { marginBottom: spacing.lg },
  error: { color: colors.error, marginBottom: spacing.sm },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
