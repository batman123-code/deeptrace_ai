"use client";

import CardNav from './CardNav';
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { LogOut, User as UserIcon } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

export function SiteHeader() {
  const { userDetails, signOut } = useAuth();
  const { scrollY } = useScroll();
  
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const shadowValue = useTransform(scrollY, [0, 50], ["none", "0 4px 6px -1px rgba(0,0,0,0.05)"]);

  const items = [
    {
      label: "Product",
      bgColor: "#f8fafc", // slate-50
      textColor: "#0f172a", // slate-900
      links: [
        { label: "Deepfake Detection", href: "/deepfake-detection", ariaLabel: "Deepfake Detection" },
        { label: "Context Verification", href: "/context-verification", ariaLabel: "Context Verification" }
      ]
    },
    {
      label: "Solutions", 
      bgColor: "#f1f5f9", // slate-100
      textColor: "#0f172a",
      links: [
        { label: "Trust & Safety", href: "/solutions/trust-safety", ariaLabel: "Trust and Safety" },
        { label: "Journalists", href: "/solutions/journalists", ariaLabel: "Journalists" }
      ]
    },
    {
      label: "Resources",
      bgColor: "#e2e8f0", // slate-200
      textColor: "#0f172a",
      links: [
        { label: "Developers", href: "/developers", ariaLabel: "Developers API" },
        { label: "Blog", href: "/blog", ariaLabel: "Blog" },
        { label: "FAQ", href: "/faq", ariaLabel: "FAQ" }
      ]
    }
  ];

  return (
    <motion.header className="fixed top-[3px] z-[150] w-full pointer-events-none transition-all duration-300">
      <motion.div 
        className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md pointer-events-auto border-b border-slate-200/50 dark:border-slate-800/50"
        style={{ opacity: bgOpacity, boxShadow: shadowValue }}
      />
      <div className="relative pt-4 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="flex-1" />
        
        {/* User profile floating to the right */}
        <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-1.5 rounded-full shadow-sm z-[100]">
          {userDetails ? (
            <div className="flex items-center gap-3 pr-2">
              {userDetails.avatarUrl ? (
                <img
                  src={userDetails.avatarUrl}
                  alt={userDetails.fullName || "User Avatar"}
                  className="h-8 w-8 rounded-full border border-slate-300 object-cover dark:border-slate-700"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <UserIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </div>
              )}
              <div className="hidden text-left lg:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {userDetails.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="hidden text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 sm:inline-flex px-3 transition-colors"
            >
              Sign In
            </a>
          )}
          <ThemeToggle />
        </div>
      </div>
      
      {/* The island CardNav */}
      <div className="pointer-events-auto relative mt-[-40px]">
        <CardNav
          items={items}
          baseColor="white"
          menuColor="#0f172a"
          buttonBgColor="#2563eb"
          buttonTextColor="#ffffff"
          ease="power3.out"
        />
      </div>
    </motion.header>
  );
}
