"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast,ToastContainer, Zoom } from "react-toastify";
import { Mail, Lock, User, Building, Globe, ArrowRight, Loader2, Briefcase, UserCircle, Star } from "lucide-react";
import SignInBtn from "./SignInBtn";

// --- ANIMATION VARIANTS ---
const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// --- REUSABLE INPUT COMPONENT ---
const InputField = ({ label, icon: Icon, id, type, placeholder, value, onChange, required = false }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                {Icon && <Icon size={18} />}
            </div>
            <input
                id={id}
                type={type}
                required={required}
                className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);

export default function AuthForm({ initialView = "login" }) {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            router.replace("/");
        }
    }, [router]);

    const [isLoginView, setIsLoginView] = useState(initialView === "login");
    const [role, setRole] = useState("candidate");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        companyName: "",
        companyWebsite: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // 1. LOGIN LOGIC
        if (isLoginView) {
            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.dispatchEvent(new Event("storage"));

                    if (data.user.role === "recruiter") {
                        toast.success('Login Successful, Recruiter', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                        transition: Zoom,
                    });
                        setTimeout(() => {
                            router.push("/");
                        }, 3000);
                    } else {
                        toast.success('Login Successful, Dear Candidate', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                        transition: Zoom,
                    });
                        setTimeout(() => {
                            router.push("/");
                        }, 3000);
                    }
                } else {
                    setMessage(data.message || "Login failed");
                }
            } catch (error) {
                console.error("Login Error:", error);
                setMessage("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            // 2. REGISTER LOGIC
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        role: role,
                        companyName: formData.companyName,
                        companyWebsite: formData.companyWebsite
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success('Yeah account created successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                        transition: Zoom,
                    });
                    setTimeout(() => {
                        setIsLoginView(true);
                    }, 4000);
                } else {
                    setMessage(data.message || "Registration failed.");
                }

            } catch (error) {
                console.error(error);
                setMessage("Something went wrong.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-black font-sans">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Zoom}
            />

            {/* --- LEFT SIDE: THE FORM (Clean & Focused) --- */}
            <div className="relative z-10 flex w-full flex-col justify-center bg-white px-5 pb-10 pt-28 dark:bg-zinc-950 sm:px-8 sm:pb-12 sm:pt-32 lg:w-1/2 lg:p-24">

                {/* Logo */}
                <div className="absolute top-6 left-5 sm:left-8 lg:left-12">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-blue-600 dark:text-white">
                        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                            <Briefcase size={20} fill="currentColor" />
                        </div>
                        JobFinder.
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLoginView ? "login" : "signup"}
                            initial="hidden" animate="visible" exit="exit" variants={fadeVariants}
                        >
                            <div className="mb-10">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                                    {isLoginView ? "Welcome back" : "Create an account"}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-base">
                                    {isLoginView ? "Please enter your details to sign in." : "Start your journey with us today."}
                                </p>
                            </div>

                            {message && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    {message}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>

                                {/* ROLE SELECTOR (Register Only) */}
                                {!isLoginView && (
                                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {["candidate", "recruiter"].map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setRole(r)}
                                                className={`py-3 cursor-pointer rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border-2 ${role === r
                                                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-slate-400"
                                                    }`}
                                            >
                                                {r === 'candidate' ? <UserCircle size={18} /> : <Briefcase size={18} />}
                                                <span className="capitalize">{r}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {!isLoginView && (
                                    <InputField label="Full Name" icon={User} type="text" id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                                )}

                                <InputField label="Email Address" icon={Mail} type="email" id="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />

                                <div className="space-y-2">
                                    <InputField label="Password" icon={Lock} type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                    {isLoginView && (
                                        <div className="flex justify-end">
                                            <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link>
                                        </div>
                                    )}
                                </div>

                                {/* RECRUITER EXTRA FIELDS */}
                                <AnimatePresence>
                                    {!isLoginView && role === 'recruiter' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="p-5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Building size={14} /> Company Details
                                                </h4>
                                                <InputField label="Company Name" icon={Building} type="text" id="companyName" placeholder="Tech Corp Inc." value={formData.companyName} onChange={handleChange} required />
                                                <InputField label="Website" icon={Globe} type="url" id="companyWebsite" placeholder="https://company.com" value={formData.companyWebsite} onChange={handleChange} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full cursor-pointer py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLoginView ? "Sign in" : "Create Account")}
                                    {!loading && <ArrowRight size={18} />}
                                </button>

                            </form>

                            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                {isLoginView ? "Don't have an account?" : "Already have an account?"} {' '}
                                <button
                                    onClick={() => setIsLoginView(!isLoginView)}
                                    className="cursor-pointer text-blue-600 font-bold hover:underline"
                                >
                                    {isLoginView ? "Sign up" : "Log in"}
                                </button>
                                <div className="mt-2">
                                    <SignInBtn/>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            
            {/* --- RIGHT SIDE: THE IMAGE (The "Interesting" Part) --- */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                    style={{ backgroundImage: "url('/engineering.jpg')" }}
                />

                {/* Gradient Overlay (Makes text readable) */}
                <div className="absolute inset-0 bg-linear-to-t from-blue-900/90 via-slate-900/50 to-slate-900/20 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay"></div>

                {/* Content Content (Glass Card on Image) */}
                <div className="absolute bottom-0 left-0 right-0 p-16 text-white z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl max-w-lg"
                    >
                        <div className="flex gap-1 mb-4 text-yellow-400">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <blockquote className="text-xl font-medium leading-relaxed mb-6">
                            &ldquo;JobFinder helped us scale our engineering team by 50% in just two months. The quality of candidates is unmatched.&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-cyan-300"></div>
                            <div>
                                <p className="font-bold text-lg">Alex Johnson</p>
                                <p className="text-blue-200 text-sm">CTO at TechFlow</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
}
