"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, Calendar, MapPin, FileText, 
  Clock, CheckCircle, XCircle, ChevronRight, Search, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

export default function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`/api/applications/get?userId=${user._id}`);
        const data = await res.json();
        if (data.success) {
          setApplications(data.data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "shortlisted": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "rejected": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "reviewing": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
      default: return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "shortlisted": return <CheckCircle size={16} />;
      case "rejected": return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Track the status of your job applications.
            </p>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
            Total Applied: {applications.length}
          </div>
        </div>

        {/* List */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  
                  {/* Job Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Logo Placeholder */}
                    <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-400 shrink-0">
                      {app.jobId?.company?.name?.charAt(0) || "C"}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {app.jobId?.title || "Unknown Job"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {app.jobId?.company?.name || "Unknown Company"}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {app.jobId?.location}
                        </span>
                        <span className="flex items-center gap-1">
                           <Briefcase size={12} /> {app.jobId?.jobType}
                        </span>
                        <span className="flex items-center gap-1">
                           <Calendar size={12} /> Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Stats */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800">
                    
                    {/* Resume Info */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700">
                       <FileText size={14} className="text-blue-500" />
                       <div className="flex flex-col">
                         <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-30 truncate">
                           {app.resumeName || "No Resume"}
                         </span>
                         <span className="text-[10px] text-slate-400 uppercase">
                           {app.resumeFileType ? app.resumeFileType.split('/')[1] : 'FILE'}
                         </span>
                       </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </div>

                    {/* Arrow */}
                    <Link href={`/getJob/${app.jobId?._id}`} className="text-slate-300 hover:text-blue-600 transition-colors">
                      <ChevronRight size={20} />
                    </Link>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No applications yet</h2>
            <p className="text-slate-500 max-w-sm mt-2 mb-8">
              You haven't applied to any jobs yet. Start exploring opportunities now!
            </p>
            <Link 
              href="/jobs" 
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all"
            >
              Find Jobs
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}