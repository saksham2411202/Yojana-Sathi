"use client";

import React from "react";
import Link from "next/link";
import { Compass, Search, Sparkles, X } from "lucide-react";
import { UIStrings } from "@/lib/strings";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  t: UIStrings;
}

export function HeroSection({ searchQuery, onSearchChange, t }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#1e1b4b] text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
      {/* Subtle Saffron & Green Accent Glows (No flags/emblems) */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>India Welfare Directory & Eligibility Engine</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight sm:leading-tight text-white drop-shadow-sm">
          {t.heroHeadline}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Search Bar inside Hero */}
        <div className="relative max-w-lg mx-auto">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.heroSearchPlaceholder}
            className="w-full pl-11 pr-10 py-3.5 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 hover:border-white/30 focus:border-amber-400/80 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-400 shadow-lg focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Prominent Check my eligibility button */}
        <div className="pt-2">
          <Link
            href="/match"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>{t.heroCheckEligibility}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

