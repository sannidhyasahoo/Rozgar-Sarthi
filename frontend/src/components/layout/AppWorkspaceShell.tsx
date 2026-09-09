"use client";

import React from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";

export function AppWorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fafafa] dark:bg-[#08070c] transition-colors duration-200">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <WorkspaceNavbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-[1300px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
