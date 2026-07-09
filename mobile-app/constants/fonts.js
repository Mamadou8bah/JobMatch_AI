import { StyleSheet, Text, TextInput } from "react-native";

export const fontFamilies = {
  regular: "GoogleSansFlex_400Regular",
  medium: "GoogleSansFlex_500Medium",
  semibold: "GoogleSansFlex_600SemiBold",
  bold: "GoogleSansFlex_700Bold",
  extrabold: "GoogleSansFlex_800ExtraBold",
  black: "GoogleSansFlex_900Black",
};

const ICON_FONT_HINTS = [
  "ionicons",
  "material",
  "fontawesome",
  "antdesign",
  "octicons",
  "feather",
  "entypo",
  "zocial",
  "simple-line-icons",
  "foundation",
  "evilicons",
];

function usesIconFont(style) {
  const flat = StyleSheet.flatten(style);
  if (!flat?.fontFamily) return false;
  const family = String(flat.fontFamily).toLowerCase();
  return ICON_FONT_HINTS.some((hint) => family.includes(hint));
}

export function fontFamilyForWeight(fontWeight) {
  if (fontWeight === "black" || fontWeight === "900" || fontWeight === 900) {
    return fontFamilies.black;
  }
  if (fontWeight === "800" || fontWeight === "extrabold" || fontWeight === 800) {
    return fontFamilies.extrabold;
  }
  if (fontWeight === "bold" || fontWeight === "700" || fontWeight === 700) {
    return fontFamilies.bold;
  }
  if (fontWeight === "600" || fontWeight === "semibold" || fontWeight === 600) {
    return fontFamilies.semibold;
  }
  if (fontWeight === "500" || fontWeight === "medium" || fontWeight === 500) {
    return fontFamilies.medium;
  }
  return fontFamilies.regular;
}

function mergeTextStyle(style, family) {
  if (usesIconFont(style)) return style;

  const flat = StyleSheet.flatten(style) || {};
  const next = { ...flat, fontFamily: family };
  if (family !== fontFamilies.regular) {
    delete next.fontWeight;
  }
  if (!style) return next;
  if (Array.isArray(style)) return [...style, next];
  return [style, next];
}

export function applyAppFontDefaults() {
  if (Text.__jobmatchFontPatched) return;

  const originalTextRender = Text.render;
  if (originalTextRender) {
    Text.render = function render(props, ref) {
      if (usesIconFont(props.style)) {
        return originalTextRender.call(this, props, ref);
      }
      const family = fontFamilyForWeight(StyleSheet.flatten(props.style)?.fontWeight);
      return originalTextRender.call(
        this,
        { ...props, style: mergeTextStyle(props.style, family) },
        ref,
      );
    };
  }

  const originalInputRender = TextInput.render;
  if (originalInputRender) {
    TextInput.render = function render(props, ref) {
      const family = fontFamilyForWeight(StyleSheet.flatten(props.style)?.fontWeight);
      return originalInputRender.call(
        this,
        { ...props, style: mergeTextStyle(props.style, family) },
        ref,
      );
    };
  }

  Text.__jobmatchFontPatched = true;
}
