import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenBackground from "../../components/ScreenBackground";
import ScreenHeader from "../../components/ScreenHeader";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, shadow, spacing } from "../../constants/theme";

function profileScore(user) {
  const checks = [
    user?.fullName,
    user?.email,
    user?.location,
    user?.phone,
    user?.bio,
    user?.skills?.length,
    user?.cvFileName,
    user?.avatarUrl,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function ProfileHubScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const score = useMemo(() => profileScore(user), [user]);

  const menu = [
    {
      icon: "create-outline",
      label: "Edit profile",
      hint: "Name, bio, skills & contact",
      onPress: () => router.push("/profile/edit"),
    },
    {
      icon: "briefcase-outline",
      label: "My applications",
      hint: "Track status & interviews",
      onPress: () => router.push("/(tabs)/applications"),
    },
    {
      icon: "heart-outline",
      label: "Saved jobs",
      hint: "Jobs you bookmarked",
      onPress: () => router.push("/saved-jobs"),
    },
    {
      icon: "school-outline",
      label: "Training",
      hint: "Courses & learning paths",
      onPress: () => router.push("/training"),
    },
    {
      icon: "diamond-outline",
      label: "Premium",
      hint: "Upgrade AI features",
      onPress: () => router.push("/billing"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      hint: "Alerts & updates",
      onPress: () => router.push("/notifications"),
    },
  ];

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="My Profile" onBack={() => router.back()} showLogo={false} />

        <View style={[styles.hero, shadow.card]}>
          <View style={styles.heroTop}>
            <UserAvatar user={user} size={76} onPress={() => router.push("/profile/edit")} />
            <View style={styles.heroInfo}>
              <Text style={styles.name}>{user?.fullName || "Job seeker"}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              {user?.location ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.muted} />
                  <Text style={styles.location}>{user.location}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.badge}>
            <Ionicons name="person" size={12} color={colors.primaryDark} />
            <Text style={styles.badgeText}>Job seeker</Text>
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Profile strength</Text>
              <Text style={styles.progressValue}>{score}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${score}%` }]} />
            </View>
            <Text style={styles.progressHint}>
              {score >= 80
                ? "Great — employers see a strong profile."
                : "Add your CV and skills to improve match scores."}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Skills" value={user?.skills?.length || 0} />
          <StatCard label="CV" value={user?.cvFileName ? "Added" : "Missing"} />
          <StatCard label="Experience" value={user?.experienceYears != null ? `${user.experienceYears}y` : "—"} />
        </View>

        {user?.skills?.length ? (
          <View style={[styles.skillsCard, shadow.card]}>
            <Text style={styles.sectionTitle}>Top skills</Text>
            <View style={styles.skillRow}>
              {user.skills.slice(0, 6).map((skill) => (
                <View key={skill} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.menuTitle}>Account</Text>
        <View style={[styles.menuCard, shadow.card]}>
          {menu.map((item, index) => (
            <Pressable
              key={item.label}
              style={[styles.menuRow, index < menu.length - 1 && styles.menuRowBorder]}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.menuBody}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuHint}>{item.hint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <PrimaryButton
            title="Edit profile & upload CV"
            onPress={() => router.push("/profile/edit")}
            icon="create-outline"
          />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={[styles.statCard, shadow.card]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTop: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  heroInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: "800", color: colors.ink },
  email: { color: colors.muted, marginTop: 4, fontSize: 13 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  location: { color: colors.muted, fontSize: 13 },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  badgeText: { color: colors.primaryDark, fontWeight: "700", fontSize: 12 },
  progressBlock: { marginTop: spacing.lg },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontWeight: "700", color: colors.ink },
  progressValue: { fontWeight: "800", color: colors.primary },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressHint: { color: colors.muted, fontSize: 12, marginTop: 8, lineHeight: 18 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.ink },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 4, fontWeight: "600" },
  skillsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.ink, marginBottom: 10 },
  skillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  skillText: { color: colors.primaryDark, fontWeight: "600", fontSize: 12 },
  menuTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBody: { flex: 1 },
  menuLabel: { fontWeight: "700", color: colors.ink, fontSize: 15 },
  menuHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  ctaWrap: { marginTop: spacing.md },
});
