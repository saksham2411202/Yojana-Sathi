"use client";

import React from "react";
import { RotateCcw, Search, X } from "lucide-react";
import { UIStrings } from "@/lib/strings";

interface StickyFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedNeed: string;
  onNeedChange: (need: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  totalResults: number;
  onClearFilters: () => void;
  t: UIStrings;
}

export function StickyFilterBar({
  searchQuery,
  onSearchChange,
  selectedNeed,
  onNeedChange,
  selectedLevel,
  onLevelChange,
  selectedState,
  onStateChange,
  totalResults,
  onClearFilters,
  t,
}: StickyFilterBarProps) {
  const hasFilters = Boolean(searchQuery || selectedNeed || selectedLevel || selectedState);

  return (
    <div className="sticky top-16 z-30 py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-y border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input + Result count */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium placeholder:text-slate-400 shadow-2xs focus:outline-hidden focus:border-blue-600 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {totalResults} {t.resultCount}
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs no-scrollbar">
          {/* Need Selector */}
          <select
            value={selectedNeed}
            onChange={(e) => onNeedChange(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-2xs focus:outline-hidden"
          >
            <option value="">{t.allNeeds}</option>
            <option value="health">{t.health || "Health"}</option>
            <option value="education">{t.education || "Education"}</option>
            <option value="farming">{t.farming || "Farming"}</option>
          </select>

          {/* Level Selector */}
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-2xs focus:outline-hidden"
          >
            <option value="">{t.allLevels}</option>
            <option value="central">{t.centralSchemes}</option>
            <option value="state">{t.stateSchemes}</option>
          </select>

          {/* State Input / Selector */}
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-2xs focus:outline-hidden"
          >
            <option value="">{t.allStates}</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Bihar">Bihar</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold text-xs shrink-0 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.clearFilters}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

