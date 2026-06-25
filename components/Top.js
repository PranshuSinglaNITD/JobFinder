"use client";

import { Menu, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useSession } from "next-auth/react";

export default function Top({ setIsMobileOpen }) {
  const { data: session } = useSession();

  // Generate a clean date string (e.g., "Wednesday, June 24")
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-black/80 sm:px-6 lg:px-8">
      
      {/* Mobile Menu Button */}
      <div className="flex items-center md:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Left Side: Global Search Bar (Desktop) */}
      <div className="hidden flex-1 items-center md:flex">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, jobs, or keywords..."
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Right Side: Date & Notifications */}
      <div className="ml-auto flex items-center gap-4 lg:gap-6">
        <div className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 lg:block">
          {today}
        </div>
        <NotificationBell />
      </div>

    </header>
  );
}