import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassBackground from "../../components/GlassBackground";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, radius, spacing } from "../../constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    skills: (user?.skills || []).join(", "),
  });
  const [loading, setLoading] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [parsedSkills, setParsedSkills] = useState(null);

  const uploadCv = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setCvLoading(true);
    setMessage("");
    try {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
      };
      const response = await api.users.uploadCv(file);
      setParsedSkills(response.parsed?.skills || []);
      if (response.user?.skills?.length) {
        setForm((prev) => ({ ...prev, skills: response.user.skills.join(", ") }));
      }
      await refreshUser();
      const addedCount = response.addedSkills?.length ?? 0;
      setMessage(
        addedCount > 0
          ? `CV uploaded — ${addedCount} skill${addedCount === 1 ? "" : "s"} added to your profile`
          : "CV uploaded and skills extracted",
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setCvLoading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    setMessage("");
    try {
      await api.users.updateMe({
        fullName: form.fullName,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
      });
      const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      if (skills.length) await api.users.updateSkills(skills);
      await refreshUser();
      setMessage("Profile updated");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <GlassBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: 120,
        }}
      >
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>CV Upload</Text>
          {user?.cvFileName ? (
            <Text style={styles.cvName}>Current: {user.cvFileName}</Text>
          ) : (
            <Text style={styles.cvHint}>Upload a PDF, DOCX, or TXT resume for AI skills extraction.</Text>
          )}
          <Pressable style={styles.secondaryBtn} onPress={uploadCv} disabled={cvLoading}>
            {cvLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.secondaryBtnText}>Upload CV</Text>
            )}
          </Pressable>
          {parsedSkills?.length ? (
            <Text style={styles.parsed}>Extracted: {parsedSkills.join(", ")}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Field label="Full name" value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} />
          <Field label="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
          <Field label="Location" value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} />
          <Field label="Bio" value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} multiline />
          <Field label="Skills" value={form.skills} onChangeText={(v) => setForm({ ...form, skills: v })} />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable style={styles.primaryBtn} onPress={save} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save profile</Text>}
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </GlassBackground>
  );
}

function Field({ label, value, onChangeText, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  field: { marginBottom: spacing.md },
  label: { color: colors.muted, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#F4F4F5",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  message: { color: colors.primary, marginBottom: spacing.sm, fontWeight: "600" },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  sectionLabel: { fontWeight: "700", color: colors.ink, marginBottom: 8 },
  cvName: { color: colors.muted, marginBottom: 8 },
  cvHint: { color: colors.muted, marginBottom: 12, fontSize: 14 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: "700" },
  parsed: { color: colors.primary, fontSize: 13, marginTop: 8 },
  logoutBtn: {
    marginTop: spacing.lg,
    alignItems: "center",
    padding: spacing.md,
  },
  logoutText: { color: colors.error, fontWeight: "700" },
});
