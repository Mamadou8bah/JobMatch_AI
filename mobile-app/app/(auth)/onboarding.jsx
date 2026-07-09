import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BrandLogo from "../../components/BrandLogo";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenBackground from "../../components/ScreenBackground";
import { setItem, KEYS } from "../../services/storage";
import { colors, radius, shadow, spacing } from "../../constants/theme";

const { width } = Dimensions.get("window");

const STEPS = [
  {
    key: "match",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
    title: "Find your perfect ",
    highlight: "fit",
    titleEnd: " with AI",
    body:
      "We analyze your skills against live job listings and surface roles that fit your experience and career goals.",
  },
  {
    key: "resume",
    image:
      "https://images.unsplash.com/photo-1595153526863-0c750efd957f?auto=format&fit=crop&w=900&q=80",
    title: "Tell us about your ",
    highlight: "experience",
    titleEnd: ".",
    body:
      "Upload your resume and we extract skills, education, and work history to power smarter matches.",
  },
  {
    key: "training",
    image:
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=900&q=80",
    title: "Close skills gaps with ",
    highlight: "training",
    titleEnd: "",
    body:
      "Get course recommendations based on the jobs you want and the skills employers need in The Gambia.",
  },
  {
    key: "start",
    image:
      "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=900&q=80",
    title: "Ready to land your ",
    highlight: "dream role",
    titleEnd: "?",
    body:
      "Create your account, upload your CV, and start applying to AI-ranked opportunities in minutes.",
  },
];

function OnboardingImage({ step }) {
  return (
    <View style={[styles.imageCard, shadow.card]}>
      <Image source={{ uri: step.image }} style={styles.image} resizeMode="contain" />
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [step, setStep] = useState(0);

  const finishOnboarding = async (destination) => {
    await setItem(KEYS.onboardingComplete, "1");
    router.replace(destination);
  };

  const goNext = () => {
    if (step < STEPS.length - 1) {
      const next = step + 1;
      setStep(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
      return;
    }
    finishOnboarding("/(auth)/register");
  };

  return (
    <ScreenBackground style={{ paddingTop: insets.top + spacing.md }}>
      <View style={styles.header}>
        <BrandLogo size="xl" />
      </View>

      <FlatList
        ref={listRef}
        data={STEPS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setStep(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: width - spacing.lg * 2 }]}>
            <OnboardingImage step={item} />
            <Text style={styles.title}>
              {item.title}
              <Text style={styles.titleAccent}>{item.highlight}</Text>
              {item.titleEnd}
            </Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        style={{ marginHorizontal: spacing.lg }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PrimaryButton
          title={step === STEPS.length - 1 ? "Get Started" : "Continue"}
          onPress={goNext}
          variant="dark"
          icon="arrow-forward"
        />
        <Pressable onPress={() => finishOnboarding("/(auth)/login")} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginAccent}>Log in</Text>
          </Text>
        </Pressable>
        <View style={styles.dots}>
          {STEPS.map((item, index) => (
            <View key={item.key} style={[styles.dot, index === step && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.stepText}>Step {step + 1} of {STEPS.length}</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  slide: {
    marginRight: spacing.lg,
  },
  imageCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    aspectRatio: 4 / 3,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.ink,
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  titleAccent: { color: colors.primary },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  loginLink: { alignItems: "center" },
  loginText: { color: colors.muted, fontSize: 14 },
  loginAccent: { color: colors.primary, fontWeight: "700" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
  stepText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});
