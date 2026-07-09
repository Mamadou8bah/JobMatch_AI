import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import ScreenBackground from "../components/ScreenBackground";
import ScreenHeader from "../components/ScreenHeader";
import SearchBar from "../components/SearchBar";
import CompanyLogo from "../components/CompanyLogo";
import { employerFromJob } from "../utils/companyLogo";
import { api } from "../services/api.js";
import { colors, radius, shadow, spacing } from "../constants/theme";

export default function CompaniesScreen() {
  const insets = useSafeAreaInsets();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const jobs = await api.jobs.list({ status: "published", search: search || undefined });
      const map = new Map();
      jobs.forEach((job) => {
        const employer = employerFromJob(job);
        if (!employer.name || employer.name === "Company") return;
        const existing = map.get(employer.id || employer.name) || {
          ...employer,
          location: job.location,
          jobCount: 0,
        };
        existing.jobCount += 1;
        if (!existing.logoUrl && employer.logoUrl) {
          existing.logoUrl = employer.logoUrl;
        }
        map.set(employer.id || employer.name, existing);
      });
      setCompanies([...map.values()].sort((a, b) => b.jobCount - a.jobCount));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenBackground>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id || item.name}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Companies" />
            <SearchBar value={search} onChangeText={setSearch} onSubmit={load} placeholder="Search companies" />
            <Text style={styles.subtitle}>Employers hiring on JobMatch AI</Text>
            {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, shadow.card]}
            onPress={() => {
              if (item.id) {
                router.push({
                  pathname: `/company/${item.id}`,
                  params: { name: item.name },
                });
              }
            }}
          >
            <View style={styles.cardRow}>
              <CompanyLogo
                name={item.name}
                logoUrl={item.logoUrl}
                employerId={item.id}
                size={48}
                rounded="circle"
              />
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.jobCount} open role{item.jobCount === 1 ? "" : "s"}
                </Text>
                {item.location ? (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color={colors.muted} />
                    <Text style={styles.location}>{item.location}</Text>
                  </View>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="business-outline"
              title="No companies found"
              message="Try a different search or check back later."
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
  subtitle: { color: colors.muted, marginBottom: spacing.lg, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800", color: colors.ink },
  meta: { color: colors.primary, fontWeight: "700", fontSize: 13, marginTop: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  location: { color: colors.muted, fontSize: 12 },
});
