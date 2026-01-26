"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const syncUser = async () => {
      if (status === "authenticated") {
        // 1. Check local storage for the role they picked before signing in
        const selectedRole = localStorage.getItem("signup_role") || "candidate";
        
        try {
          // 2. Call your backend to ensure this Google user is in your MongoDB
          const res = await fetch("/api/auth/sync-google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
              role: selectedRole // Pass the role here!
            })
          });

          const data = await res.json();

          if (res.ok) {
            // 3. Save to your local app state logic (localStorage) as you do for normal login
            localStorage.setItem("user", JSON.stringify(data.user));
            // localStorage.setItem("token", ...) // NextAuth handles the token, but if you rely on your own token, send it from backend
            window.dispatchEvent(new Event("storage"));
            router.replace("/");
          } else {
            console.error("Sync failed", data);
            router.replace("/login");
          }
        } catch (error) {
          console.error("Sync error", error);
        }
      } else if (status === "unauthenticated") {
        router.replace("/login");
      }
    };

    syncUser();
  }, [status, session, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <p className="text-slate-500">Setting up your account...</p>
    </div>
  );
}