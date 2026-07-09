import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassPanel from "./GlassPanel";
import { colors, radius } from "../constants/theme";

export default function AiOptimizationCard({ onPress }) {
  return (
    <Pressable onPress={onPress}>
      <GlassPanel variant="dark" borderRadius={radius.xl} style={styles.wrap} contentStyle={styles.card}>
        <Text style={styles.title}>Your resume looks strong!</Text>
        <Text style={styles.body}>
          Our AI scan shows you&apos;re in the top 5% of candidates for full stack roles this week.
        </Text>
        <View style={styles.btn}>
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.btnText}>Start AI Optimization</Text>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  card: { padding: 20 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  body: { color: "rgba(255,255,255,0.78)", lineHeight: 22, marginBottom: 16 },
  btn: {
    backgroundColor: "rgba(27, 107, 69, 0.9)",
    borderRadius: radius.pill,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  btnText: { color: "#fff", fontWeight: "800" },
});
