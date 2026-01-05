"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, Users, Eye, Plus, Search, 
  MoreHorizontal, Calendar, MapPin, DollarSign, 
  TrendingUp, ArrowUpRight, Building, Edit, Trash2,
  IndianRupee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null); // Track open menu
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    views: 0
  });

  // 1. Load User & Fetch Data
  useEffect(() => {
    const validateAndLoad = async () => {
      const storedUser = localStorage.getItem("user");
      
      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      
      if (parsedUser.role !== "recruiter") {
        router.replace("/feed");
        return;
      }
      
      setUser(parsedUser);

      try {
        const res = await fetch(`/api/jobs/get?recruiterId=${parsedUser._id}&t=${new Date().getTime()}`, {
            cache: 'no-store', // Extra flag to tell browsers not to cache
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const jobsWithStats = data.map(job => ({
             ...job,
             mockApplicants: Math.floor(Math.random() * 20) 
          }));
          
          setJobs(jobsWithStats);
          
          const active = data.filter(j => j.status === "Active").length;
          const applicants = data.reduce((acc, job) => acc + (job.applicants?.length || 0), 0);
          
          setStats({
            activeJobs: active,
            totalApplicants: applicants,
            views: active * 145 + Math.floor(Math.random() * 500)
          });
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    validateAndLoad();
    const handlePageShow = (event) => {
      if (event.persisted) {
        setLoading(true);
        validateAndLoad();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);

  // 2. Menu Handlers
  const toggleMenu = (id) => {
    if (openMenuId === id) setOpenMenuId(null);
    else setOpenMenuId(id);
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
        const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
        if(res.ok) {
            setJobs(prev => prev.filter(j => j._id !== jobId));
            setOpenMenuId(null);
        } else {
            alert("Failed to delete job.");
        }
    } catch(err) {
        console.error(err);
        alert("Error deleting job.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100">
      
      {/* --- HEADER --- */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Recruiter Dashboard
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, {user?.firstName}
            </p>
          </div>
          
          <Link 
            href="/admin/post" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-95"
          >
            <Plus size={18} />
            Post New Job
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* --- STATS GRID --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <Briefcase size={24} />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <TrendingUp size={12} className="mr-1" /> +12%
                </span>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Jobs</h3>
              <p className="text-4xl font-bold mt-1">{stats.activeJobs}</p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                  <Users size={24} />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <TrendingUp size={12} className="mr-1" /> +24%
                </span>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Applicants</h3>
              <p className="text-4xl font-bold mt-1">{stats.totalApplicants}</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                  <Eye size={24} />
                </div>
                <span className="text-xs text-slate-400">Last 30 days</span>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Views</h3>
              <p className="text-4xl font-bold mt-1">{stats.views}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* --- JOB LIST SECTION --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Job Postings</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search your jobs..." 
                className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm w-64"
              />
            </div>
          </div>

          {/* CRITICAL FIX: 
            Removed 'overflow-hidden' here so the dropdown menu isn't cut off 
          */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-t-2xl">
              <div className="col-span-5">Job Details</div>
              <div className="col-span-2 text-center">Stats</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2">Date Posted</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* List */}
            {jobs.length === 0 ? (
               <div className="p-12 text-center">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Briefcase className="text-slate-400" size={32} />
                 </div>
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No jobs posted yet</h3>
                 <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">Start building your team by posting your first job opening today.</p>
                 <Link href="/admin/post" className="text-blue-600 font-semibold hover:underline">Create a Job Post</Link>
               </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                <AnimatePresence>
                  {jobs.map((job) => (
                    <motion.li 
                      key={job._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group relative"
                    >
                      {/* Job Info */}
                      <div className="col-span-5">
                        <Link href={`/jobs/${job._id}`} className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-2">
                           {job.title}
                           <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                           <span className="flex items-center gap-1"><Building size={12} /> {job.company.name}</span>
                           <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                           <span className="flex items-center gap-1"><IndianRupee size={12} /> {job.salary?.min / 1000}k-{job.salary?.max / 1000}k</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex -space-x-2">
                          {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-200 dark:bg-zinc-700"></div>)}
                          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                             +{Math.floor(Math.random() * 20)}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === "Active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${job.status === "Active" ? "bg-green-500" : "bg-slate-500"}`}></span>
                          {job.status}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-sm text-slate-500 flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>

                      {/* --- ACTIONS (FIXED DROPDOWN) --- */}
                      <div className="col-span-1 text-right relative">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(job._id);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors relative z-10 cursor-pointer"
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === job._id && (
                            <>
                                {/* Invisible Backdrop to close menu */}
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                
                                {/* The Menu */}
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-700 z-50 overflow-hidden text-left">
                                    <button 
                                        onClick={() => router.push(`/admin/edit/${job._id}`)}
                                        className="w-full px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors"
                                    >
                                        <Edit size={16} className="text-blue-500" /> Edit Job
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(job._id)}
                                        className="w-full px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete Job
                                    </button>
                                </div>
                            </>
                          )}
                      </div>

                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}