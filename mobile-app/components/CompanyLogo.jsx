import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
import { companyInitial, getCompanyLogoUri } from "../utils/companyLogo";

export default function CompanyLogo({
  name = "Company",
  logoUrl,
  avatarUrl,
  employerId,
  size = 42,
  rounded = 12,
  style,
}) {
  const [failed, setFailed] = useState(false);
  const borderRadius = rounded === "circle" ? size / 2 : rounded;
  const uri = getCompanyLogoUri({ logoUrl, avatarUrl, name, id: employerId });

  if (!failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        style={[
          styles.image,
          { width: size, height: size, borderRadius },
          style,
        ]}
        accessibilityLabel={`${name} logo`}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius },
        style,
      ]}
    >
      <Text style={[styles.fallbackText, { fontSize: size * 0.38 }]}>
        {companyInitial(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primaryLight,
  },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: { color: colors.primaryDark, fontWeight: "800" },
});
