import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../../components/GlassBackground";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, radius, spacing } from "../../constants/theme";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function load() {
      const allCourses = await api.training.list();
      setCourses(allCourses.slice(0, 3));

      if (user?.skills?.length) {
        const jobs = await api.jobs.list({ status: "published" });
        const requiredSkills = [...new Set(jobs.flatMap((j) => j.requiredSkills || []))];
        const gap = await api.ai.skillsGap(user.skills, requiredSkills);
        if (gap.missingSkills?.length) {
          const recs = await api.ai.trainingRecommendations(gap.missingSkills);
          setRecommendations(recs.recommendations || []);
        }
      }
    }
    load();
  }, [user?.skills]);

  return (
    <GlassBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: 120,
        }}
      >
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Training, AI coach, and career growth</Text>

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
          onPress={() => router.push("/coach")}
        />
        <ExploreCard
          icon="map-outline"
          title="Learning Roadmap"
          text="Generate a personalized plan on the Training tab"
          onPress={() => router.push("/training")}
        />

        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            {recommendations.slice(0, 3).map((rec, i) => (
              <Pressable
                key={i}
                style={styles.recCard}
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
              style={styles.recCard}
              onPress={() => course.url && Linking.openURL(course.url)}
            >
              <Text style={styles.recTitle}>{course.title}</Text>
              <Text style={styles.recMeta}>{course.provider}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

function ExploreCard({ icon, title, text, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  cardText: { color: colors.muted, marginTop: 2, fontSize: 13 },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.ink, marginBottom: spacing.sm },
  recCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recTitle: { fontWeight: "700", color: colors.ink },
  recMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
});
