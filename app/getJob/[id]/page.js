"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MapPin, Building, Banknote, Clock, Globe,
    CheckCircle, Briefcase, ChevronLeft, Loader2,
    UploadCloud, FileText, X, AlertCircle, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link'

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    // Apply & Upload States
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [resume, setResume] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // 1. Fetch Job Details
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/jobs/get`);
                const data = await res.json();
                const allJobs = Array.isArray(data) ? data : (data.data || []);

                const foundJob = allJobs.find((j) => j._id === params.id);

                if (foundJob) {
                    setJob(foundJob);
                    // Check if user already applied
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user && foundJob.applicants && foundJob.applicants.includes(user._id)) {
                        setHasApplied(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching job:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchJob();
    }, [params.id]);

    // --- FILE HANDLING ANIMATIONS & LOGIC ---

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) validateAndSetFile(files[0]);
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) validateAndSetFile(files[0]);
    };

    const validateAndSetFile = (file) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            alert("Invalid file type. Please upload a PDF or Word document.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Max size is 5MB.");
            return;
        }
        setResume(file);
    };

    const removeFile = () => {
        setResume(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- APPLY HANDLER ---
    const handleApply = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            router.push("/login");
            return;
        }

        if (!resume) {
            alert("Please upload your resume to apply.");
            return;
        }

        if (!confirm(`Submit application for ${job.title}?`)) return;

        setApplying(true);
        try {
            const formData = new FormData();
            formData.append("userId", user._id);
            formData.append("jobId", job._id);
            formData.append("resume", resume);

            const res = await fetch("/api/apply", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setHasApplied(true);
                alert("Application Submitted Successfully!");
            } else {
                alert(data.message || "Failed to apply.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setApplying(false);
        }
    };

    // --- EXPIRATION LOGIC HELPER ---
    const getJobStatus = (expiresAt, isActive) => {
        if (isActive === false) return { text: "Closed", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: XCircle, disabled: true };
        if (!expiresAt) return { text: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle, disabled: false };

        const now = new Date();
        const expiration = new Date(expiresAt);
        const hoursLeft = (expiration - now) / (1000 * 60 * 60);

        if (hoursLeft <= 0) {
            return { text: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle, disabled: true };
        } else if (hoursLeft <= 48) {
            return { text: "Closing Soon", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse", icon: Clock, disabled: false };
        } else {
            return { text: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle, disabled: false };
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    if (!job) return <div className="p-10 text-center">Job not found.</div>;

    const status = getJobStatus(job.expiresAt, job.isActive);
    const StatusIcon = status.icon;
    const isClosed = status.disabled;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 pb-20">

            {/* HERO BANNER */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 sm:h-56 lg:h-64">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse"></div>
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm text-white/80 transition-all hover:-translate-x-1 hover:text-white sm:text-base">
                        <ChevronLeft className="group-hover:scale-110 transition-transform" /> Back to Jobs
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- LEFT COLUMN: JOB INFO --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Job Header Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50 sm:p-8"
                        >
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{job.title}</h1>
                                        {/* Dynamic Expiration Badge */}
                                        <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>
                                            <StatusIcon size={14} />
                                            {status.text}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        <span className="flex items-center gap-1.5"><Building size={16} className="text-blue-500" /> {job.company.name}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-red-500" /> {job.location}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={16} className="text-amber-500" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {job.company.logo ? (
                                    <img src={job.company.logo} alt="Logo" className="h-16 w-16 rounded-xl border-2 border-slate-100 object-cover shadow-sm dark:border-zinc-800 sm:h-20 sm:w-20" />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-2xl">
                                        {job.company.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Badge color="blue">{job.jobType || "Full-time"}</Badge>
                                <Badge color="green" icon={<Banknote size={14} />}>
                                    {typeof job.salary === 'object' && job.salary !== null
                                        ? `₹${job.salary.min?.toLocaleString()} - ₹${job.salary.max?.toLocaleString()}`
                                        : (job.salary || "Not Specified")}
                                </Badge>
                                <Badge color="purple">{job.workMode || "On-site"}</Badge>
                            </div>
                        </motion.div>

                        {/* Description & Requirements */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                                <Briefcase className="text-blue-600" size={20} />
                                Job Description
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {job.description}
                            </p>

                            <h2 className="text-xl font-bold mb-4 mt-10 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                                <CheckCircle className="text-emerald-600" size={20} />
                                Key Requirements
                            </h2>
                            <ul className="space-y-3">
                                {job.requirements && job.requirements.length > 0 ? (
                                    job.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 group">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 group-hover:scale-150 transition-transform"></span>
                                            <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{req}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-slate-500 italic">No specific requirements listed.</p>
                                )}
                            </ul>
                        </motion.div>
                    </div>

                    {/* --- RIGHT COLUMN: APPLY ACTIONS --- */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* APPLICATION CARD */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-blue-900/5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 lg:sticky lg:top-24"
                        >
                            <div className="mb-6">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Apply Now</h3>
                                <Link href={`/recruiter/${job.userId || job.recruiterId}`} className="inline-block">
                                    <button className="text-blue-600 font-medium hover:underline cursor-pointer">
                                        View Recruiter Profile
                                    </button>
                                </Link>
                                <p className="text-sm text-slate-500 mt-1">
                                    {isClosed ? "This job is no longer accepting applications." : "Complete the steps below to apply."}
                                </p>
                            </div>

                            {/* CONDITIONAL RENDER: CLOSED vs APPLIED vs OPEN */}
                            {isClosed ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center"
                                >
                                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500 dark:text-slate-400">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300">Applications Closed</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        The deadline for this position has passed.
                                    </p>
                                </motion.div>
                            ) : hasApplied ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
                                >
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 dark:text-green-300">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h4 className="font-bold text-green-800 dark:text-green-200">Application Sent!</h4>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                        Good luck! You can track this in your dashboard.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    {/* --- FILE UPLOAD ZONE --- */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Upload Resume <span className="text-red-500">*</span>
                                        </label>

                                        {!resume ? (
                                            <div
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`relative group cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 sm:p-8
                                            ${isDragging
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]"
                                                        : "border-slate-300 dark:border-zinc-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                                    }`}
                                            >
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileSelect}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    accept=".pdf,.doc,.docx"
                                                />
                                                <div className="flex flex-col items-center pointer-events-none">
                                                    <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? "bg-blue-100 text-blue-600" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:text-blue-500"}`}>
                                                        <UploadCloud size={24} />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">PDF or Word (Max 5MB)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3 group"
                                            >
                                                <div className="p-2 bg-white dark:bg-blue-900 rounded-lg text-blue-600 shadow-sm">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                        {resume.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {(resume.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={removeFile}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* --- SUBMIT BUTTON --- */}
                                    <button
                                        onClick={handleApply}
                                        disabled={applying || !resume}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:text-lg"
                                    >
                                        {applying ? (
                                            <>
                                                <Loader2 className="animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            "Submit Application"
                                        )}
                                    </button>

                                    <p className="text-xs text-center text-slate-400">
                                        By applying, you agree to share your profile with the recruiter.
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Company Info Box */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">About Company</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-slate-500">
                                    {job.company.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{job.company.name}</p>
                                    {job.company.website && (
                                        <a href={job.company.website} target="_blank" className="flex items-center gap-1 break-all text-xs text-blue-600 hover:underline">
                                            <Globe size={10} /> {job.company.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple Badge Helper Component
function Badge({ color, icon, children }) {
    const styles = {
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    };
    return (
        <span className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1.5 ${styles[color] || styles.blue}`}>
            {icon}
            {children}
        </span>
    );
}