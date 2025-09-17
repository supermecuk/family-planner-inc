"use client";

import { TamaguiProvider } from "@repo/ui";
import tamaguiConfig from "../../tamagui.config";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      {children}
    </TamaguiProvider>
  );
}
