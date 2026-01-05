"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Briefcase, MapPin, DollarSign, Building, 
  FileText, List, CheckCircle, AlertCircle, Loader2, Save 
} from "lucide-react";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    workMode: "On-site",
    jobType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: ""
  });

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          const job = data.data;
          setFormData({
            title: job.title,
            companyName: job.company.name || job.companyName, // Handle both structures if schema changed
            location: job.location,
            workMode: job.workMode,
            jobType: job.jobType,
            salaryMin: job.salary?.min || "",
            salaryMax: job.salary?.max || "",
            description: job.description,
            // Convert Array ["React", "Node"] -> String "React, Node"
            requirements: job.requirements ? job.requirements.join(", ") : "" 
          });
        } else {
            setMessage({ type: "error", text: "Job not found." });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load job details." });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchJob();
  }, [params.id]);

  // 2. Handle Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
        const payload = {
            ...formData,
            // Convert String back to Array
            requirements: formData.requirements.split(",").map(s => s.trim()).filter(s => s !== "")
        };

        const res = await fetch(`/api/jobs/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if(res.ok) {
            setMessage({ type: "success", text: "Job Updated Successfully!" });
            setTimeout(() => router.push("/admin"), 1500);
        } else {
            setMessage({ type: "error", text: data.message || "Failed to update." });
        }
    } catch(err) {
        console.error(err);
        setMessage({ type: "error", text: "Something went wrong." });
    } finally {
        setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Job</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Update the details for this job posting.
          </p>
        </div>

        {/* Alerts */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              <Briefcase className="text-blue-600" size={20} /> Job Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                <input 
                  type="text" name="title" required
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.title} onChange={handleChange}
                />
              </div>

              {/* Company Name (Locked) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Name <span className="text-xs text-blue-500 font-normal ml-1">(Locked)</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" name="companyName" required readOnly
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 cursor-not-allowed border border-slate-200 dark:border-zinc-700 outline-none"
                    value={formData.companyName} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" name="location" required
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.location} onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Type & Salary */}
          <div className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
                <select 
                  name="workMode" 
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.workMode} onChange={handleChange}
                >
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
                <select 
                  name="jobType" 
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.jobType} onChange={handleChange}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Annual Salary Range (USD)</label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-full">
                    <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="number" name="salaryMin" 
                      placeholder="Min"
                      className="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.salaryMin} onChange={handleChange}
                    />
                  </div>
                  <span className="text-slate-400">-</span>
                  <div className="relative w-full">
                    <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="number" name="salaryMax" 
                      placeholder="Max"
                      className="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.salaryMax} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Description & Requirements */}
          <div className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              <FileText className="text-blue-600" size={20} /> Description
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Description</label>
                <textarea 
                  name="description" required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={formData.description} onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Skills & Requirements</label>
                <div className="relative">
                  <List className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    name="requirements" 
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.requirements} onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Separate skills with commas.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updating}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Update Job
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}