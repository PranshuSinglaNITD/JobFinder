"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle, XCircle, Calendar, X, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import SalaryChart from "@/components/SalaryChart";

export default function RecruiterApplications() {
    const { data: session } = useSession();
    const [apps, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All"); // All, Applied, Shortlisted, Hired, Rejected

    // Modal State
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [interviewData, setInterviewData] = useState({ date: "", time: "", mode: "Online", location: "", message: "" });
    const [processing, setProcessing] = useState(false);

    // 1. Fetch Data
    useEffect(() => {
        const fetchApps = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return;
            try {
                const res = await fetch(`/api/recruiter/applications?recruiterId=${user._id}`);
                const data = await res.json();
                if (data.success) {
                    setApps(data.data);
                    setFilteredApps(data.data);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchApps();
    }, []);

    // 2. Filter Logic
    useEffect(() => {
        if (filter === "All") setFilteredApps(apps);
        else setFilteredApps(apps.filter(app => app.status === filter));
    }, [filter, apps]);

    // 3. Dynamic Notification Sender
    const triggerNotification = async (candidateId, type, content) => {
        try {
            if (!candidateId) return;
            const res = await fetch('/api/notification/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: candidateId,
                    type: type,
                    content: content
                })
            });
            if (!res.ok) throw new Error("Server error sending notification");
        } catch (err) {
            console.log(err);
        }
    };

    // 4. Handle Reject
    const handleReject = async (id) => {
        if (!confirm("Are you sure you want to reject this candidate?")) return;
        try {
            await fetch("/api/applications/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId: id, status: "Rejected" })
            });
            setApps(prev => prev.map(a => a._id === id ? { ...a, status: "Rejected" } : a));
        } catch (err) { alert("Error updating status"); }
    };

    // 5. Handle Hire (NEW)
    const handleHire = async (app) => {
        if (!confirm(`Are you sure you want to hire ${app.applicantId?.firstName}? This will send an official offer email.`)) return;
        setProcessing(true);
        try {
            const res = await fetch("/api/applications/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    applicationId: app._id, 
                    status: "Hired" 
                })
            });
            
            if (res.ok) {
                // Update local UI
                setApps(prev => prev.map(a => a._id === app._id ? { ...a, status: "Hired" } : a));
                
                // Trigger In-App Notification
                triggerNotification(
                    app.applicantId._id, 
                    'APPLICATION_UPDATE', 
                    `Congratulations! You have been hired for the ${app.jobId?.title} role at ${session?.user?.companyName || "our company"}. Please check your email for the offer details!`
                );
                
                alert("Candidate Hired! Offer Email and Notification Sent.");
            }
        } catch (err) { 
            alert("Error updating status"); 
        } finally {
            setProcessing(false);
        }
    };

    // 6. Handle Accept (Open Modal)
    const openAcceptModal = (app) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    // 7. Submit Shortlist
    const submitAccept = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const res = await fetch("/api/applications/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: selectedApp._id,
                    status: "Shortlisted",
                    interviewDetails: interviewData
                })
            });
            if (res.ok) {
                setApps(prev => prev.map(a => a._id === selectedApp._id ? { ...a, status: "Shortlisted" } : a));
                setShowModal(false);
                
                // Send interview notification
                triggerNotification(
                    selectedApp.applicantId._id, 
                    'APPLICATION_UPDATE', 
                    `Good news! You've been shortlisted for an interview for ${selectedApp.jobId?.title}. Check your email for the schedule.`
                );

                alert("Candidate Shortlisted & Email Sent!");
            }
        } catch (err) { alert("Failed to send email"); }
        finally { setProcessing(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 font-sans text-slate-900 dark:bg-black dark:text-slate-100 sm:p-8">
            <div className="max-w-7xl mx-auto">

                {!loading && apps.length > 0 && <SalaryChart applications={apps} />}

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Candidate Applications</h1>
                        <p className="text-slate-500 mt-1">Manage and review candidates for your posted jobs.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
                        {/* Added "Hired" to the filter mapping array */}
                        {["All", "Applied", "Shortlisted", "Hired", "Rejected"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table/List */}
                <div className="grid gap-4">
                    {filteredApps.map((app) => (
                        <motion.div
                            layout
                            key={app._id}
                            className="flex flex-col items-start justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 lg:flex-row lg:items-center"
                        >
                            {/* Candidate Info */}
                            <div className="flex flex-1 items-start gap-3 sm:gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                    {app.applicantId?.firstName?.[0] || "U"}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{app.applicantId?.firstName} {app.applicantId?.lastName}</h3>
                                    <p className="text-slate-500 text-sm">{app.applicantId?.occupation || "Candidate"} • {app.applicantId?.location || "N/A"}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs font-medium bg-slate-100 dark:bg-zinc-800 w-fit px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                        <span className="text-blue-600">Applied for:</span> {app.jobId?.title}
                                    </div>
                                </div>
                            </div>

                            {/* Resume & Meta */}
                            <div className="flex w-full flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:gap-6 lg:w-auto lg:flex-col xl:flex-row xl:gap-8">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} /> {new Date(app.createdAt).toLocaleDateString()}
                                </div>
                                {app.resumeName && (
                                    <div
                                        onClick={() => triggerNotification(app.applicantId._id, 'PROFILE_VIEW', `A top recruiter from ${session?.user?.companyName || "a company"} viewed your JobFinder profile.`)}
                                        className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
                                    >
                                        <a href={app.resumeName} download={app.resumeName}> {app.resumeName}</a>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-2 flex w-full flex-col gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center lg:mt-0 lg:w-auto lg:border-t-0 lg:pt-0">

                                {/* Allow actions if they are Applied OR already Shortlisted */}
                                {app.status === "Applied" || app.status === "Shortlisted" ? (
                                    <>
                                        <button
                                            onClick={() => handleReject(app._id)}
                                            className="cursor-pointer flex-1 lg:flex-none px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 font-medium transition-colors"
                                        >
                                            Reject
                                        </button>
                                        
                                        {/* Only show Shortlist if they are fresh applicants */}
                                        {app.status === "Applied" && (
                                            <button
                                                onClick={() => openAcceptModal(app)}
                                                className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-medium transition-colors"
                                            >
                                                Interview
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleHire(app)}
                                            disabled={processing}
                                            className="cursor-pointer flex-1 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 font-medium transition-colors disabled:opacity-50"
                                        >
                                            Hire
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 
                                        ${app.status === "Hired" ? "bg-indigo-100 text-indigo-700" : 
                                          app.status === "Shortlisted" ? "bg-green-100 text-green-700" : 
                                          "bg-red-100 text-red-700"
                                        }`}>
                                        {app.status === "Hired" ? <Award size={16} /> : 
                                         app.status === "Shortlisted" ? <CheckCircle size={16} /> : 
                                         <XCircle size={16} />}
                                        {app.status}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {filteredApps.length === 0 && (
                        <div className="text-center py-20 text-slate-400">No applications found.</div>
                    )}
                </div>

                {/* --- INTERVIEW MODAL --- */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                    <h3 className="font-bold text-lg">Schedule Interview</h3>
                                    <button onClick={() => setShowModal(false)}><X className="cursor-pointer text-slate-400 hover:text-slate-600" /></button>
                                </div>

                                <form onSubmit={submitAccept} className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Date</label>
                                            <input required type="date" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-transparent"
                                                onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Time</label>
                                            <input required type="time" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-transparent"
                                                onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Interview Mode</label>
                                        <select className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-transparent"
                                            onChange={(e) => setInterviewData({ ...interviewData, mode: e.target.value })}
                                        >
                                            <option value="Online">Online (Google Meet/Zoom)</option>
                                            <option value="In-Person">In-Person (Office)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Link / Address</label>
                                        <input required type="text" placeholder={interviewData.mode === 'Online' ? "Paste meeting link here..." : "Office address..."}
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-transparent"
                                            onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Message to Candidate</label>
                                        <textarea rows="3" placeholder="Any specific instructions..." className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-transparent resize-none"
                                            onChange={(e) => setInterviewData({ ...interviewData, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button disabled={processing} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl cursor-pointer hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                        {processing ? "Sending Email..." : "Confirm & Send Invite"}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}