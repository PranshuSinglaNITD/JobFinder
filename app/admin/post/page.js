"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer,toast, Bounce } from "react-toastify";
import {
  Briefcase, MapPin, IndianRupee, Building,
  FileText, List, CheckCircle, AlertCircle, Loader2, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    companyLogo: "", // Optional URL
    location: "",
    workMode: "On-site",
    jobType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: ""
  });

  // 1. Load User & Protect Route (LOGIC PRESERVED)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.company && parsedUser.company.name) {
        setFormData(prev => ({ ...prev, companyName: parsedUser.company.name }));
      }

      if (parsedUser.role !== "recruiter") {
        router.push("/feed");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        ...formData,
        recruiterId: user._id,
        requirements: formData.requirements.split(",").map(s => s.trim()).filter(s => s !== "")
      };

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Job posted successfully!" });
        setTimeout(() => router.push("/admin"), 2000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to post job." });
      }

    } catch (error) {
      console.error("Post Job Error:", error);
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const handleLala = () => {
    toast.success('Job posted successfully!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  }

  const isCompanyLocked = !!user.company?.name;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <h1 className="text-4xl font-extrabold tracking-tight">
            Post a <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">New Job</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Create a detailed job listing to attract the best talent for your team.
          </p>
        </motion.div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                }`}
            >
              {message.type === "success" ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* Section 1: Basic Info */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 transition-all hover:border-blue-200 dark:hover:border-blue-900/30">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Briefcase size={22} />
              </div>
              Job Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Job Title</label>
                <input
                  type="text" name="title" required
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  value={formData.title} onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text" name="companyName" required
                    className={`w-full pl-11 pr-5 py-3 rounded-xl border outline-none transition-all
                      ${isCompanyLocked
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-500 cursor-not-allowed border-slate-200 dark:border-zinc-700"
                        : "bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      }
                    `}
                    value={formData.companyName} onChange={handleChange}
                    readOnly={isCompanyLocked} // Prevent Editing if locked
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text" name="location" required
                    placeholder="e.g. New York, USA or Remote"
                    className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={formData.location} onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Type & Salary */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 transition-all hover:border-blue-200 dark:hover:border-blue-900/30">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <IndianRupee size={22} />
              </div>
              Terms & Compensation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Work Mode</label>
                <div className="relative">
                  <select
                    name="workMode"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer"
                    value={formData.workMode} onChange={handleChange}
                  >
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Job Type</label>
                <div className="relative">
                  <select
                    name="jobType"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer"
                    value={formData.jobType} onChange={handleChange}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Annual Salary Range (INR)</label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-full">
                    <IndianRupee className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="number" name="salaryMin"
                      placeholder="Min"
                      className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      value={formData.salaryMin} onChange={handleChange}
                    />
                  </div>
                  <span className="text-slate-400 font-medium">-</span>
                  <div className="relative w-full">
                    <IndianRupee className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="number" name="salaryMax"
                      placeholder="Max"
                      className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      value={formData.salaryMax} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Section 3: Description & Requirements */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 transition-all hover:border-blue-200 dark:hover:border-blue-900/30">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                <FileText size={22} />
              </div>
              Detailed Description
            </h2>

            <div className="space-y-8">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Job Description</label>
                <textarea
                  name="description" required
                  rows={6}
                  placeholder="Describe the role, responsibilities, and what you are looking for..."
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
                  value={formData.description} onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 transition-colors">Skills & Requirements</label>
                <div className="relative">
                  <List className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <textarea
                    name="requirements"
                    rows={2}
                    placeholder="e.g. React, Node.js, AWS, Team Player (Separate by commas)"
                    className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={formData.requirements} onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">Tip: Separate skills with commas for better visibility.</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3.5 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleLala}
              disabled={loading}
              className="px-10 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Publish Job Post"}
            </button>
          </motion.div>

        </motion.form>
      </div>
    </div>
  );
}