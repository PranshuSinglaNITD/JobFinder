"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Briefcase, Building, Globe, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Reusable Input Component
const InputField = ({ label, icon: Icon, id, type, placeholder, value, onChange, required = false }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
        {Icon && <Icon size={18} />}
      </div>
      <input
        id={id}
        type={type}
        required={required}
        className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export default function ChooseRole() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
  });

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role to continue.", { theme: "dark" });
      return;
    }

    setLoading(true);

    try {
      // Call the sync-google API we created earlier
      const res = await fetch("/api/auth/sync-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          role: role,
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save to localStorage just like normal login
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("storage"));

        toast.success(`Welcome, ${role === "recruiter" ? "Recruiter" : "Candidate"}!`, {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
          transition: Zoom,
        });

        setTimeout(() => {
          router.replace("/");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to setup account.", { theme: "dark" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden relative">
      <ToastContainer />

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-zinc-800 z-10"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Almost there, {session?.user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            How do you plan to use JobFinder?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Candidate Card */}
            <label 
              className={`relative cursor-pointer rounded-2xl border-2 p-6 flex flex-col items-center text-center transition-all ${
                role === "candidate" 
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10" 
                  : "border-slate-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-800 bg-transparent"
              }`}
            >
              <input type="radio" name="role" value="candidate" className="sr-only" onChange={(e) => setRole(e.target.value)} />
              <div className={`p-3 rounded-full mb-4 ${role === "candidate" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"}`}>
                <UserCircle size={24} />
              </div>
              <h3 className={`font-bold text-lg mb-1 ${role === "candidate" ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>I'm a Candidate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">I want to find jobs and predict my salary.</p>
            </label>

            {/* Recruiter Card */}
            <label 
              className={`relative cursor-pointer rounded-2xl border-2 p-6 flex flex-col items-center text-center transition-all ${
                role === "recruiter" 
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md shadow-purple-500/10" 
                  : "border-slate-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-800 bg-transparent"
              }`}
            >
              <input type="radio" name="role" value="recruiter" className="sr-only" onChange={(e) => setRole(e.target.value)} />
              <div className={`p-3 rounded-full mb-4 ${role === "recruiter" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"}`}>
                <Briefcase size={24} />
              </div>
              <h3 className={`font-bold text-lg mb-1 ${role === "recruiter" ? "text-purple-700 dark:text-purple-400" : "text-slate-900 dark:text-white"}`}>I'm a Recruiter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">I want to post jobs and find top talent.</p>
            </label>
          </div>

          {/* Expanded Company Info if Recruiter */}
          <AnimatePresence>
            {role === "recruiter" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 shadow-inner">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building size={14} /> Company Profile
                  </h4>
                  <InputField label="Company Name" icon={Building} type="text" id="companyName" placeholder="Tech Corp Inc." value={formData.companyName} onChange={handleChange} required />
                  <InputField label="Website" icon={Globe} type="url" id="companyWebsite" placeholder="https://company.com" value={formData.companyWebsite} onChange={handleChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !role}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Complete Setup"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}