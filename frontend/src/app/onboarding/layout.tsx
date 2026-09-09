import React from "react";
import { AppWorkspaceShell } from "@/components/layout/AppWorkspaceShell";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppWorkspaceShell>{children}</AppWorkspaceShell>;
}
