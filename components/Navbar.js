"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LogOut,
  BotMessageSquareIcon,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const { status, data: session } = useSession();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    window.location.replace("/login");
  };

  const isActive = (path) => pathname === path;
  const profileHref = user?.role === "recruiter" ? "/recruiterProfile" : "/profile";

  const hideNavbarRoutes = ["/login", "/register", "/signup"];
  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  let navLinks = [];

  if (user?.role === "recruiter") {
    navLinks = [
      { name: "Dashboard", href: "/admin" },
      { name: "Community Feed", href: "/feed" },
      { name: "Post a Job", href: "/admin/post" },
      { name: "All Applications", href: "/admin/applications" },
      {name:'Suggestions',href:'/admin/suggestions'}
    ];
  } else if (user?.role === "candidate") {
    navLinks = [
      { name: "Analyse Resume", href: "/resume-matcher" },
      { name: "Community Buzz", href: "/feedsCandidate" },
      { name: "Salary Prediction", href: "/model" },
      { name: "My Applications", href: "/myApplications" },
    ];
  } else {
    navLinks = [
      { name: "Find Jobs", href: "/login" },
      { name: "For Recruiters", href: "/login" },
    ];
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-black/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex shrink-0 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-blue-600 dark:text-blue-500 sm:text-2xl">
              Job<span className="text-slate-900 dark:text-white">Finder.</span>
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-5 md:flex">
            {user?.role === "candidate" && <NotificationBell />}
            {user ? (
              <>
                {user?.role === "candidate" && (
                  <Link
                    href="/chatBot"
                    className="flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-500 hover:to-indigo-500 active:scale-95"
                  >
                    <BotMessageSquareIcon size={16} />
                    <span>JobBot</span>
                  </Link>
                )}

                <Link
                  href={profileHref}
                  className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-slate-200 transition-all hover:border-blue-500 dark:border-slate-700"
                >
                  {user.picturePath ? (
                    <img src={user.picturePath} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-semibold text-slate-900 hover:text-blue-600 dark:text-white">
                  Log in
                </Link>
                <Link href="/register" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-black md:hidden">
          <div className="max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-4 pb-5 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="my-2 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="px-3 py-2 text-sm text-slate-500">
                  Signed in as{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {status === "authenticated" ? session?.user?.name : user.firstName}
                  </span>
                </div>

                <Link
                  href={profileHref}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon size={18} /> View Profile
                  </span>
                </Link>

                {user?.role === "candidate" && (
                  <Link
                    href="/chatBot"
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={18} /> Ask AI Assistant
                    </span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="my-2 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Link
                  href="/login"
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
