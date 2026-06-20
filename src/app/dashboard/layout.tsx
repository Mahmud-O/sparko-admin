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
    <div className="flex h-screen bg-surface overflow-hidden " dir="rtl">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 overflow-hidden gap-2 md:gap-4">
        {/* Top Header navbar */}
        <Header />

        {/* Content container */}
        <main className="flex-1 overflow-y-auto  custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
