import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { glass } from "../constants/theme";

export default function ScreenBackground({ children, style }) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={["#C8E6D4", "#D4EEF7", "#E2F5EA", "#EDF9F1"]}
        locations={[0, 0.32, 0.68, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.blob, styles.blobGreen]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobMint]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E8F4EC",
  },
  content: {
    flex: 1,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobGreen: {
    width: 220,
    height: 220,
    top: -60,
    left: -70,
    backgroundColor: glass.blobGreen,
  },
  blobBlue: {
    width: 200,
    height: 200,
    top: 140,
    right: -80,
    backgroundColor: glass.blobBlue,
  },
  blobMint: {
    width: 260,
    height: 260,
    bottom: 120,
    left: -40,
    backgroundColor: glass.blobMint,
  },
});
