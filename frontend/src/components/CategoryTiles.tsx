"use client";

import React from "react";
import { GraduationCap, HeartPulse, Sparkles, Tractor } from "lucide-react";
import { UIStrings } from "@/lib/strings";

interface CategoryTilesProps {
  selectedNeed: string;
  onSelectNeed: (need: string) => void;
  t: UIStrings;
}

export function CategoryTiles({ selectedNeed, onSelectNeed, t }: CategoryTilesProps) {
  const categories = [
    {
      id: "",
      name: t.allNeeds,
      icon: Sparkles,
      color: "from-blue-600 to-indigo-600",
      activeBg: "bg-blue-600 text-white shadow-md shadow-blue-500/20",
      countLabel: "All sectors",
    },
    {
      id: "health",
      name: t.health || "Health",
      icon: HeartPulse,
      color: "from-rose-500 to-pink-600",
      activeBg: "bg-rose-600 text-white shadow-md shadow-rose-500/20",
      countLabel: "Medical & care",
    },
    {
      id: "education",
      name: t.education || "Education",
      icon: GraduationCap,
      color: "from-indigo-500 to-violet-600",
      activeBg: "bg-indigo-600 text-white shadow-md shadow-indigo-500/20",
      countLabel: "Scholarships & aid",
    },
    {
      id: "farming",
      name: t.farming || "Farming",
      icon: Tractor,
      color: "from-emerald-500 to-teal-600",
      activeBg: "bg-emerald-600 text-white shadow-md shadow-emerald-500/20",
      countLabel: "Agriculture & seeds",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedNeed === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectNeed(cat.id)}
            className={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 border flex flex-col justify-between active:scale-[0.98] ${
              isSelected
                ? `${cat.activeBg} border-transparent`
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black font-heading tracking-tight leading-snug">
                {cat.name}
              </h4>
              <p
                className={`text-[11px] mt-0.5 ${
                  isSelected ? "text-white/80" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {cat.countLabel}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

