"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-8 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:mb-16 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-extrabold text-transparent">
                JobFinder.
              </span>
            </Link>
            <p className="max-w-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Connecting top talent with world-class companies. Find your dream job or build your
              dream team with our AI-powered platform.
            </p>

            <div className="flex flex-wrap gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:text-white dark:bg-zinc-800 dark:hover:bg-blue-600"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-slate-900 dark:text-white">For Candidates</h3>
            <ul className="space-y-4">
              {["Browse Jobs", "Salary Prediction", "Candidate Dashboard", "My Applications"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-slate-900 dark:text-white">For Recruiters</h3>
            <ul className="space-y-4">
              {["Post a Job", "Talent Search", "Recruiter Dashboard", "Pricing"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-slate-900 dark:text-white">Any Queries</h3>
            <p className="mb-4 text-slate-500 dark:text-slate-400">Send your queries to below Email</p>

            <div className="mt-6 space-y-2 text-slate-500 dark:text-slate-400">
              <Link href="#" className="flex items-center gap-2 break-all">
                <Mail size={16} className="text-blue-600" />
                <span>ClickME</span>
              </Link>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <span className="font-bold">India, Punjab, FZR-152001</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 dark:border-zinc-800 md:flex-row md:items-center">
          <p className="text-left text-slate-500 dark:text-slate-400">© 2024 JobFinder Inc. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
              Terms of Service
            </Link>
            <Link href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
