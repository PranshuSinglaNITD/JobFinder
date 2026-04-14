"use client";

import { useState, useEffect } from "react";
import JobCard from '@/components/Jobcard'
import { Search, Filter, Briefcase } from "lucide-react";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Remote, On-site

  // 1. Fetch Jobs on Mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs/get");
        const data = await res.json();
        
        // Handle API returning { data: [] } or just []
        const jobList = Array.isArray(data) ? data : (data.data || []);
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 2. Filter Logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(search.toLowerCase()) || 
      job.company?.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "All" || job.workMode === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100">
      
      {/* --- HERO / SEARCH SECTION --- */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">
            Find your next <span className="text-blue-600">ADVENTURE</span>.
          </h1>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto font-bold">
            Browse thousands of job openings from top companies and startups.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-base placeholder-slate-400 shadow-sm transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-black sm:rounded-full sm:py-4 sm:text-lg"
              placeholder="Search by job title, company, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["All", "Remote", "On-site", "Hybrid"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  filterType === type
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- JOBS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-500">Finding opportunities...</p>
           </div>
        ) : filteredJobs.length > 0 ? (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <h2 className="text-lg font-semibold flex items-center gap-2">
                 <Briefcase size={20} className="text-blue-600" />
                 {filteredJobs.length} Jobs Found
               </h2>
               <div className="text-sm text-slate-500">
                 Showing results for <span className="font-medium text-slate-900 dark:text-white">&quot;{filterType}&quot;</span>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No jobs found</h3>
            <p className="mt-1 text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
