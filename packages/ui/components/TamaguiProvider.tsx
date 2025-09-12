"use client";

import React from "react";
import { TamaguiProvider as TamaguiCoreProvider } from "@tamagui/core";
import { TamaguiConfig } from "@tamagui/core";

interface TamaguiProviderProps {
  config: TamaguiConfig;
  children: React.ReactNode;
}

export const TamaguiProvider = ({ config, children }: TamaguiProviderProps) => {
  return <TamaguiCoreProvider config={config}>{children}</TamaguiCoreProvider>;
};
