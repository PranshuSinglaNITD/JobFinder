"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Lock, Camera, Save, 
  MapPin, Loader2, CheckCircle, AlertCircle,
  Shield, Briefcase, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants for smooth tab switching
const contentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export default function CandidateProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    occupation: "", // Job Title
    picturePath: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // 1. Load User Data
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const user = JSON.parse(stored);
    
    // Security redirect: If a recruiter tries to access this page, send them away
    if (user.role === 'recruiter') {
        router.replace("/admin/profile");
        return;
    }

    setFormData(prev => ({
      ...prev,
      ...user
    }));
  }, [router]);

  // 2. Handle Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Handle Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, picturePath: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Save Profile (General Info)
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
        picturePath: formData.picturePath,
        // No company data needed for candidates
      };

      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
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

  const tabs = [
    { id: "general", label: "My Profile", icon: User },
    { id: "security", label: "Login & Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-12 px-4 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-extrabold tracking-tight">
            Profile <span className="text-blue-600">Settings</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Update your personal details and security.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <nav className="space-y-2 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 relative overflow-hidden group ${
                    activeTab === tab.id 
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"
                    />
                  )}
                  <tab.icon size={20} className={activeTab === tab.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Form */}
          <div className="lg:col-span-9">
            
            <AnimatePresence mode="wait">
              {message.text && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
                    message.type === "success" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                      : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                  }`}
                >
                  {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span className="font-medium text-sm">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 p-6 md:p-10 relative overflow-hidden">
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <AnimatePresence mode="wait">
                
                {/* --- GENERAL TAB (Personal Info) --- */}
                {activeTab === "general" && (
                  <motion.form 
                    key="general"
                    variants={contentVariants}
                    initial="hidden" animate="visible" exit="exit"
                    onSubmit={handleSaveProfile} 
                    className="space-y-8 relative z-10"
                  >
                    {/* Header with Avatar */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100 dark:border-zinc-800">
                      <div className="relative group">
                        <div className="h-28 w-28 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-zinc-900 shadow-lg">
                          {formData.picturePath ? (
                            <img src={formData.picturePath} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl font-bold text-slate-300 dark:text-slate-600">
                               {formData.firstName?.[0] || "U"}
                            </span>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full cursor-pointer shadow-lg transition-transform transform group-hover:scale-110">
                          <Camera size={16} />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                      </div>
                      <div className="text-center sm:text-left pt-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.firstName} {formData.lastName}</h3>
                        <p className="text-slate-500 text-sm mb-2">{formData.email}</p>
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 text-xs font-medium uppercase tracking-wide">
                          Candidate
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                        <input 
                            type="text" name="firstName" required
                            value={formData.firstName} onChange={handleChange} 
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                        <input 
                            type="text" name="lastName" required
                            value={formData.lastName} onChange={handleChange} 
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="group md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="email" name="email" readOnly disabled
                                value={formData.email} 
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-500 cursor-not-allowed" 
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 ml-1">Email cannot be changed.</p>
                      </div>
                      
                      {/* Optional but nice for candidates */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Job Title</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input type="text" name="occupation" placeholder="e.g. Software Engineer" value={formData.occupation} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input type="text" name="location" placeholder="e.g. New York, USA" value={formData.location} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70 transition-all active:scale-95">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Profile
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === "security" && (
                  <motion.form 
                    key="security"
                    variants={contentVariants}
                    initial="hidden" animate="visible" exit="exit"
                    onSubmit={handleChangePassword} 
                    className="space-y-8 relative z-10"
                  >
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl mb-6">
                        <h4 className="text-amber-800 dark:text-amber-500 font-semibold flex items-center gap-2 text-sm">
                            <Lock size={16} /> Password Security
                        </h4>
                        <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                            Ensure your account stays safe. Use a strong password with symbols.
                        </p>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                        <input type="password" name="currentPassword" required value={formData.currentPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                        <input type="password" name="newPassword" required value={formData.newPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                        <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-70 transition-all active:scale-95">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                        Update Password
                        </button>
                    </div>
                  </motion.form>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}