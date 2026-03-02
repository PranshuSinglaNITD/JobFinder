"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await fetch("/api/auth/check-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });

          // SAFETY CHECK: If response is not OK, read as text to see the real error
          if (!res.ok) {
            const errorText = await res.text();
            console.error("API Error Response:", errorText);
            throw new Error(`API returned ${res.status}`);
          }

          // Safe to parse JSON now
          const data = await res.json();

          if (data.exists) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("storage"));
            router.replace("/");
          } else {
            router.replace("/choose-role");
          }
        } catch (error) {
          console.error("Verification failed:", error);
          router.replace("/login"); // Fallback to login if it breaks
        }
      } else if (status === "unauthenticated") {
        router.replace("/login");
      }
    };

    verifyUser();
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="p-4 bg-blue-50 dark:bg-zinc-900 rounded-2xl shadow-inner border border-blue-100 dark:border-zinc-800">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
          Verifying your account...
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Just a moment while we get things ready.
        </p>
      </motion.div>
    </div>
  );
}