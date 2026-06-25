"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession,signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase, FileText, Sparkles,
  FileSearch, MessageSquare, TrendingUp, Search, Building,
  LogOut, BotMessageSquareIcon, X, ChevronLeft, ChevronRight, User as UserIcon
} from "lucide-react";

export default function Navigation({ isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen }) {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const nextAuthCookies=[
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "next-auth.csrf-token",
    "authjs.session-token",
    "__Secure-authjs.session-token"
  ];

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } 
        catch (error) { setUser(null); }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const handleLogout =async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    //destry thr cookie
    document.cookie = "username=; max-age=0; path=/;";
    nextAuthCookies.forEach((cookieName)=>{
      cookieStore.delete(cookieName);
    });
    //if there is googlelogin then 
    if(status==='authenticated') await signOut({redirect:false});
    window.dispatchEvent(new Event("storage"));
    window.location.replace("/");
  };

  const isActive = (path) => pathname === path;
  const profileHref = user?.role === "recruiter" ? "/recruiterProfile" : "/profile";

  let navLinks = [];
  if (user?.role === "recruiter") {
    navLinks = [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Community Feed", href: "/feed", icon: Users },
      { name: "Post a Job", href: "/admin/post", icon: Briefcase },
      { name: "All Applications", href: "/admin/applications", icon: FileText },
      { name: "Suggestions", href: "/admin/suggestions", icon: Sparkles }
    ];
  } else if (user?.role === "candidate") {
    navLinks = [
      { name: "Analyse Resume", href: "/resume-matcher", icon: FileSearch },
      { name: "Community Buzz", href: "/feedsCandidate", icon: MessageSquare },
      { name: "Salary Prediction", href: "/model", icon: TrendingUp },
      { name: "My Applications", href: "/myApplications", icon: Briefcase },
    ];
  } else {
    navLinks = [
      { name: "Find Jobs", href: "/login", icon: Search },
      { name: "For Recruiters", href: "/login", icon: Building },
    ];
  }

  const renderLinks = () => (
    <div className="flex flex-col gap-2 px-3 py-4">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            title={!isExpanded ? link.name : ""}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
              active
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
            }`}
          >
            <Icon size={20} className="shrink-0" />
            <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${!isExpanded && "hidden md:hidden"}`}>
              {link.name}
            </span>
          </Link>
        );
      })}

      {user?.role === "candidate" && (
        <Link
          href="/chatBot"
          title={!isExpanded ? "JobBot" : ""}
          className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <BotMessageSquareIcon size={20} className="shrink-0" />
          <span className={`font-semibold whitespace-nowrap ${!isExpanded && "hidden md:hidden"}`}>
            JobBot Assistant
          </span>
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 hidden h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-black md:flex ${isExpanded ? "w-64" : "w-20"}`}>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-6 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="flex h-16 items-center px-6 border-b border-transparent">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-blue-600 dark:text-blue-500">
            {isExpanded ? <span>Job<span className="text-slate-900 dark:text-white">Finder.</span></span> : <span>J<span className="text-slate-900 dark:text-white">F.</span></span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar">
          {renderLinks()}
        </nav>

        {/* Profile Footer / Login Footer */}
        {user ? (
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            {/* ... KEEP YOUR EXISTING LOGGED-IN USER CODE HERE ... */}
            <div className={`flex items-center gap-3 ${!isExpanded && "justify-center"}`}>
              <Link href={profileHref} className="shrink-0 h-10 w-10 overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-blue-500">
                {user.picturePath ? (
                  <img src={user.picturePath} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
                  </div>
                )}
              </Link>
              
              {isExpanded && (
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {status === "authenticated" ? session?.user?.name : `${user.firstName} ${user.lastName || ""}`}
                  </span>
                  <span className="truncate text-xs text-slate-500 capitalize">{user.role}</span>
                </div>
              )}
            </div>

            {isExpanded ? (
               <button onClick={handleLogout} className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:bg-red-900/20">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <button onClick={handleLogout} title="Logout" className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            {isExpanded ? (
              <div className="flex flex-col gap-2">
                <Link href="/login" className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800">
                  Log in
                </Link>
                <Link href="/register" className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link href="/login" title="Log In" className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                  <UserIcon size={18} />
                </Link>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex w-64 max-w-[80%] flex-col bg-white dark:bg-black">
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xl font-bold text-blue-600">Job<span className="text-slate-900 dark:text-white">Finder.</span></span>
              <button onClick={() => setIsMobileOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><X size={24} /></button>
            </div>
            
            <nav className="flex-1 overflow-y-auto">{renderLinks()}</nav>

            {user && (
               <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                 <Link href={profileHref} className="flex items-center gap-3 mb-4">
                   <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                     {user.picturePath ? <img src={user.picturePath} alt="" className="w-full h-full object-cover"/> : user.firstName?.charAt(0)}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{user.firstName}</span>
                      <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                   </div>
                 </Link>
                 <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-600 dark:bg-red-900/20">
                    <LogOut size={16} /> Logout
                 </button>
               </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}