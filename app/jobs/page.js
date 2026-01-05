"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Jobcard from "@/components/Jobcard"; // We will ensure this component exists next
import FilterDropDown from "@/components/FilterDropDown";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: "", category: "" });

  // Fetch jobs from your API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Build query string based on filters
        const queryParams = new URLSearchParams(filters).toString();
        const res = await fetch(`/api/getJob?${queryParams}`);
        const data = await res.json();

        if (data.success) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]); // Re-run when filters change

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      {/* Container */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Latest Job Openings
          </h1>
          
          {/* Use your Filter Component here */}
          <div className="flex gap-4">
            <select 
              className="p-2 rounded border border-gray-300"
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="New York">New York</option>
              <option value="London">London</option>
            </select>
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Jobcard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}