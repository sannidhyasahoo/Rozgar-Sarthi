import React from "react";
import { AppWorkspaceShell } from "@/components/layout/AppWorkspaceShell";

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppWorkspaceShell>{children}</AppWorkspaceShell>;
}
