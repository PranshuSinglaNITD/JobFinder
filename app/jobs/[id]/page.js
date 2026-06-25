"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    Briefcase, MapPin, Calendar, Users, Sparkles, 
    ChevronLeft, CheckCircle2, XCircle, FileText, IndianRupee, AlertCircle, Clock
} from "lucide-react";

export default function JobDashboard() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id;

    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("applicants"); 

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                const jobRes = await fetch(`/api/jobs/${jobId}`);
                const jobData = await jobRes.json();
                setJob(jobData.job || jobData.data || jobData); 

                const appRes = await fetch(`/api/jobs/${jobId}/applications`);
                const appData = await appRes.json();
                if (appData.success) {
                    setApplications(appData.data);
                }
            } catch (error) {
                console.error("Error fetching job dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) fetchJobData();
    }, [jobId]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-slate-500">Loading Command Center...</div>;
    }

    if (!job) {
        return <div className="flex h-screen items-center justify-center text-red-500">Job not found.</div>;
    }

    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter(a => a.status === "Shortlisted").length;
    const hiredCount = applications.filter(a => a.status === "Hired").length;

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
        <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-black sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                
                <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400">
                    <ChevronLeft size={16} /> Back to Dashboard
                </button>

                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-zinc-900 sm:p-8">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <div className="mb-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {job.employmentType || "Full-Time"}
                                </span>
                                {/* The Dynamic Expiration Badge */}
                                <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>
                                    <StatusIcon size={14} />
                                    {status.text}
                                </span>
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><MapPin size={16} /> {job.location || "Remote"}</span>
                                <span className="flex items-center gap-1">
                                    <IndianRupee size={16} /> 
                                    {typeof job.salary === 'object' && job.salary !== null 
                                        ? `${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}` 
                                        : (job.salary || "Not Specified")}
                                </span>
                                <span className="flex items-center gap-1"><Calendar size={16} /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-xl bg-slate-50 p-4 dark:bg-black/50">
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalApplicants}</p>
                                <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Applied</p>
                            </div>
                            <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{shortlistedCount}</p>
                                <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Shortlisted</p>
                            </div>
                            <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{hiredCount}</p>
                                <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Hired</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab("applicants")}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${activeTab === "applicants" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                        <Users size={18} /> Candidates ({totalApplicants})
                    </button>
                    <button 
                        onClick={() => setActiveTab("overview")}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                        <Briefcase size={18} /> Job Details
                    </button>
                    <Link 
                        href="/admin/suggestions"
                        className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                        <Sparkles size={18} /> AI Ranking Engine
                    </Link>
                </div>

                <div className="w-full">
                    {activeTab === "applicants" && (
                        <div className="grid gap-4">
                            {applications.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-800 dark:bg-zinc-900">
                                    <Users className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
                                    <p className="font-medium text-slate-500">No candidates have applied for this role yet.</p>
                                </div>
                            ) : (
                                applications.map((app) => (
                                    <div key={app._id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                                {app.applicantId?.firstName?.[0] || "U"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">
                                                    {app.applicantId?.firstName} {app.applicantId?.lastName}
                                                </h3>
                                                <p className="text-sm text-slate-500">{app.applicantId?.email}</p>
                                                <p className="mt-1 text-xs font-medium text-slate-400">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 sm:ml-auto">
                                            <span className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold ${
                                                app.status === "Hired" ? "bg-indigo-100 text-indigo-700" :
                                                app.status === "Shortlisted" ? "bg-emerald-100 text-emerald-700" :
                                                app.status === "Rejected" ? "bg-red-100 text-red-700" :
                                                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            }`}>
                                                {app.status}
                                            </span>

                                            {app.resumeName && (
                                                <a 
                                                    href={app.resumeName} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    <FileText size={16} /> Resume
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "overview" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-zinc-900 sm:p-8">
                            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Job Description</h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                                    {job.description || "No description provided."}
                                </p>
                            </div>
                            
                            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Required Skills & Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(job.skills) ? job.skills.map((skill, index) => (
                                    <span key={index} className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        {skill}
                                    </span>
                                )) : typeof job.skills === 'string' ? job.skills.split(',').map((skill, index) => (
                                    <span key={index} className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        {skill.trim()}
                                    </span>
                                )) : <span className="text-sm text-slate-500">None specified.</span>}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}