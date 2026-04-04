"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Send, Bot, User, Sparkles, Loader2, Plus, 
  MessageSquare, FileText, ArrowUp, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function JobChatbot() {
  const { data: session } = useSession();
  
  // --- STATE ---
  // History & Navigation
  const [chats, setChats] = useState([]); // Sidebar history
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Active Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // New Chat Setup State (The Resume Gatekeeper)
  const [resumeText, setResumeText] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(true);

  // --- 1. LOAD SIDEBAR HISTORY ---
  // In a real app, you would fetch this from a new GET route: `/api/chat/history?userId=${session?.user?.id}`
  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/chat/history?userId=${session.user.id}`);
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

  // --- 2. START A NEW CHAT ---
  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setResumeText("");
    setIsSettingUp(true);
    if (window.innerWidth < 768) setSidebarOpen(false); // Close sidebar on mobile
  };

  // --- 3. LOAD AN OLD CHAT ---
  const loadChat = async (chatId) => {
    setActiveChatId(chatId);
    setIsSettingUp(false);
    setMessages([]); // Clear current UI temporarily
    setLoading(true);
    
    try {
      const res = await fetch(`/api/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        
        // 🚨 ADD THIS LINE: Restore the resume context so they can continue chatting seamlessly
        setResumeText(data.resumeText || ""); 
      }
    } catch (err) {
      console.error("Failed to load chat messages");
    } finally {
      setLoading(false);
    }
    
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // --- 4. SEND MESSAGE TO LANGGRAPH ---
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || (!activeChatId && !resumeText.trim())) return;

    // If this is the first message, close the setup screen
    if (isSettingUp) setIsSettingUp(false);

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Calls the Next.js API we built earlier
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chatId: activeChatId, // Will be null for new chats
          userId: session?.user?.id,
          userName: session?.user?.firstName || "Candidate",
          message: userMessage.content,
          resumeText: resumeText // Only needed for the first message
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
        
        // If this was a new chat, the backend created an ID. Let's save it.
        if (!activeChatId && data.chatId) {
          setActiveChatId(data.chatId);
          // Optimistically add to sidebar
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
    <div className="flex h-screen bg-white dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* --- SIDEBAR (History) --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            className="absolute md:relative z-30 w-72 h-full bg-slate-50 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shadow-2xl md:shadow-none"
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
        <header className="md:hidden flex items-center p-4 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 mr-3 bg-slate-100 dark:bg-zinc-800 rounded-lg">
            <Menu size={20} />
          </button>
          <span className="font-bold">JobFinder AI</span>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth relative">
          
          {/* THE SETUP SCREEN (Only shows on New Chat before first message) */}
          <AnimatePresence>
            {isSettingUp && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-slate-50/90 dark:bg-black/90 backdrop-blur-sm"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                  <Bot size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-extrabold mb-2 text-center">Let's find your next role.</h2>
                <p className="text-slate-500 text-center max-w-md mb-8">
                  To give you personalized job matches and career advice, I need to know your background.
                </p>

                <div className="w-full max-w-xl bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800">
                  <label className="flex items-center gap-2 font-bold mb-3 text-slate-700 dark:text-slate-300">
                    <FileText size={18} className="text-blue-600" /> Paste your Resume / LinkedIn Summary
                  </label>
                  <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="E.g., I am a Full Stack Developer with 3 years of experience in React, Node.js, and MongoDB..."
                    className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm font-medium"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* THE ACTUAL MESSAGES */}
          <div className="max-w-4xl mx-auto space-y-6 p-6 pb-32">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles size={18} className="text-white" />
                  </div>
                )}

                <div className={`relative max-w-[85%] px-6 py-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-sm shadow-md" 
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.role !== "user" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="font-medium">{msg.content}</p>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
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
        <div className="p-4 bg-white dark:bg-black border-t border-slate-200 dark:border-zinc-800 z-20">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-300 dark:border-zinc-700 shadow-inner focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSettingUp ? "Type your first question here..." : "Ask JobBot..."}
                className="w-full pl-6 pr-16 py-4 bg-transparent focus:outline-none text-base"
                disabled={loading || (isSettingUp && resumeText.trim().length < 10)}
              />
              <div className="absolute right-2 flex items-center">
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading || (isSettingUp && resumeText.trim().length < 10)}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowUp size={20} />}
                </button>
              </div>
            </form>
            {isSettingUp && resumeText.trim().length < 10 && (
              <p className="text-xs text-red-500 mt-2 text-center font-medium">Please paste your resume context above before chatting.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}