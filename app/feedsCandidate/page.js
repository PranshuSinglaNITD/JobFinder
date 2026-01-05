"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, Search, 
  TrendingUp, Clock, Filter, MoreHorizontal 
} from "lucide-react";

export default function CandidateFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest"); // 'latest' | 'popular'

  // 1. Fetch Posts on Mount
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch("/api/posts/get");
        const data = await res.json();
        
        let feedData = [];
        if (Array.isArray(data)) feedData = data;
        else if (data.data) feedData = data.data;

        // Add mock 'liked' state for UI demo
        feedData = feedData.map(post => ({
          ...post,
          isLiked: false, 
          likeCount: Math.floor(Math.random() * 50) + 5 // Mock count
        }));

        setPosts(feedData);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  // 2. Handle Like (Optimistic UI Update)
  const toggleLike = (postId) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          };
        }
        return post;
      })
    );
    // TODO: Call API /api/posts/like here
  };

  // Filter Logic
  const filteredPosts = posts.filter(post => 
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 pt-10 pb-6 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight"
          >
            Community <span className="text-blue-600">Buzz</span>
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400">
            See what recruiters and companies are talking about today.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto mt-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-700 rounded-full leading-5 bg-slate-50 dark:bg-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder="Search hashtags, companies, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- FEED CONTROLS --- */}
      <div className="sticky top-16 z-10 bg-slate-50/95 dark:bg-black/95 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
           <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('latest')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'latest' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                <Clock size={16} /> Latest
              </button>
              <button 
                onClick={() => setActiveTab('popular')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'popular' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                <TrendingUp size={16} /> Popular
              </button>
           </div>
           <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
             <Filter size={18} />
           </button>
        </div>
      </div>

      {/* --- FEED STREAM --- */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {post.author?.firstName?.[0] || "U"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          {post.author?.firstName} {post.author?.lastName}
                          {post.author?.role === 'recruiter' && (
                             <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                               Recruiter
                             </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit' })}
                          {post.author?.company?.name && ` • ${post.author.company.name}`}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-2">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Media */}
                  {post.media && post.media.url && (
                    <div className="mt-2 mb-2">
                       {(post.media.fileType?.includes("image") || post.media.type === "image" || post.media.url.match(/\.(jpeg|jpg|gif|png)$/)) ? (
                         <div className="bg-black flex items-center justify-center">
                           <img src={post.media.url} alt="Post Media" className="w-full max-h-125 object-contain" />
                         </div>
                       ) : (
                         <div className="mx-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-4">
                           <div className="h-10 w-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                           </div>
                           <div className="flex-1 overflow-hidden">
                             <p className="font-medium truncate text-sm">{post.media.name || "Document Attached"}</p>
                             <a href={post.media.url} target="_blank" className="text-xs text-blue-600 hover:underline">Download / View</a>
                           </div>
                         </div>
                       )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleLike(post._id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          post.isLiked ? "text-pink-600" : "text-slate-500 hover:text-pink-600"
                        }`}
                      >
                        <Heart size={20} className={post.isLiked ? "fill-current" : ""} />
                        <span>{post.likeCount}</span>
                      </button>

                      <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                        <MessageCircle size={20} />
                        <span>Comment</span>
                      </button>
                    </div>
                    
                    <button className="text-slate-500 hover:text-green-600 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>

                </motion.article>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <p>No posts found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}