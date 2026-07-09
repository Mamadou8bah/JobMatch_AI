import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import PrimaryButton from "../components/PrimaryButton";
import ScreenBackground from "../components/ScreenBackground";
import ScreenHeader from "../components/ScreenHeader";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api.js";
import { colors, radius, shadow, spacing } from "../constants/theme";

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const { user, isPremium } = useAuth();
  const [courses, setCourses] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [goal, setGoal] = useState("Frontend Developer");
  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  useEffect(() => {
    api.training.list().then(setCourses).finally(() => setLoading(false));
  }, []);

  const generateRoadmap = async () => {
    setRoadmapLoading(true);
    setPremiumBlocked(false);
    try {
      const data = await api.ai.learningRoadmap(goal, user?.skills || []);
      setRoadmap(data.roadmap || data);
    } catch (err) {
      if (err.isPremiumRequired) setPremiumBlocked(true);
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Training" />

            {!isPremium ? (
              <View style={[styles.gateCard, shadow.card]}>
                <Text style={styles.sectionTitle}>Premium AI training</Text>
                <Text style={styles.sectionHint}>
                  Browse courses free. Upgrade for personalized recommendations and learning roadmaps.
                </Text>
                <PrimaryButton title="Upgrade to Premium" onPress={() => router.push("/billing")} />
              </View>
            ) : null}

            <View style={[styles.roadmapCard, shadow.card]}>
              <Text style={styles.sectionTitle}>AI Learning Roadmap</Text>
              <Text style={styles.sectionHint}>
                Generate a personalized plan based on your skills and career goal.
              </Text>
              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
                placeholder="Career goal"
                placeholderTextColor={colors.muted}
              />
              <PrimaryButton
                title="Generate roadmap"
                onPress={generateRoadmap}
                loading={roadmapLoading}
              />
              {premiumBlocked ? (
                <View style={{ marginTop: spacing.md, gap: 10 }}>
                  <Text style={styles.sectionHint}>
                    Learning roadmaps are included with Seeker Premium.
                  </Text>
                  <PrimaryButton title="Upgrade" onPress={() => router.push("/billing")} />
                </View>
              ) : null}
              {roadmap?.summary ? <Text style={styles.summary}>{roadmap.summary}</Text> : null}
              {(roadmap?.steps || []).map((step) => (
                <View key={step.step} style={styles.step}>
                  <Text style={styles.stepTitle}>
                    Step {step.step}: {step.title}
                  </Text>
                  <Text style={styles.stepMeta}>{step.duration}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Courses</Text>
            {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.courseCard, shadow.card]}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.courseMeta}>{item.provider}</Text>
            {item.description ? <Text style={styles.courseDesc}>{item.description}</Text> : null}
            {item.url ? (
              <PrimaryButton
                title="Open course"
                variant="outline"
                onPress={() => Linking.openURL(item.url)}
              />
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="school-outline"
              title="No courses available"
              message="Check back later for new training content."
              actionLabel="Go to AI Coach"
              onAction={() => router.push("/(tabs)/coach")}
            />
          ) : null
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  gateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roadmapCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.ink },
  sectionHint: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summary: { color: colors.ink, lineHeight: 21 },
  step: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  stepTitle: { fontWeight: "700", color: colors.ink },
  stepMeta: { color: colors.muted, marginTop: 2, fontSize: 12 },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseTitle: { fontWeight: "700", color: colors.ink, fontSize: 16 },
  courseMeta: { color: colors.primary, fontWeight: "600" },
  courseDesc: { color: colors.muted, lineHeight: 20 },
});
