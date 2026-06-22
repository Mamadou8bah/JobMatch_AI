import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../components/GlassBackground";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api.js";
import { colors, radius, spacing } from "../constants/theme";

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [goal, setGoal] = useState("Frontend Developer");
  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  useEffect(() => {
    api.training.list().then(setCourses).finally(() => setLoading(false));
  }, []);

  const generateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const data = await api.ai.learningRoadmap(goal, user?.skills || []);
      setRoadmap(data.roadmap || data);
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <GlassBackground>
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
            <View style={styles.header}>
              <Text style={styles.title}>Training</Text>
              <Pressable onPress={() => router.back()}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>

            <View style={styles.roadmapCard}>
              <Text style={styles.sectionTitle}>AI Learning Roadmap</Text>
              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
                placeholder="Career goal"
                placeholderTextColor={colors.muted}
              />
              <Pressable style={styles.primaryBtn} onPress={generateRoadmap} disabled={roadmapLoading}>
                {roadmapLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Generate roadmap</Text>
                )}
              </Pressable>
              {roadmap?.summary && <Text style={styles.summary}>{roadmap.summary}</Text>}
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
            {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.courseCard}
            onPress={() => item.url && Linking.openURL(item.url)}
          >
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.courseMeta}>{item.provider}</Text>
            {item.description ? <Text style={styles.courseDesc}>{item.description}</Text> : null}
          </Pressable>
        )}
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
  title: { fontSize: 24, fontWeight: "800", color: colors.ink },
  roadmapCard: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.ink, marginBottom: spacing.sm },
  input: {
    backgroundColor: "#F4F4F5",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  summary: { marginTop: spacing.md, color: colors.ink, lineHeight: 21 },
  step: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: "#F4F4F5",
    borderRadius: radius.md,
  },
  stepTitle: { fontWeight: "700", color: colors.ink },
  stepMeta: { color: colors.muted, marginTop: 2, fontSize: 12 },
  courseCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  courseTitle: { fontWeight: "700", color: colors.ink, fontSize: 16 },
  courseMeta: { color: colors.primary, marginTop: 4, fontWeight: "600" },
  courseDesc: { color: colors.muted, marginTop: 6, lineHeight: 20 },
});
