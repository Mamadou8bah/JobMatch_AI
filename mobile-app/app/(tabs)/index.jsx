import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../../components/GlassBackground";
import GlassSurface from "../../components/GlassSurface";
import JobCard from "../../components/JobCard";
import SearchBar from "../../components/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, spacing } from "../../constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [jobList, applications] = await Promise.all([
        api.jobs.list({ search: search || undefined, status: "published" }),
        api.applications.mine(),
      ]);
      setJobs(
        [...jobList].sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
      );
      setAppliedIds(new Set(applications.map((a) => a.job?.id).filter(Boolean)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const initials = (user?.fullName || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <GlassBackground>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 120,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <GlassSurface style={styles.greetingPill} intensity={55}>
                  <View style={styles.greetingInner}>
                    <Text style={styles.greeting}>Hey 👋</Text>
                  </View>
                </GlassSurface>
              </View>
              <Pressable style={styles.bellBtn} onPress={() => router.push("/notifications")}>
                <Ionicons name="notifications-outline" size={20} color="#fff" />
              </Pressable>
            </View>

            <Text style={styles.eyebrow}>Dream Job Found</Text>
            <Text style={styles.headline}>Hey, Discover{"\n"}New Job Matches</Text>

            <View style={styles.searchWrap}>
              <SearchBar value={search} onChangeText={setSearch} onSubmit={load} />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading ? <ActivityIndicator style={{ marginVertical: 24 }} color={colors.primary} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            applied={appliedIds.has(item.id)}
            saved={savedIds.has(item.id)}
            onToggleSave={() =>
              setSavedIds((prev) => {
                const next = new Set(prev);
                next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                return next;
              })
            }
            onPress={() => router.push(`/job/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No jobs found. Try another search.</Text> : null
        }
      />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700" },
  greetingPill: { borderRadius: 999 },
  greetingInner: { paddingHorizontal: 16, paddingVertical: 10 },
  greeting: { color: colors.ink, fontWeight: "600" },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  eyebrow: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600", marginBottom: 6 },
  headline: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    marginBottom: spacing.lg,
  },
  searchWrap: { marginBottom: spacing.lg },
  error: { color: colors.error, marginBottom: spacing.sm },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
