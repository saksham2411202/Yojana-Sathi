"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Compass, Landmark, Sparkles } from "lucide-react";
import { SchemeStatsResponse } from "@/lib/api";
import { UIStrings } from "@/lib/strings";

interface BentoStatsProps {
  stats: SchemeStatsResponse | null;
  t: UIStrings;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

function Counter({ end, duration = 1 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 30);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 30);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
}

export function BentoStats({ stats, t }: BentoStatsProps) {
  if (!stats) return null;

  const total = stats.total || 0;
  const central = stats.by_level["central"] || 0;
  const state = stats.by_level["state"] || 0;
  const categoryCount = Object.keys(stats.by_need || {}).length || 3;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Total Schemes */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider font-heading">{t.totalSchemes}</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
          <Counter end={total} />
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Active live welfare schemes</p>
      </motion.div>

      {/* 2. Central Government Schemes */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-950/40 dark:to-indigo-950/20 backdrop-blur-md border border-blue-100/60 dark:border-blue-900/40 shadow-sm"
      >
        <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider font-heading">{t.centralSchemes}</span>
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
            <Landmark className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-blue-950 dark:text-blue-100 font-heading">
          <Counter end={central} />
        </div>
        <p className="text-[11px] text-blue-600/70 dark:text-blue-400 mt-1">Pan-India ministries</p>
      </motion.div>

      {/* 3. State Government Schemes */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-50/80 to-fuchsia-50/40 dark:from-purple-950/40 dark:to-fuchsia-950/20 backdrop-blur-md border border-purple-100/60 dark:border-purple-900/40 shadow-sm"
      >
        <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider font-heading">{t.stateSchemes}</span>
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-purple-950 dark:text-purple-100 font-heading">
          <Counter end={state} />
        </div>
        <p className="text-[11px] text-purple-600/70 dark:text-purple-400 mt-1">State & UT targeted</p>
      </motion.div>

      {/* 4. Focus Categories */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 backdrop-blur-md border border-emerald-100/60 dark:border-emerald-900/40 shadow-sm"
      >
        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider font-heading">{t.statsCategories}</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100 font-heading">
          <Counter end={categoryCount} />
        </div>
        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400 mt-1">Health, Education, Farming</p>
      </motion.div>
    </div>
  );
}

