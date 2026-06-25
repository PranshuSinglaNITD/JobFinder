import Link from "next/link";
import { MapPin, Building, Banknote, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function JobCard({ job }) {
  // Helper to format salary
  const formatSalary = (min, max) => {
    if (!min && !max) return "Not Disclosed";
    const format = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n;
    return `₹${format(min)} - ₹${format(max)}`;
  };

  // Helper to calculate expiration status
  const getJobStatus = (expiresAt, isActive) => {
    if (isActive === false) return { text: "Closed", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: XCircle };
    if (!expiresAt) return { text: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 };

    const now = new Date();
    const expiration = new Date(expiresAt);
    const hoursLeft = (expiration - now) / (1000 * 60 * 60);

    if (hoursLeft <= 0) {
        return { text: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle };
    } else if (hoursLeft <= 48) {
        return { text: "Closing Soon", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse", icon: Clock };
    } else {
        return { text: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 };
    }
  };

  const status = getJobStatus(job.expiresAt, job.isActive);
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900 group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">
              {job.jobType || "Full-time"}
            </span>
            {/* The Dynamic Expiration Badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/10 ${status.color}`}>
              <StatusIcon size={12} /> {status.text}
            </span>
          </div>
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
          className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
            status.text === "Expired" || status.text === "Closed" 
              ? "bg-slate-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600"
          }`}
          onClick={(e) => {
            if (status.text === "Expired" || status.text === "Closed") e.preventDefault();
          }}
        >
          {status.text === "Expired" || status.text === "Closed" ? "Applications Closed" : "Apply Now"}
        </Link>
      </div>
    </div>
  );
}