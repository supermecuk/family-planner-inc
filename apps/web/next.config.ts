import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tamagui/core",
    "@tamagui/config",
    "@tamagui/animations-react-native",
    "@tamagui/font-inter",
    "tamagui",
    "@tamagui/linear-gradient",
    "@tamagui/button",
    "@tamagui/select",
    "@tamagui/sheet",
    "@tamagui/theme-base",
    "@tamagui/stacks",
    "@tamagui/adapt",
    "@tamagui/polyfill-dev",
    "react-native-web",
  ],
};

export default nextConfig;
