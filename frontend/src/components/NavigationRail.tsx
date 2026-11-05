"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Home,
  Info,
  Layers,
  Search,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { Language, UIStrings } from "@/lib/strings";

interface NavProps {
  lang: Language;
  onLanguageToggle: () => void;
  t: UIStrings;
}

export function NavigationRail({ lang, onLanguageToggle, t }: NavProps) {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { href: "/", label: lang === "hi" ? "होम" : "Home", icon: Home },
    { href: "/schemes", label: lang === "hi" ? "योजनाएं" : "Schemes", icon: Layers },
    { href: "/match", label: lang === "hi" ? "पात्रता जांच" : "Check Eligibility", icon: CheckCircle2 },
    { href: "/guides", label: lang === "hi" ? "मार्गदर्शिका" : "Guides", icon: BookOpen },
    { href: "/faqs", label: lang === "hi" ? "प्रश्नोत्तरी" : "FAQs", icon: HelpCircle },
    { href: "/about", label: lang === "hi" ? "परिचय" : "About", icon: Info },
  ];

  return (
    <>
      {/* DESKTOP LEFT SIDEBAR RAIL */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-offwhite-surface dark:bg-offwhite-darkSurface border-r border-offwhite-border dark:border-offwhite-darkBorder z-30 p-4 justify-between transition-colors">
        <div className="space-y-6">
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 group">
            <div className="w-8 h-8 rounded-lg bg-teal-deep text-amber-warm flex items-center justify-center font-black text-sm tracking-wider">
              YS
            </div>
            <div>
              <div className="text-sm font-black text-ink dark:text-white tracking-tight font-heading">
                Yojana Saathi
              </div>
              <div className="text-[10px] text-ink-muted dark:text-slate-400 font-medium">
                Official Directory
              </div>
            </div>
          </Link>

          {/* Quick Search Button (Ctrl+K) */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/40 text-xs text-ink-muted dark:text-slate-400 hover:border-amber-warm transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "खोजें..." : "Quick Search..."}</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-bold bg-offwhite-border/60 dark:bg-offwhite-darkBorder text-ink dark:text-slate-300 rounded">
              Ctrl+K
            </kbd>
          </button>

          {/* Nav links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-teal-deep text-white border-l-4 border-l-amber-warm shadow-xs"
                      : "text-ink-light dark:text-slate-300 hover:bg-offwhite/80 dark:hover:bg-offwhite-dark/60 hover:text-ink dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-offwhite-border dark:border-offwhite-darkBorder flex items-center justify-between px-1">
          <button
            onClick={onLanguageToggle}
            className="px-2.5 py-1.5 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder text-xs font-bold text-ink-light dark:text-slate-300 hover:border-amber-warm transition-all"
            title="Toggle Language"
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-offwhite-surface/95 dark:bg-offwhite-darkSurface/95 backdrop-blur-md border-t border-offwhite-border dark:border-offwhite-darkBorder px-2 py-1.5 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
                isActive
                  ? "text-teal-deep dark:text-amber-warm"
                  : "text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </Link>
          );
        })}
        {/* Mobile language switch */}
        <button
          onClick={onLanguageToggle}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-ink-muted dark:text-slate-400"
        >
          <span className="w-4 h-4 text-[10px] flex items-center justify-center font-bold">
            {lang === "en" ? "HI" : "EN"}
          </span>
          <span>{lang === "en" ? "हि" : "EN"}</span>
        </button>
      </nav>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        lang={lang}
        t={t}
      />
    </>
  );
}

