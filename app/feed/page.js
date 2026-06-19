"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; 
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon, Send, X, FileText, Loader2,
  Heart, MessageCircle, Share2, MoreHorizontal
} from "lucide-react";
import { Bounce, toast, ToastContainer } from "react-toastify";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const postVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function FeedPage() {
  // 1. Initialize NextAuth Session
  const { data: session, status } = useSession(); 
  const user=session?.user

  // 2. State Management
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // 3. Fetch Posts Logic
  const fetchPosts = async () => {
    try {
      let url = "/api/posts/get";
      
      // If user is a recruiter, fetch specific posts (adjust based on your API logic)
      if (session?.user?.role === "recruiter") {
        url = `/api/posts/get?userId=${session.user.id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data.data) {
        setPosts(data.data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Feed error:", error);
    } finally {
      setInitialFetchDone(true);
    }
  };

  // 4. Trigger Fetch when Session is Ready
  useEffect(() => {
    // Only attempt to fetch posts once NextAuth finishes loading the session state
    if (status !== "loading") {
      fetchPosts();
    }
  }, [status]); 

  // 5. File Handling Logic
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File is too large (Max 5MB)");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  // 6. Post Submission Logic
  const handlePost = async (e) => {
    e.preventDefault();
    
    // Prevent empty posts
    if (!content && !file) return;

    // Verify NextAuth session exists instead of checking local storage
    if (!session || !session.user) {
      alert("Please log in first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      // Use the MongoDB ID directly from the NextAuth cookie
      formData.append("userId", session.user.id); 
      formData.append("description", content);

      if (file) {
        formData.append("media", file);
      }

      const res = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Message posted Successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
        
        // Add post to UI immediately using session data for the author profile
        const newPostForDisplay = {
          ...data.post,
          author: session.user 
        };
        
        setPosts((prevPosts) => [newPostForDisplay, ...prevPosts]);
        setContent("");
        removeFile();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Post failed:", error);
      alert("Something went wrong posting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900">
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
        transition={Bounce}
      />
      <div className="max-w-2xl mx-auto pt-8 pb-20 px-4">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Community Feed
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Share updates, opportunities, and insights.</p>
        </motion.div>

        {/* Create Post Widget */}
        {user && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 dark:border-zinc-800 p-6 mb-10 overflow-hidden relative group"
          >
            {/* Subtle Gradient Background Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 transition-opacity group-hover:opacity-100 opacity-50"></div>

            <div className="flex gap-4">
              <div className="shrink-0 h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white dark:ring-zinc-800">
                {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
              </div>

              <div className="flex-1 space-y-4">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none placeholder-slate-400 dark:placeholder-zinc-600 min-h-[80px] leading-relaxed"
                  placeholder={`What's happening, ${user.firstName || "Recruiter"}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-black/50"
                    >
                      <button
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors z-10"
                      >
                        <X size={16} />
                      </button>

                      {file.type.includes("image") ? (
                        <img src={previewUrl} alt="Preview" className="w-full max-h-80 object-cover" />
                      ) : (
                        <div className="flex items-center gap-4 p-6">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                            <FileText size={32} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <label className="cursor-pointer group/icon flex items-center justify-center p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                      <ImageIcon className="text-slate-400 group-hover/icon:text-blue-500 transition-colors" size={22} />
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePost}
                    disabled={loading || (!content && !file)}
                    className="bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-black hover:text-white dark:hover:text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        Post <Send size={16} className="-mr-1 ml-1" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feed Stream */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Skeleton Loader for Initial Fetch */}
          {!initialFetchDone && (
            [1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="h-10 w-10 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                    <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  </div>
                </div>
                <div className="h-20 bg-slate-100 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ))
          )}

          {/* Empty State */}
          {initialFetchDone && posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={40} className="text-slate-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">It's quiet here...</h3>
              <p className="text-slate-400">Be the first to share an update!</p>
            </motion.div>
          )}

          {/* Posts List */}
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.article
                layout
                key={post._id}
                variants={postVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-zinc-700 transition-all duration-300"
              >
                <div className="p-6">
                  {/* Author Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-linear-to-tr from-slate-200 to-slate-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-lg ring-2 ring-white dark:ring-black">
                        {post.author?.firstName?.[0] || post.author?.name?.[0] || "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {post.author?.firstName || post.author?.name || "Unknown"} {post.author?.lastName || ""}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {post.author?.role === 'recruiter' ? 'Recruiter' : 'Member'} • {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Content Text */}
                  {post.content && (
                    <div className="mb-4">
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 text-base leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Media Attachment */}
                  {post.media && post.media.url && (
                    <div className="mt-2 mb-4">
                      {(post.media.fileType?.includes("image") || post.media.type === "image" || post.media.url.match(/\.(jpeg|jpg|gif|png)$/) != null) ? (
                        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-black">
                          <img src={post.media.url} alt="Post content" className="w-full object-cover max-h-[500px]" />
                        </div>
                      ) : (
                        <a href={post.media.url} download target="_blank" className="block group">
                          <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="p-3 bg-white dark:bg-zinc-700 rounded-lg shadow-sm text-blue-600">
                              <FileText size={24} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {post.media.name || "Attached Document"}
                              </p>
                              <p className="text-xs text-slate-500">Click to download</p>
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Social Actions (Visual Only) */}
                  <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-pink-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 transition-colors">
                        <Heart size={20} className="transition-transform group-active:scale-75" />
                      </div>
                      <span className="text-sm font-medium">Like</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <MessageCircle size={20} />
                      </div>
                      <span className="text-sm font-medium">Comment</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors group ml-auto">
                      <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                        <Share2 size={20} />
                      </div>
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}