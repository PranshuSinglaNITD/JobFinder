"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, MapPin, Globe, Linkedin, Briefcase, Twitter, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RecruiterProfile() {
    const params = useParams(); 
    const recruiterId = params.id;
    
    const [recruiter, setRecruiter] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/recruiters/${recruiterId}`);
                const data = await res.json();
                if (data.success) {
                    setRecruiter(data.recruiter);
                    setJobs(data.jobs);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (recruiterId) fetchProfile();
    }, [recruiterId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!recruiter) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-red-500 font-bold text-xl">
                Recruiter not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Profile Header Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden"
                >
                    {/* Decorative Background Banner */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center mt-12">
                        {/* Avatar */}
                        <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-zinc-900 overflow-hidden">
                            {recruiter.picturePath ? (
                                <img src={recruiter.picturePath} alt="Profile" className="object-cover w-full h-full" />
                            ) : (
                                recruiter.firstName?.[0] || "R"
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{recruiter.firstName} {recruiter.lastName}</h1>
                            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-4 flex items-center gap-2">
                                <Building2 size={18} />
                                {recruiter.occupation || "Technical Recruiter"} @ {recruiter.company?.name || "A Top Company"}
                            </p>
                            
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                {recruiter.company?.description || "We are actively hiring top talent. Check out our open roles below!"}
                            </p>

                            {/* Social & Website Links */}
                            <div className="flex flex-wrap gap-4 mt-6">
                                {recruiter.company?.website && (
                                    <a href={recruiter.company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition font-medium">
                                        <Globe size={16} /> Company Website
                                    </a>
                                )}
                                {recruiter.socialLinks?.linkedin && (
                                    <a href={recruiter.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition font-medium">
                                        <Linkedin size={16} /> LinkedIn
                                    </a>
                                )}
                                {recruiter.socialLinks?.twitter && (
                                    <a href={recruiter.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition font-medium">
                                        <Twitter size={16} /> Twitter
                                    </a>
                                )}
                                {recruiter.socialLinks?.portfolio && (
                                    <a href={recruiter.socialLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition font-medium">
                                        <LinkIcon size={16} /> Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Open Roles Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Briefcase className="text-blue-600" /> Open Roles at {recruiter.company?.name || "this company"}
                    </h2>

                    <div className="grid gap-4">
                        {jobs.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center text-slate-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800">
                                <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-medium">No active jobs posted right now.</p>
                                <p className="text-sm mt-1 opacity-70">Check back later for new opportunities.</p>
                            </div>
                        ) : (
                            jobs.map((job, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                                    key={job._id} 
                                    className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                >
                                    <div>
                                        <h3 className="font-bold text-xl">{job.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-3 font-medium">
                                            <span className="flex items-center gap-1.5"><MapPin size={16}/> {job.location}</span>
                                            <span className="flex items-center gap-1.5"><Building2 size={16}/> {job.type || "Full-Time"}</span>
                                            {job.salary && <span className="text-green-600 dark:text-green-400 font-semibold">{job.salary}</span>}
                                        </div>
                                    </div>
                                    <Link href={`/jobs/${job._id}`} className="w-full md:w-auto text-center px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity rounded-xl font-bold text-sm shadow-md">
                                        View Job
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}