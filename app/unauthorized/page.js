import Link from "next/link";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-black">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <Lock className="h-10 w-10 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
          Access Denied
        </h1>
        
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          Hold up! You need to be logged into a verified account to view this page, apply for jobs, or access the dashboard.
        </p>
        
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link 
            href="/login" 
            className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800 active:scale-95"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}