import Link from "next/link";
import { MapPin, Building, Banknote, Clock } from "lucide-react";

export default function JobCard({ job }) {
  // Helper to format salary (e.g. $50k - $80k)
  const formatSalary = (min, max) => {
    if (!min && !max) return "Not Disclosed";
    const format = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n;
    return `₹${format(min)} - ₹${format(max)}`;
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900 group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">
            {job.jobType || "Full-time"}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={12} />
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
           <Building size={14} />
           <span>{job.company?.name || "Anonymous Company"}</span>
        </div>
        
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 dark:bg-zinc-800">
            <MapPin size={12} /> {job.location}
          </span>
          <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <Banknote size={12} /> {formatSalary(job.salary?.min, job.salary?.max)}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <Link 
          href={`/getJob/${job._id}`} 
          className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
}