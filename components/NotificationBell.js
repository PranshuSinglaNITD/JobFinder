"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, CheckCircle2, Eye, Briefcase, Info } from "lucide-react";
import { pusherClient } from "@/middleware/pusherClient";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Controls the dropdown visibility

  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const channelName = `user-${userId}`;

    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-notification", (data) => {
      const newNotif = data.notification;
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(newNotif.content, { theme: "dark" });
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [session]);

  // Helper function to pick an icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "PROFILE_VIEW": return <Eye className="w-4 h-4 text-blue-500" />;
      case "APPLICATION_UPDATE": return <Briefcase className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  // When the user hovers over the panel and looks at them, we can reset the count
  const handleHover = () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      setUnreadCount(0);
      // Optional: Call an API here to mark them as 'isRead: true' in MongoDB
    }
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleHover}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* The Bell Icon */}
      <div className="relative cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
        <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white dark:border-zinc-950 rounded-full animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      {/* The Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Dropdown Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <button 
                className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1"
                onClick={() => setNotifications([])} // Clears them for now
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>

            {/* Dropdown List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                  <p className="text-xs opacity-70 mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif, index) => (
                    <div 
                      key={index} 
                      className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                          {notif.content}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Just now
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* View All Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800 text-center bg-slate-50 dark:bg-zinc-950/50">
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        View all activity
                    </button>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}