"use client";

import { styled } from "@tamagui/core";

export const Spinner = styled("div", {
  name: "Spinner",
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "2px solid transparent",
  borderTopColor: "$color",
  animation: "spin 1s linear infinite",

  variants: {
    size: {
      sm: { width: 16, height: 16 },
      md: { width: 20, height: 20 },
      lg: { width: 24, height: 24 },
    },
  },

  defaultVariants: {
    size: "md",
  },
});

export type SpinnerProps = React.ComponentProps<typeof Spinner>;
