"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Sparkles, Loader2, RefreshCw, 
  Briefcase, MapPin, DollarSign, ArrowUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function JobChatbot() {
  // Initial Welcome Message
  const [messages, setMessages] = useState([
    { 
      role: "ai", 
      content: "Hi there! I'm **JobBot**, your AI Career Assistant. \n\nI have real-time access to our active job database. Ask me about roles, salaries, or specific skills!" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Suggestions for the user
  const suggestions = [
    "Find remote React jobs",
    "High paying roles > $80k",
    "Marketing jobs in New York",
    "Internships for freshers"
  ];

  // Auto-scroll to bottom with smooth behavior
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "⚠️ **Connection Issue**: I couldn't reach the job database. Please try again." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "ai", content: "❌ **Network Error**: Please check your internet connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
        { role: "ai", content: "Chat cleared. Ready for a fresh start! What are you looking for?" }
    ]);
  };

  return (
    <div className="relative h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col">
      
      {/* --- BACKGROUND PATTERN --- */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Bot className="text-white w-6 h-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                JobFinder <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Powered by Gemini 1.5 Pro
              </p>
            </div>
          </div>
          
          <button 
            onClick={clearChat}
            className="group p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            title="Reset Conversation"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto px-4 py-6 z-10 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
          
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* AI Avatar */}
                {msg.role === "ai" && (
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Sparkles size={18} className="text-blue-600" />
                  </div>
                )}

                {/* Message Bubble */}
                <div 
                  className={`relative max-w-[85%] sm:max-w-[75%] px-6 py-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-sm shadow-blue-500/20" 
                      : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-slate-900 dark:prose-strong:text-white prose-ul:my-2 prose-li:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="font-medium">{msg.content}</p>
                  )}
                  
                  {/* Timestamp (Optional Aesthetic) */}
                  <div className={`text-[10px] mt-2 text-right opacity-60 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-1 shadow-inner">
                    <User size={18} className="text-slate-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={18} className="text-blue-600 animate-pulse" />
              </div>
              <div className="bg-white dark:bg-zinc-900 px-5 py-4 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              </div>
            </motion.div>
          )}
          
          <div ref={scrollRef} className="h-4" />
        </div>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="z-20 p-4 bg-transparent">
        <div className="max-w-3xl mx-auto">
          
          {/* Suggestions Pills */}
          <AnimatePresence>
            {!loading && messages.length < 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-wrap gap-2 mb-4 justify-center"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow-md"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Box */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-md"></div>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="relative flex items-center bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-blue-500/5 focus-within:shadow-blue-500/10 transition-shadow overflow-hidden"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about jobs, salaries, or skills..."
                className="w-full pl-6 pr-16 py-4 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-base"
                disabled={loading}
              />
              <div className="absolute right-2 flex items-center">
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-blue-600 shadow-md"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowUp size={20} />}
                </button>
              </div>
            </form>
          </div>
          
          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
            AI can make mistakes. Please verify important job details.
          </p>
        </div>
      </div>

    </div>
  );
}