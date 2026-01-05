"use client";

import React, { useEffect, useState } from 'react';
import RecruiterStats from '@/components/SalaryChart'; // Use the component we made
import { Loader2, Download, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      try {
        // Reuse the recruiter API we built
        const res = await fetch(`/api/recruiter/applications?recruiterId=${user._id}`);
        const data = await res.json();
        if (data.success) {
          setApplications(data.data);
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. CSV Export Function
  const downloadCSV = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      window.open(`/api/recruiter/export?recruiterId=${user._id}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-black">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-8 font-sans text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <TrendingUp className="text-blue-600" /> 
              Analytics Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Real-time insights into your hiring pipeline and job performance.
            </p>
          </div>
          
          {/* Action Button */}
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Download size={18} /> Export Report
          </button>
        </div>

        {/* 3. The Visual Analytics Component */}
        {applications.length > 0 ? (
           <RecruiterStats applications={applications} />
        ) : (
           <div className="bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center border border-slate-200 dark:border-zinc-800">
              <p className="text-slate-400">No application data available to analyze yet.</p>
           </div>
        )}

      </div>
    </div>
  );
}

export default Analytics;