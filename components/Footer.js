"use client";

import Link from "next/link";
import { 
  Facebook, Twitter, Linkedin, Instagram, 
  Send, Mail, MapPin, Phone 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* --- BRAND COLUMN --- */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-extrabold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobFinder.
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Connecting top talent with world-class companies. 
              Find your dream job or build your dream team with our AI-powered platform.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="h-10 w-10 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* --- LINKS COLUMN 1: CANDIDATES --- */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">For Candidates</h3>
            <ul className="space-y-4">
              {['Browse Jobs', 'Salary Prediction', 'Candidate Dashboard', 'My Applications'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- LINKS COLUMN 2: RECRUITERS --- */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">For Recruiters</h3>
            <ul className="space-y-4">
              {['Post a Job', 'Talent Search', 'Recruiter Dashboard', 'Pricing'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- NEWSLETTER / CONTACT --- */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Any Queries</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Send your queries to below Email
            </p>


            <div className="mt-6 space-y-2 text-slate-500 dark:text-slate-400">
               <Link href={'#'} className="flex items-center gap-2">
                 <Mail size={16} className="text-blue-600" />
                 <span>ClickME</span>
               </Link>
               <div className="flex items-center gap-2">
                 <MapPin size={16} className="text-blue-600" />
                 <span className="font-bold">India, Punjab, FZR-152001</span>
               </div>
            </div>
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-400">
            © 2024 JobFinder Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}