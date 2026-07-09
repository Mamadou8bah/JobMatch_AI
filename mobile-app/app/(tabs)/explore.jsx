import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenBackground from "../../components/ScreenBackground";
import BrandLogo from "../../components/BrandLogo";
import GlassPanel from "../../components/GlassPanel";
import { ExploreCardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, radius, shadow, spacing } from "../../constants/theme";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { user, isPremium } = useAuth();
  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [premiumRecs, setPremiumRecs] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
      const allCourses = await api.training.list().catch(() => []);
      setCourses(allCourses.slice(0, 3));

      if (user?.skills?.length && isPremium) {
        try {
          const jobs = await api.jobs.list({ status: "published" });
          const requiredSkills = [...new Set(jobs.flatMap((j) => j.requiredSkills || []))];
          const gap = await api.ai.skillsGap(user.skills, requiredSkills);
          if (gap.missingSkills?.length) {
            const recs = await api.ai.trainingRecommendations(gap.missingSkills);
            setRecommendations(recs.recommendations || []);
          }
        } catch (err) {
          if (err.isPremiumRequired) setPremiumRecs(true);
        }
      } else if (user?.skills?.length && !isPremium) {
        setPremiumRecs(true);
      }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.skills, isPremium]);

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: 120,
        }}
      >
        <View style={styles.brandRow}>
          <BrandLogo size="lg" />
        </View>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Training, AI coach, and career growth</Text>

        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <ExploreCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
        <ExploreCard
          icon="business-outline"
          title="Companies"
          text="Browse employers hiring on JobMatch"
          onPress={() => router.push("/companies")}
        />
        <ExploreCard
          icon="heart-outline"
          title="Saved Jobs"
          text="View jobs you bookmarked"
          onPress={() => router.push("/saved-jobs")}
        />
        <ExploreCard
          icon="briefcase-outline"
          title="My Applications"
          text="Track application status"
          onPress={() => router.push("/(tabs)/applications")}
        />
        <ExploreCard
          icon="school-outline"
          title="Training Courses"
          text="Browse courses to close your skills gap"
          onPress={() => router.push("/training")}
        />
        <ExploreCard
          icon="sparkles-outline"
          title="AI Career Coach"
          text="Get interview and career advice"
          onPress={() => router.push("/(tabs)/coach")}
        />

        {premiumRecs ? (
          <View style={[styles.recCard, shadow.card, { marginBottom: spacing.md }]}>
            <Text style={styles.recTitle}>Personalized training</Text>
            <Text style={styles.recMeta}>
              Upgrade to Premium for AI course recommendations based on your skill gaps.
            </Text>
            <Pressable onPress={() => router.push("/billing")} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Upgrade to Premium</Text>
            </Pressable>
          </View>
        ) : null}

        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            {recommendations.slice(0, 3).map((rec, i) => (
              <Pressable
                key={i}
                style={[styles.recCard, shadow.card]}
                onPress={() => rec.url && Linking.openURL(rec.url)}
              >
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recMeta}>{rec.provider}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular courses</Text>
          {courses.map((course) => (
            <Pressable
              key={course.id}
              style={[styles.recCard, shadow.card]}
              onPress={() => course.url && Linking.openURL(course.url)}
            >
              <Text style={styles.recTitle}>{course.title}</Text>
              <Text style={styles.recMeta}>{course.provider}</Text>
            </Pressable>
          ))}
        </View>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function ExploreCard({ icon, title, text, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <GlassPanel borderRadius={radius.lg} style={styles.cardShell} contentStyle={styles.card}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardText}>{text}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { alignItems: "center", marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, marginTop: 4 },
  cardShell: { marginBottom: spacing.md },
  card: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  cardText: { color: colors.muted, marginTop: 2, fontSize: 13 },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.ink, marginBottom: spacing.sm },
  recCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.tagBg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  recTitle: { fontWeight: "700", color: colors.ink },
  recMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
});
