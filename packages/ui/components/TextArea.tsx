"use client";

import { styled } from "@tamagui/core";

export const TextArea = styled("textarea", {
  name: "TextArea",
  tag: "textarea",
});

export type TextAreaProps = React.ComponentProps<typeof TextArea>;
