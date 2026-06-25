"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bot, User, Sparkles, Loader2, Plus, 
  MessageSquare, FileText, ArrowUp, Menu, X, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function JobChatbot() {
  const { data: session } = useSession();
  
  // History & Navigation
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Active Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Resume Gatekeeper States
  const [resumeText, setResumeText] = useState("");
  const [hasMasterResume, setHasMasterResume] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [showManualOverride, setShowManualOverride] = useState(false);

  // 1. Initialize Mobile Sidebar & Check for Master Resume
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) setSidebarOpen(false);

      // Check if they already saved a Master Resume in their profile
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (localUser.resumeText) {
        setResumeText(localUser.resumeText);
        setHasMasterResume(true);
      }
    }
  }, []);

  // 2. Load Sidebar History
  useEffect(() => {
    const fetchHistory = async () => {
      // Use NextAuth ID or fallback to LocalStorage ID
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = session?.user?.id || localUser._id;
      
      if (!userId) return;
      
      try {
        const res = await fetch(`/api/chat/history?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setChats(data.chats);
        }
      } catch (err) {
        console.error("Failed to load history");
      }
    };
    fetchHistory();
  }, [session]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 3. Start a New Chat
  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setIsSettingUp(true);
    setShowManualOverride(false);
    
    // Reset to Master Resume if they have one
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (localUser.resumeText) {
      setResumeText(localUser.resumeText);
      setHasMasterResume(true);
    } else {
      setResumeText("");
      setHasMasterResume(false);
    }

    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // 4. Load an Old Chat
  const loadChat = async (chatId) => {
    setActiveChatId(chatId);
    setIsSettingUp(false);
    setMessages([]);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setResumeText(data.resumeText || ""); 
      }
    } catch (err) {
      console.error("Failed to load chat messages");
    } finally {
      setLoading(false);
    }
    
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // 5. Send Message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || (!activeChatId && !resumeText.trim())) return;

    if (isSettingUp) setIsSettingUp(false);

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = session?.user?.id || localUser._id;
      const userName = session?.user?.firstName || localUser.firstName || "Candidate";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chatId: activeChatId, 
          userId: userId,
          userName: userName,
          message: userMessage.content,
          resumeText: resumeText // Feeds the freshest resume to Python
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
        
        // Optimistically add new chat to sidebar
        if (!activeChatId && data.chatId) {
          setActiveChatId(data.chatId);
          setChats(prev => [{ _id: data.chatId, title: userMessage.content.substring(0, 25) + "..." }, ...prev]);
        }
      } else {
        setMessages((prev) => [...prev, { role: "model", content: "⚠️ **Connection Issue**: I couldn't process that right now." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "model", content: "❌ **Network Error**: Please check your internet connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100svh-4rem)] min-h-[34rem] overflow-hidden bg-white font-sans text-slate-900 dark:bg-black dark:text-slate-100">
      {sidebarOpen && <div className="absolute inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* --- SIDEBAR --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            className="absolute z-30 flex h-full w-[85vw] max-w-72 flex-col border-r border-slate-200 bg-slate-50 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 md:relative md:shadow-none"
          >
            <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-zinc-800">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Bot className="text-blue-600" /> JobBot <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">AI</span>
              </h2>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-200 rounded-lg"><X size={20}/></button>
            </div>

            <div className="p-4">
              <button 
                onClick={handleNewChat}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Plus size={18} /> New Analysis
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Recent Chats</p>
              {chats.length === 0 ? (
                <p className="text-sm text-slate-500 px-2 italic">No history yet.</p>
              ) : (
                chats.map(chat => (
                  <button 
                    key={chat._id} onClick={() => loadChat(chat._id)}
                    className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 text-sm transition-colors ${
                      activeChatId === chat._id 
                        ? "bg-slate-200 dark:bg-zinc-800 font-semibold text-slate-900 dark:text-white" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <MessageSquare size={16} className="shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex items-center border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 mr-3 bg-slate-100 dark:bg-zinc-800 rounded-lg">
            <Menu size={20} />
          </button>
          <span className="font-bold">JobFinder AI</span>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth relative">
          
          {/* THE SETUP SCREEN (Resume Gatekeeper) */}
          <AnimatePresence>
            {isSettingUp && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 p-4 backdrop-blur-sm dark:bg-black/90 sm:p-6 overflow-y-auto"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                  <Bot size={40} className="text-white" />
                </div>
                
                {hasMasterResume && !showManualOverride ? (
                  /* STATE 1: Master Resume Found */
                  <div className="w-full max-w-md text-center">
                    <h2 className="mb-2 text-2xl font-extrabold sm:text-3xl">Ready to go.</h2>
                    <p className="text-slate-500 mb-6">I have securely loaded your Master Resume from your profile.</p>
                    
                    <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 mb-8 shadow-sm flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle size={24} />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Resume Linked</h3>
                      <p className="text-sm text-slate-500 mt-1">I will use this context to match and apply to jobs for you.</p>
                    </div>

                    <button 
                      onClick={() => setIsSettingUp(false)}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all mb-4"
                    >
                      Start Chatting
                    </button>
                    <button 
                      onClick={() => {
                        setShowManualOverride(true);
                        setResumeText(""); // Clear it so they can paste a new one
                      }}
                      className="text-sm text-slate-500 hover:text-blue-600 transition-colors underline underline-offset-4"
                    >
                      I want to paste a different resume for this chat
                    </button>
                  </div>
                ) : (
                  /* STATE 2: Manual Entry (No Master Resume OR User Clicked Override) */
                  <div className="w-full max-w-xl text-center">
                    <h2 className="mb-2 text-2xl font-extrabold sm:text-3xl">Let&apos;s map your skills.</h2>
                    <p className="text-slate-500 mb-6">Paste your resume text below so I can analyze jobs perfectly.</p>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 text-left">
                      <label className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                          <FileText size={18} className="text-blue-600" /> Resume / LinkedIn Data
                        </span>
                        {hasMasterResume && (
                          <button onClick={() => {
                            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
                            setResumeText(localUser.resumeText || "");
                            setShowManualOverride(false);
                          }} className="text-xs text-blue-600 hover:underline">
                            Cancel
                          </button>
                        )}
                      </label>
                      <textarea 
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="E.g., I am a Full Stack Developer with 3 years of experience..."
                        className="w-full h-48 p-4 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm font-medium"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* THE MESSAGES */}
          <div className="mx-auto max-w-4xl space-y-6 p-4 pb-28 sm:p-6 sm:pb-32">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-md sm:flex">
                    <Sparkles size={18} className="text-white" />
                  </div>
                )}

                <div className={`relative max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[85%] sm:px-6 sm:py-4 ${
                  msg.role === "user" 
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-sm shadow-md" 
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.role !== "user" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="font-medium">{msg.content}</p>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 shadow-inner dark:bg-zinc-800 sm:flex">
                    <User size={18} className="text-slate-500" />
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex gap-4 justify-start">
                 <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-white animate-pulse" />
                  </div>
                <div className="bg-white dark:bg-zinc-900 px-5 py-4 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={scrollRef} className="h-4" />
          </div>
        </div>

        {/* --- INPUT AREA --- */}
        <div className="z-20 border-t border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-black sm:p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-300 dark:border-zinc-700 shadow-inner focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSettingUp && !hasMasterResume ? "Paste your resume above first..." : "Ask JobBot..."}
                className="w-full pl-6 pr-16 py-4 bg-transparent focus:outline-none text-base"
                disabled={loading || (isSettingUp && resumeText.trim().length < 10 && !hasMasterResume)}
              />
              <div className="absolute right-2 flex items-center">
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading || (isSettingUp && resumeText.trim().length < 10 && !hasMasterResume)}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowUp size={20} />}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}