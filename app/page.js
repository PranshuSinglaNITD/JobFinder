"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowRight, Users, Briefcase, BarChart3, Search, 
  CheckCircle, Sparkles, TrendingUp, ChevronRight,
  Book
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  // 1. Check User Role on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  // 2. CONDITIONAL RENDERING
  if (user?.role === "recruiter") {
    return <RecruiterHome user={user} />;
  }

  // Default: Show Candidate/Guest Home
  return <CandidateHome />;
}

/* =========================================
   1. RECRUITER LANDING PAGE (Real Data)
   ========================================= */
function RecruiterHome({ user }) {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    loading: true
  });

  // Fetch Real Stats from DB
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch jobs for this recruiter to calculate stats
        const res = await fetch(`/api/jobs/get?recruiterId=${user._id}&t=${new Date().getTime()}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Calculate Active Jobs
          const active = data.filter(job => job.status === "Active").length;
          
          // Calculate Total Applicants across all jobs
          // Assuming job.applicants is an array of IDs
          const applicants = data.reduce((acc, job) => acc + (job.applicants?.length || 0), 0);

          setStats({
            activeJobs: active,
            totalApplicants: applicants,
            loading: false
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user?._id) {
      fetchStats();
    }
  }, [user]);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-200">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/10 to-transparent -z-10"></div>

      <section className="relative pt-24 pb-12 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            
            {/* Left: Welcome Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 uppercase tracking-wider">
                <Sparkles size={12} /> Recruiter Dashboard
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-4 text-slate-900 dark:text-white">
                {greeting}, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {user.firstName || user.name}
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                Your hiring command center is ready. You have <strong className="text-slate-900 dark:text-white">{stats.activeJobs} active jobs</strong> looking for talent today.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/admin/post" 
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:scale-105 transition-all active:scale-95"
                >
                  <Briefcase size={18} />
                  Post a Job
                </Link>
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-6 py-3.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 transition-all"
                >
                  <BarChart3 size={18} />
                  View Analytics
                </Link>
              </div>
            </div>

            {/* Right: Live Stats Cards */}
            <div className="grid grid-cols-2 gap-4 relative">
              {/* Blur Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-3xl -z-10 rounded-full"></div>

              {/* Card 1: Applicants */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-white dark:border-zinc-800"
              >
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                  <Users size={24} />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Applicants</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.loading ? "..." : stats.totalApplicants}
                  </p>
                  <span className="mb-1 text-xs font-bold text-green-500 flex items-center bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-md">
                    <TrendingUp size={10} className="mr-1" /> Live
                  </span>
                </div>
              </motion.div>
              
              {/* Card 2: Active Jobs */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-white dark:border-zinc-800 mt-8"
              >
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                  <Briefcase size={24} />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Openings</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.loading ? "..." : stats.activeJobs}
                </p>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="py-16 px-6 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={20} /> Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/recruiterProfile" className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg">
              <div className="absolute top-6 right-6 p-2 bg-white dark:bg-zinc-800 rounded-full text-slate-400 group-hover:text-blue-500 transition-colors">
                <ChevronRight size={16} />
              </div>
              <div className="mb-4 inline-flex p-3 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold">Update Profile</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Ensure your company branding is up to date to attract the best candidates.</p>
            </Link>

            <Link href="/feed" className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-lg">
              <div className="absolute top-6 right-6 p-2 bg-white dark:bg-zinc-800 rounded-full text-slate-400 group-hover:text-indigo-500 transition-colors">
                <ChevronRight size={16} />
              </div>
              <div className="mb-4 inline-flex p-3 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <Users className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-lg font-bold">Community Feed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Engage with talent, share updates, and see what candidates are talking about.</p>
            </Link>

            <Link href="/admin/applications" className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg">
               <div className="absolute top-6 right-6 p-2 bg-white dark:bg-zinc-800 rounded-full text-slate-400 group-hover:text-purple-500 transition-colors">
                <ChevronRight size={16} />
              </div>
               <div className="mb-4 inline-flex p-3 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-bold">Manage Applications</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Review resumes, shortlist candidates, and schedule interviews.</p>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}


/* =========================================
   2. CANDIDATE / GUEST LANDING PAGE
   ========================================= */
function CandidateHome() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-200 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-28 pb-40 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            #1 Platform for Tech Jobs
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Dream Job.</span> <br />
            <span className="text-slate-900 dark:text-white">Know Your Worth.</span>
          </h1>
          
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The intelligent platform that matches you with top tech roles, tracks your applications, and predicts your market salary using AI.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/getJob" 
              className="rounded-full bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 transition-all active:scale-95"
            >
              Browse Openings
            </Link>
            <Link 
              href="/profile" 
              className="rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-8 py-4 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 transition-all active:scale-95 flex items-center gap-2"
            >
              <BarChart3 size={18} className="text-purple-500" /> Check Salary Prediction
            </Link>
          </div>
        </motion.div>
      </section>

      {/* --- STATS STRIP --- */}
      <div className="border-y border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-x divide-slate-200 dark:divide-zinc-800/50">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Active Jobs</dt>
              <dd className="mt-2 text-4xl font-black text-slate-900 dark:text-white">1,200+</dd>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Companies Hiring</dt>
              <dd className="mt-2 text-4xl font-black text-slate-900 dark:text-white">300+</dd>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg Salary Hike</dt>
              <dd className="mt-2 text-4xl font-black text-slate-900 dark:text-white">45%</dd>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section className="py-32 px-6 mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Why choose JobFinder?
          </h2>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
            We don't just list jobs; we engineer your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Link href={'/resume-matcher'}className="group p-10 rounded-[2.5rem] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Book />
            </div>
              <h3 className="text-2xl font-bold mb-3">Analyse Resume</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload your resume and the job description to see how well you match. Our NLP model analyzes keyword density and semantic relevance.
            </p>
            
          </Link>

          {/* Feature 2: ML Model Highlight */}
          <Link href={'/model'} className="group p-10 rounded-[2.5rem] bg-slate-900 dark:bg-zinc-800 text-white border border-slate-800 dark:border-zinc-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              AI Powered
            </div>
            <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 text-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <BarChart3 />
            </div>
            <h3 className="text-2xl font-bold mb-3">Salary Predictor</h3>
            <p className="text-slate-300 leading-relaxed">
              Stop guessing. Enter your experience and skills to get a precise, AI-driven prediction of your market value.
            </p>
          </Link>

          {/* Feature 3 */}
          <div className="group p-10 rounded-[2.5rem] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-500 transition-colors">
            <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform">
               <ArrowRight />
            </div>
            <h3 className="text-2xl font-bold mb-3">Instant Apply</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Apply with one click. Get instant email confirmations and track your application status in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* --- RECRUITER CTA --- */}
      <section className="py-24 px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Hiring? Find your next star.
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Access our database of qualified candidates, post jobs for free, and streamline your entire hiring process.
          </p>
          <Link 
            href="/register?role=recruiter" 
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-bold text-black shadow-xl hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
          >
            Start Hiring Now
          </Link>
        </div>
      </section>

    </div>
  );
}