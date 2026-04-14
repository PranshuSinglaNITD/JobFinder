"use client";

import { useState } from "react";
import { 
  UploadCloud, CheckCircle, AlertCircle, FileText, 
  Loader2, ScanSearch, FileCheck, ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PYTHON_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8000";

export default function ResumeMatcher() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!file || !jobDesc) return alert("Please provide both resume and job description");

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDesc", jobDesc);

    try {
      const res = await fetch(`${PYTHON_URL}/api/match-resume`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to ML Server. Is python running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 py-12 px-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-blue-900/5 mb-6 border border-slate-100 dark:border-zinc-800">
            <ScanSearch className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
                ATS Scanner
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            AI Resume <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analyzer</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Upload your resume and the job description to see how well you match. Our NLP model analyzes keyword density and semantic relevance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* --- LEFT: INPUT FORM --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 p-8"
          >
            <form onSubmit={handleCheck} className="space-y-6">
              
              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Job Description</label>
                <textarea
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-48 text-sm font-medium transition-all"
                  placeholder="Paste the full job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  required
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Upload Resume (PDF/Docx)</label>
                <div className="relative group">
                  <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                    <input type="file" onChange={handleFileChange} accept=".pdf,.docx" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" required />
                    
                    <div className="flex flex-col items-center gap-3">
                      {file ? (
                        <>
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                            <FileCheck size={24} />
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-green-600 font-medium">Ready to scan</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <UploadCloud size={24} />
                          </div>
                          <span className="text-sm font-medium text-slate-500">Click or Drag resume here</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-blue-600/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Analyze Compatibility"}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          </motion.div>

          {/* --- RIGHT: RESULTS AREA --- */}
          <div className="relative">
             {/* Gradient Background for Result */}
             <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
             
             <AnimatePresence mode="wait">
                {result ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl border border-slate-800 text-center min-h-[500px] flex flex-col justify-center items-center relative overflow-hidden"
                  >
                    {/* Animated Score Circle */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                        {/* Progress Circle */}
                        <motion.circle 
                          cx="96" cy="96" r="88" 
                          stroke="currentColor" strokeWidth="12" fill="transparent"
                          strokeLinecap="round"
                          className={`${result.score > 70 ? "text-green-500" : result.score > 40 ? "text-yellow-500" : "text-red-500"}`}
                          initial={{ strokeDasharray: 553, strokeDashoffset: 553 }}
                          animate={{ strokeDashoffset: 553 - (553 * result.score) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black">{result.score}%</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">Match Rate</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{result.score > 70 ? "Great Match!" : result.score > 40 ? "Potential Match" : "Low Match"}</h3>
                    <p className="text-slate-300 leading-relaxed max-w-sm mx-auto border-t border-slate-800 pt-6 mt-2">
                        {result.feedback}
                    </p>
                    
                    {result.score > 70 && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} delay={0.5}
                            className="mt-8 px-6 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm font-bold flex items-center gap-2"
                        >
                            <CheckCircle size={16} /> Recommended to Apply
                        </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="h-[500px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/30"
                  >
                    <div className="w-20 h-20 bg-slate-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                        <FileText size={40} className="opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Awaiting Input</h3>
                    <p className="text-sm max-w-xs text-center mt-2 opacity-70">
                        Upload your resume and a job description to generate an ATS compatibility score.
                    </p>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
