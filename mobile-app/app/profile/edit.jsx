import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthInput from "../../components/AuthInput";
import ConfirmModal from "../../components/ConfirmModal";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenBackground from "../../components/ScreenBackground";
import ScreenHeader from "../../components/ScreenHeader";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api.js";
import { colors, radius, shadow, spacing } from "../../constants/theme";

export default function ProfileEditScreen() {
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
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);

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
      const response = await api.users.uploadCv({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
      });
      if (response.user?.skills?.length) {
        setForm((prev) => ({ ...prev, skills: response.user.skills.join(", ") }));
      }
      await refreshUser();
      setMessage("CV uploaded — skills extracted automatically.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setCvLoading(false);
    }
  };

  const uploadAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage("Photo library permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setAvatarLoading(true);
    setMessage("");
    try {
      const asset = result.assets[0];
      await api.users.uploadAvatar({
        uri: asset.uri,
        name: asset.fileName || "avatar.jpg",
        type: asset.mimeType || "image/jpeg",
      });
      await refreshUser();
      setMessage("Profile picture updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarLoading(true);
    setMessage("");
    try {
      await api.users.removeAvatar();
      await refreshUser();
      setMessage("Profile picture removed.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setAvatarLoading(false);
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
      setMessage("Profile saved successfully.");
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
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Edit profile" onBack={() => router.back()} showLogo={false} />

        <View style={[styles.photoCard, shadow.card]}>
          <UserAvatar user={user} size={88} onPress={uploadAvatar} />
          <View style={styles.photoBody}>
            <Text style={styles.photoTitle}>Profile photo</Text>
            <Text style={styles.photoHint}>A clear photo helps employers recognize you.</Text>
            <View style={styles.photoActions}>
              <Pressable
                style={[styles.chip, avatarLoading && styles.chipDisabled]}
                onPress={uploadAvatar}
                disabled={avatarLoading}
              >
                <Ionicons name="camera-outline" size={16} color={colors.primaryDark} />
                <Text style={styles.chipText}>{avatarLoading ? "Uploading…" : "Change"}</Text>
              </Pressable>
              {user?.avatarUrl ? (
                <Pressable
                  style={[styles.chip, styles.chipDanger, avatarLoading && styles.chipDisabled]}
                  onPress={removeAvatar}
                  disabled={avatarLoading}
                >
                  <Text style={styles.chipDangerText}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <View style={[styles.card, shadow.card]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Resume / CV</Text>
          </View>
          {user?.cvFileName ? (
            <View style={styles.cvRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.cvName} numberOfLines={1}>
                {user.cvFileName}
              </Text>
            </View>
          ) : (
            <Text style={styles.cvHint}>
              Upload a PDF, DOCX, or TXT file. We&apos;ll extract skills for better job matches.
            </Text>
          )}
          <PrimaryButton
            title={cvLoading ? "Uploading…" : user?.cvFileName ? "Replace CV" : "Upload CV"}
            onPress={uploadCv}
            loading={cvLoading}
            variant="outline"
            icon="cloud-upload-outline"
          />
        </View>

        <View style={[styles.card, shadow.card]}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Personal details</Text>
          </View>

          <AuthInput
            label="Full name"
            icon="user"
            value={form.fullName}
            onChangeText={(v) => setForm({ ...form, fullName: v })}
            placeholder="Your full name"
          />
          <AuthInput
            label="Phone"
            icon="call-outline"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            placeholder="+220 …"
            keyboardType="phone-pad"
          />
          <AuthInput
            label="Location"
            icon="location-outline"
            value={form.location}
            onChangeText={(v) => setForm({ ...form, location: v })}
            placeholder="City, country"
          />
          <ProfileTextArea
            label="Bio"
            value={form.bio}
            onChangeText={(v) => setForm({ ...form, bio: v })}
            placeholder="Short summary about your experience and goals"
          />
          <ProfileTextArea
            label="Skills"
            hint="Comma-separated"
            value={form.skills}
            onChangeText={(v) => setForm({ ...form, skills: v })}
            placeholder="JavaScript, Project management, …"
          />

          {message ? (
            <View style={styles.messageBox}>
              <Ionicons
                name={message.includes("success") || message.includes("updated") || message.includes("uploaded") || message.includes("removed") || message.includes("extracted") ? "checkmark-circle" : "alert-circle"}
                size={18}
                color={colors.primary}
              />
              <Text style={styles.message}>{message}</Text>
            </View>
          ) : null}

          <PrimaryButton title="Save changes" onPress={save} loading={loading} icon="checkmark" />
        </View>

        <Pressable style={styles.logoutBtn} onPress={() => setLogoutOpen(true)}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>

        <ConfirmModal
          visible={logoutOpen}
          title="Sign out?"
          message="You will need to sign in again to access your applications and messages."
          confirmLabel="Sign out"
          cancelLabel="Stay signed in"
          destructive
          onCancel={() => setLogoutOpen(false)}
          onConfirm={async () => {
            setLogoutOpen(false);
            await handleLogout();
          }}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

function ProfileTextArea({ label, hint, value, onChangeText, placeholder }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.textAreaWrap}>
      <View style={styles.labelRow}>
        <Text style={styles.textAreaLabel}>{label}</Text>
        {hint ? <Text style={styles.textAreaHint}>{hint}</Text> : null}
      </View>
      <View style={[styles.textAreaField, focused && styles.textAreaFieldFocused]}>
        <TextInput
          style={styles.textAreaInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoBody: { flex: 1 },
  photoTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  photoHint: { color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  photoActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  chipDanger: { backgroundColor: "#FEE2E2" },
  chipDisabled: { opacity: 0.6 },
  chipText: { color: colors.primaryDark, fontWeight: "700", fontSize: 13 },
  chipDangerText: { color: colors.error, fontWeight: "700", fontSize: 13 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm },
  cardTitle: { fontSize: 17, fontWeight: "800", color: colors.ink },
  cvRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
    padding: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
  },
  cvName: { flex: 1, color: colors.primaryDark, fontWeight: "600", fontSize: 13 },
  cvHint: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.sm },
  textAreaWrap: { marginBottom: spacing.md },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  textAreaLabel: { fontSize: 14, fontWeight: "600", color: colors.ink },
  textAreaHint: { fontSize: 12, color: colors.muted },
  textAreaField: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 96,
  },
  textAreaFieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  textAreaInput: {
    fontSize: 15,
    color: colors.ink,
    minHeight: 72,
    outlineStyle: "none",
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  message: { flex: 1, color: colors.primaryDark, fontWeight: "600", lineHeight: 20 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  logoutText: { color: colors.error, fontWeight: "700", fontSize: 15 },
});
