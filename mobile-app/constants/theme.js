export const colors = {
  background: "#F4F8F6",
  surface: "rgba(255, 255, 255, 0.55)",
  primary: "#1B6B45",
  primaryDark: "#14532D",
  primaryLight: "rgba(216, 243, 220, 0.65)",
  accent: "#52B788",
  ink: "#0F172A",
  muted: "#64748B",
  border: "rgba(255, 255, 255, 0.45)",
  tagBg: "rgba(216, 243, 220, 0.75)",
  tagText: "#1B4332",
  white: "#FFFFFF",
  black: "#0A0A0A",
  error: "#DC2626",
  warning: "#F59E0B",
  notification: "#EF4444",
  cardDark: "rgba(15, 23, 42, 0.72)",
  chatBg: "#ECE5DD",
  chatBubbleOut: "#D9FDD3",
  chatBubbleIn: "#FFFFFF",
  chatHeader: "#1B6B45",
};

export const glass = {
  tint: "rgba(255, 255, 255, 0.38)",
  tintStrong: "rgba(255, 255, 255, 0.58)",
  tintDark: "rgba(15, 23, 42, 0.55)",
  border: "rgba(255, 255, 255, 0.72)",
  borderSoft: "rgba(255, 255, 255, 0.35)",
  highlight: "rgba(255, 255, 255, 0.95)",
  shadow: "rgba(27, 107, 69, 0.18)",
  blobGreen: "rgba(82, 183, 136, 0.14)",
  blobBlue: "rgba(56, 189, 248, 0.1)",
  blobMint: "rgba(27, 107, 69, 0.1)",
  activeTab: "rgba(27, 107, 69, 0.88)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  soft: {
    shadowColor: glass.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 8,
  },
};

export { fontFamilies } from "./fonts";
