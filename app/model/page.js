"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, DollarSign, Calculator, ChevronDown, 
  AlertCircle, TrendingUp, BarChart3, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100 } 
  }
};

export default function SalaryPrediction() {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null); 
  const [formData, setFormData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch Form Structure (LOGIC INTACT)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/meta");
        if (!res.ok) throw new Error("Failed to connect to ML Server");
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setMeta(data);
        
        const initialData = {};
        if (data.numerical) data.numerical.forEach(col => initialData[col] = 0);
        if (data.categorical) {
            Object.keys(data.categorical).forEach(col => {
                initialData[col] = data.categorical[col][0] || "";
            });
        }
        setFormData(initialData);

      } catch (err) {
        console.error("Connection Error:", err);
        setError("Could not connect to the Prediction Engine. Make sure the Python server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setPrediction(null);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Prediction failed");
      
      if (data.salary) {
        setPrediction(data.salary);
      }
    } catch (err) {
      console.error("Prediction Error:", err);
      setError("Failed to calculate salary. Please check your inputs.");
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 relative z-10" />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Initializing AI Model...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 py-12 px-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-blue-900/5 mb-6 border border-slate-100 dark:border-zinc-800">
            <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-sm font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
                AI Powered
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Salary <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Predictor</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Leverage our machine learning model to estimate market value based on real-time industry data points.
          </p>
        </motion.div>

        <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 max-w-3xl mx-auto"
                >
                    <AlertCircle size={20} />
                    <span className="font-medium">{error}</span>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT: INPUT FORM --- */}
          <div className="lg:col-span-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 relative overflow-hidden"
            >
              {/* Decorative linear blob */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

              <form onSubmit={handlePredict} className="space-y-8">
                
                {/* Numerical Inputs */}
                {meta?.numerical && meta.numerical.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                        <BarChart3 className="text-blue-500" size={20} />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Metrics & Experience</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {meta.numerical.map(col => (
                        <div key={col} className="group">
                          <label className="block text-sm font-semibold mb-2 capitalize text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 transition-colors">
                             {col.replace(/_/g, ' ')}
                          </label>
                          <input 
                            type="number" 
                            name={col}
                            step="any"
                            required
                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                            value={formData[col]}
                            onChange={handleChange}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Categorical Inputs */}
                {meta?.categorical && Object.keys(meta.categorical).length > 0 && (
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100 dark:border-zinc-800 mt-2">
                        <BriefcaseIcon className="text-purple-500" size={20} />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Role & Company</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.keys(meta.categorical).map(col => (
                        <div key={col} className="group">
                          <label className="block text-sm font-semibold mb-2 capitalize text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 transition-colors">
                             {col.replace(/_/g, ' ')}
                          </label>
                          <div className="relative">
                            <select 
                              name={col}
                              className="w-full appearance-none px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                              value={formData[col]}
                              onChange={handleChange}
                            >
                              {meta.categorical[col].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={18} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={predicting}
                  className="w-full py-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center cursor-pointer justify-center gap-3 mt-4"
                >
                  {predicting ? (
                      <>
                        <Loader2 className="animate-spin" /> Calculating...
                      </>
                  ) : (
                      <>
                        <Calculator size={20} /> Calculate Prediction
                      </>
                  )}
                </motion.button>

              </form>
            </motion.div>
          </div>

          {/* --- RIGHT: RESULT CARD --- */}
          <div className="lg:col-span-4 relative">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="sticky top-24 space-y-6"
            >
              {/* Main Result Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden min-h-80 flex flex-col justify-between border border-slate-800">
                
                {/* Animated Background linears */}
                <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-linear-to-b from-blue-600/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-50%] left-[-50%] w-full h-full bg-linear-to-t from-purple-600/30 to-transparent rounded-full blur-3xl"></div>

                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <h3 className="text-slate-300 font-semibold uppercase tracking-wide text-xs">Estimated Annual Salary</h3>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                        <AnimatePresence mode="wait">
                            {prediction ? (
                            <motion.div 
                                key="result"
                                initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white via-blue-100 to-slate-300 drop-shadow-2xl">
                                    <span className="text-3xl font-medium text-slate-400 mr-1">₹</span>
                                    {prediction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-medium">
                                    <Sparkles size={12} /> High Confidence
                                </div>
                            </motion.div>
                            ) : (
                            <motion.div 
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center text-slate-600"
                            >
                                <div className="p-4 rounded-full border-2 border-dashed border-slate-700 mb-3">
                                    <DollarSign size={32} className="opacity-50" />
                                </div>
                                <span className="text-sm font-medium">Result will appear here</span>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 text-center leading-relaxed">
                        * Estimation based on provided inputs. Actual offers may vary by company policies and negotiations.
                    </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                <h4 className="font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-blue-600" />
                    Model Information
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This tool utilizes a Linear Regression algorithm trained on our proprietary dataset (`sal.csv`). It dynamically adapts to new feature columns provided by the backend pipeline.
                </p>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple icon component for cleaner code above
function BriefcaseIcon({ className, size }) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}