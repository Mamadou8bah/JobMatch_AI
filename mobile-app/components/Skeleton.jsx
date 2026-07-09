import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radius, shadow, spacing } from "../constants/theme";

function useShimmer() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return translateX;
}

export function SkeletonBox({ width, height, style, borderRadius = radius.md }) {
  const translateX = useShimmer();

  return (
    <View style={[styles.box, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmerWrap, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
}

export function JobCardSkeleton() {
  return (
    <View style={[styles.jobCard, shadow.card]}>
      <View style={styles.jobTop}>
        <SkeletonBox width={42} height={42} borderRadius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox width="70%" height={14} />
          <SkeletonBox width="45%" height={12} />
        </View>
        <SkeletonBox width={54} height={54} borderRadius={27} />
      </View>
      <SkeletonBox width="90%" height={12} style={{ marginTop: spacing.md }} />
      <SkeletonBox width="60%" height={12} style={{ marginTop: 8 }} />
      <View style={styles.tagRow}>
        <SkeletonBox width={72} height={28} borderRadius={radius.pill} />
        <SkeletonBox width={88} height={28} borderRadius={radius.pill} />
      </View>
    </View>
  );
}

export function CompanyRowSkeleton({ count = 4 }) {
  return (
    <View style={styles.companyRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.companyItem}>
          <SkeletonBox width={56} height={56} borderRadius={16} />
          <SkeletonBox width={56} height={10} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

export function ThreadRowSkeleton() {
  return (
    <View style={styles.threadRow}>
      <SkeletonBox width={52} height={52} borderRadius={26} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={styles.threadMeta}>
          <SkeletonBox width="55%" height={14} />
          <SkeletonBox width={40} height={10} />
        </View>
        <SkeletonBox width="80%" height={12} />
      </View>
    </View>
  );
}

export function ExploreCardSkeleton() {
  return (
    <View style={[styles.exploreCard, shadow.card]}>
      <SkeletonBox width={44} height={44} borderRadius={14} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox width="50%" height={14} />
        <SkeletonBox width="75%" height={12} />
      </View>
    </View>
  );
}

export function ApplicationRowSkeleton() {
  return (
    <View style={[styles.applicationRow, shadow.card]}>
      <View style={styles.applicationTop}>
        <SkeletonBox width={48} height={48} borderRadius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox width="65%" height={14} />
          <SkeletonBox width="40%" height={12} />
        </View>
        <SkeletonBox width={44} height={44} borderRadius={22} />
      </View>
      <SkeletonBox width={90} height={26} borderRadius={radius.pill} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#E8EBE9",
    overflow: "hidden",
  },
  shimmerWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    flex: 1,
    width: 120,
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  tagRow: { flexDirection: "row", gap: 8, marginTop: spacing.md },
  companyRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  companyItem: { alignItems: "center" },
  threadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  threadMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  exploreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applicationRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applicationTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
});
