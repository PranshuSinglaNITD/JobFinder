"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Briefcase, Lock, Camera, Save,
  MapPin, Globe, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function RecruiterProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general"); // general | company | security
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State for user data
  const [formData, setFormData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    occupation: "",
    picturePath: "",
    // Company specific
    companyName: "",
    companyWebsite: "",
    companyDescription: "",
    // Password specific
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // 1. Load User Data
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(stored);
    setFormData(prev => ({
      ...prev,
      ...user,
      companyName: user.company?.name || "",
      companyWebsite: user.company?.website || "",
      companyDescription: user.company?.description || "",
    }));
  }, [router]);

  // 2. Handle Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Handle Avatar File (Simulation)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // This gives you a permanent string representation of the image
        setFormData(prev => ({ ...prev, picturePath: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Save General/Company Info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        userId: formData._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        location: formData.location,
        occupation: formData.occupation,
        picturePath: formData.picturePath, // Pass the URL/Path
        company: {
          name: formData.companyName,
          website: formData.companyWebsite,
          description: formData.companyDescription
        }
      };

      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        // Update Local Storage
        localStorage.setItem("user", JSON.stringify(data.user));
        // Update Navbar (force refresh event)
        window.dispatchEvent(new Event("storage"));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  // 5. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData._id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to change password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-8 px-4 font-sans text-slate-900 dark:text-slate-200 sm:py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
            {[
              { id: "general", label: "General", icon: User },
              { id: "company", label: "Company Info", icon: Briefcase },
              { id: "security", label: "Security", icon: Lock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all lg:w-full ${activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">

            {/* Notification Banner */}
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                  }`}
              >
                {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 md:p-8">

              {/* --- GENERAL TAB --- */}
              {activeTab === "general" && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-md">
                        {formData.picturePath ? (
                          <img src={formData.picturePath} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-slate-400">
                            {formData.firstName?.[0] || "U"}
                          </span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-500 shadow-lg transition-transform hover:scale-110">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{formData.firstName} {formData.lastName}</h3>
                      <p className="text-sm text-slate-500">{formData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Job Title</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="text" name="occupation" placeholder="e.g. Senior Recruiter" value={formData.occupation} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="text" name="location" placeholder="e.g. New York, USA" value={formData.location} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-stretch pt-4 sm:justify-end">
                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50 hover:bg-blue-500 sm:w-auto">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* --- COMPANY TAB --- */}
              {activeTab === "company" && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input type="url" name="companyWebsite" placeholder="https://example.com" value={formData.companyWebsite} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea rows={4} name="companyDescription" placeholder="Tell us about your company..." value={formData.companyDescription} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                  </div>
                  <div className="flex justify-stretch pt-4 sm:justify-end">
                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50 hover:bg-blue-500 sm:w-auto">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Company Info
                    </button>
                  </div>
                </form>
              )}

              {/* --- SECURITY TAB --- */}
              {activeTab === "security" && (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Current Password</label>
                    <input type="password" name="currentPassword" required value={formData.currentPassword} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">New Password</label>
                      <input type="password" name="newPassword" required value={formData.newPassword} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                      <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-stretch pt-4 sm:justify-end">
                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-red-600/20 disabled:opacity-50 hover:bg-red-500 sm:w-auto">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                      Update Password
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
