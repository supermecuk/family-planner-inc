import { createTamagui } from "@tamagui/core";
import { config } from "@tamagui/config/v3";
import { createInterFont } from "@tamagui/font-inter";

const interFont = createInterFont();

const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    ...config.fonts,
    heading: interFont,
    body: interFont,
  },
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      background: "#ffffff",
      backgroundHover: "#f5f5f5",
      backgroundPress: "#e5e5e5",
      color: "#000000",
      colorHover: "#1a1a1a",
      colorPress: "#333333",
      borderColor: "#e5e5e5",
      placeholderColor: "#999999",
    },
    dark: {
      ...config.themes.dark,
      background: "#000000",
      backgroundHover: "#1a1a1a",
      backgroundPress: "#333333",
      color: "#ffffff",
      colorHover: "#f5f5f5",
      colorPress: "#e5e5e5",
      borderColor: "#333333",
      placeholderColor: "#666666",
    },
  },
  tokens: {
    ...config.tokens,
    space: {
      ...config.tokens.space,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    size: {
      ...config.tokens.size,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    radius: {
      ...config.tokens.radius,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    },
  },
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}
