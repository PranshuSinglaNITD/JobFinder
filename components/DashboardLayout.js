"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navigation from "./Navbar";
import Top from "./Top";
import Footer from "./Footer";

export default function DashboardLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Do not render the dashboard layout on auth pages
  const hideRoutes = ["/login", "/register", "/signup"];
  if (hideRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black">
      
      {/* 1. The Sidebar */}
      <Navigation
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 2. The Main Content Wrapper (This physically resizes!) */}
      <div 
        className={`flex min-h-screen w-full flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* 3. The Top Header */}
        <Top setIsMobileOpen={setIsMobileOpen} />

        {/* 4. Your Page Data (flex-1 forces it to push the footer down) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* 5. The Footer (Moved INSIDE the column wrapper!) */}
        <Footer />
      </div>
      
    </div>
  );
}