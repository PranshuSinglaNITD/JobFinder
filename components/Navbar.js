"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LogOut, BotMessageSquareIcon } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  // 1. ALL HOOKS MUST RUN FIRST
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const {status,data:session}=useSession()

  // 2. useEffect
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

  // 3. Helper Functions
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    window.location.replace("/login"); 
  };

  const isActive = (path) => pathname === path;

  // 4. Hide Navbar Routes
  const hideNavbarRoutes = ["/login", "/register", "/signup"];
  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  // 5. Define Links based on Role
  let navLinks = [];

  if (user?.role === "recruiter") {
    navLinks = [
      { name: "Dashboard", href: "/admin" },
      { name: "Community Feed", href: '/feed' },
      { name: "Post a Job", href: "/admin/post" },
      { name: "All Applications", href: "/admin/applications" },
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

  // 6. Final Render
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex shrink-0 items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-600 dark:text-blue-500">
              Job<span className="text-slate-900 dark:text-white">Finder.</span>
            </Link>
          </div>

          {/* --- CENTER: NAV LINKS --- */}
          {/* flex-1 and justify-center pushes this block to the exact center */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
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
            
          {/* --- RIGHT: USER ACTIONS --- */}
          <div className="hidden md:flex items-center gap-5">
            {user?.role==='candidate'&&<NotificationBell/>}
            {user ? (
              // LOGGED IN VIEW
              <>
                {user?.role==='candidate'?(<Link 
                  href="/chatBot" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <BotMessageSquareIcon size={16} />
                  <span>JobBot</span>
                </Link>):<></>}

                {/* 3. Profile Avatar/Symbol */}
                <Link 
                  href={user.role === 'recruiter' ? '/recruiterProfile' : '/profile'} 
                  className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-all"
                >
                  {user.picturePath ? (
                    <img 
                      src={user.picturePath} 
                      alt="Profile" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                      {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </Link>

                {/* 4. Logout Button (Furthest Right) */}
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-red-600 
                  border border-red-200 dark:border-red-900/30 rounded-lg px-4 py-2
                  hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500
                  transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              // GUEST VIEW
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600">
                  Log in
                </Link>
                <Link href="/register" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON (Visible only on small screens) */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile Actions */}
            {user && (
              <>
                <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Signed in as <span className="font-bold text-slate-900 dark:text-white">{status==='authenticated'?session?.user?.name:user.firstName}</span>
                  </div>
                  
                  <Link 
                    href="/chatBot"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={18} /> Ask AI Assistant
                    </span>
                  </Link>

                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}