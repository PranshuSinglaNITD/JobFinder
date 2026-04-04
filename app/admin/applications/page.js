"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle, XCircle, Clock, FileText,
    MapPin, Calendar, ExternalLink, Search, Mail, Filter, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import SalaryChart from "@/components/SalaryChart";

export default function RecruiterApplications() {
    const { data: session } = useSession()
    const [apps, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All"); // All, Applied, Shortlisted, Rejected

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

    // 3. Handle Reject
    const handleReject = async (id) => {
        if (!confirm("Are you sure you want to reject this candidate?")) return;
        try {
            await fetch("/api/applications/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId: id, status: "Rejected" })
            });
            // Update UI locally
            setApps(prev => prev.map(a => a._id === id ? { ...a, status: "Rejected" } : a));
        } catch (err) { alert("Error updating status"); }
    };

    const handleNotification = async (candidateId) => {
        try {
            // const user = JSON.parse(localStorage.getItem("user"));
            if (!candidateId) return;
            const res = await fetch('/api/notification/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: candidateId,
                    type: 'PROFILE_VIEW',
                    content: `A top recruiter from ${session?.user?.companyName} viewed your JobFinder profile`
                })
            })
            if (!res.ok) throw new Error("server error")
            const data = await res.json()
            console.log(data)
        }
        catch (err) {
            console.log(err)
        }
    }

    // 4. Handle Accept (Open Modal)
    const openAcceptModal = (app) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    // 5. Submit Acceptance
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
                alert("Candidate Shortlisted & Email Sent!");
            }
        } catch (err) { alert("Failed to send email"); }
        finally { setProcessing(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 p-8">
            <div className="max-w-7xl mx-auto">

                {!loading && apps.length > 0 && <SalaryChart applications={apps} />}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Candidate Applications</h1>
                        <p className="text-slate-500 mt-1">Manage and review candidates for your posted jobs.</p>
                    </div>

                    <div className="flex gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                        {["All", "Applied", "Shortlisted", "Rejected"].map(f => (
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
                            className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
                        >
                            {/* Candidate Info */}
                            <div className="flex items-start gap-4 flex-1">
                                <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
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
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} /> {new Date(app.createdAt).toLocaleDateString()}
                                </div>
                                {app.resumeName && (
                                    <div
                                        onClick={() => handleNotification(app.applicantId._id)}
                                        className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
                                    >
                                        <a href={app.resumeName} download={app.resumeName}> {app.resumeName}</a>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-zinc-800">

                                {app.status === "Applied" ? (
                                    <>
                                        <button
                                            onClick={() => handleReject(app._id)}
                                            className="cursor-pointer flex-1 lg:flex-none px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 font-medium transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => openAcceptModal(app)}
                                            className=" cursor-pointer flex-1 lg:flex-none px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-medium transition-colors"
                                        >
                                            Shortlist & Interview
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${app.status === "Shortlisted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {app.status === "Shortlisted" ? <CheckCircle size={16} /> : <XCircle size={16} />}
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
                                    <button onClick={() => setShowModal(false)}><X className=" cursor-pointer text-slate-400 hover:text-slate-600" /></button>
                                </div>

                                <form onSubmit={submitAccept} className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
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

                                    <button disabled={processing} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl cursor-pointer  hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
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