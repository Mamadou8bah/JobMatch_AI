import { Pressable, StyleSheet, Text } from "react-native";
import CompanyLogo from "./CompanyLogo";
import GlassPanel from "./GlassPanel";
import { colors, radius } from "../constants/theme";

export default function FeaturedCompanyCard({ name, logoUrl, employerId, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <GlassPanel borderRadius={radius.lg} style={styles.wrap} contentStyle={styles.card}>
        <CompanyLogo
          name={name}
          logoUrl={logoUrl}
          employerId={employerId}
          size={40}
          rounded="circle"
        />
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 108,
    height: 108,
    marginRight: 12,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  name: { fontSize: 12, fontWeight: "700", color: colors.ink, textAlign: "center", marginTop: 8 },
});
