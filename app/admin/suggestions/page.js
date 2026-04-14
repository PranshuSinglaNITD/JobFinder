"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Briefcase, Users, Sparkles, Loader2, 
  MapPin, DollarSign, ChevronRight, CheckCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecruiterDashboard() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // 1. Fetch Recruiter's Jobs on Load
  useEffect(() => { 
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs/get?recruiterId=${session.user.id}&t=${new Date().getTime()}`); 
        if (res.ok) {
          const data = await res.json();
          if(Array.isArray(data))
          setJobs(data);
        }
      } catch (error) {
        console.error("Failed to load jobs", error);
      } finally {
        setLoadingJobs(false);
      }
    };
    if (session?.user?.id) fetchJobs();
  }, [session]);

  // 2. Fetch AI Suggestions when a job is clicked
  const handleGetSuggestions = async (job) => {
    setSelectedJob(job);
    setLoadingSuggestions(true);
    setSuggestions([]);

    try {
      // Calls the Next.js API we built earlier, which routes to Python LangGraph!
      const res = await fetch(`/api/jobs/${job._id}/suggestions?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions||[]);
      }
    } catch (error) {
      console.error("Failed to load suggestions", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (!session) return <div className="p-10 text-center font-bold">Please log in as a Recruiter.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-blue-600" /> Recruiter Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Manage your active postings and review AI-curated talent.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Active Jobs List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">Your Active Postings</h2>
            
            {loadingJobs ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : jobs.length === 0 ? (
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center text-slate-500">
                You haven't posted any jobs yet.
              </div>
            ) : (
              jobs.map((job) => (
                <button
                  key={job._id}
                  onClick={() => handleGetSuggestions(job)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
                    selectedJob?._id === job._id 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md shadow-blue-500/10" 
                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
                  }`}
                >
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={14}/> {job.workMode}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* RIGHT COLUMN: AI Suggestions Panel */}
          <div className="lg:col-span-2">
            {!selectedJob ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 border-dashed">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="text-blue-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Smart Suggestions</h3>
                <p className="text-slate-500 mt-2 text-center max-w-sm">Select a job from the left to let our AI instantly rank the best candidates from our database.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
                
                {/* Panel Header */}
                <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Top Matches for {selectedJob.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">AI-powered ranking based on resume analysis.</p>
                  </div>
                  <div className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold flex items-center gap-2">
                    <Sparkles size={14} /> Gemini Ranked
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50 dark:bg-black/20">
                  {loadingSuggestions ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                      <p className="text-sm text-slate-500 animate-pulse">Analyzing resumes and calculating match scores...</p>
                    </div>
                  ) : suggestions.length === 0 ? (
                     <div className="text-center p-10 text-slate-500">No matching candidates found in the searchable database.</div>
                  ) : (
                    <AnimatePresence>
                      <div className="space-y-4">
                        {suggestions.map((cand, idx) => (
                          <motion.div 
                            key={cand.candidateId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                          >
                            {/* Score Indicator */}
                            <div className="flex flex-col items-center justify-center shrink-0">
                              <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-zinc-800" />
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${cand.matchScore}, 100`} className={`${cand.matchScore > 80 ? 'text-emerald-500' : cand.matchScore > 60 ? 'text-yellow-500' : 'text-slate-400'}`} />
                                </svg>
                                <span className="absolute text-sm font-bold">{cand.matchScore}%</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-wider">Match</span>
                            </div>

                            {/* Candidate Details */}
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                {cand.name}
                                {cand.matchScore > 85 && <CheckCircle size={16} className="text-blue-500" title="Top Tier Match"/>}
                              </h3>
                              
                              <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl relative">
                                <Sparkles className="absolute top-3 right-3 text-blue-300 dark:text-blue-800 w-4 h-4 opacity-50" />
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                  "{cand.aiSummary}"
                                </p>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                  View Full Profile <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}