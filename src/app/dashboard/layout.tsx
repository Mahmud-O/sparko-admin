"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrate } = useAuthStore();

  // Hydrate user auth state from cookies on load
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden p-2 md:p-4 gap-2 md:gap-4" dir="rtl">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col overflow-hidden gap-2 md:gap-4">
        {/* Top Header navbar */}
        <Header />

        {/* Content container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
