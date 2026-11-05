"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  CheckCircle,
  ExternalLink,
  FileText,
  GraduationCap,
  HeartPulse,
  Sparkles,
  Tractor,
} from "lucide-react";
import { SchemeCatalogItem } from "@/lib/api";
import { UIStrings } from "@/lib/strings";

interface SchemeCardProps {
  scheme: SchemeCatalogItem;
  t: UIStrings;
  onCheckEligibility: (scheme: SchemeCatalogItem) => void;
}

export function SchemeCard({ scheme, t, onCheckEligibility }: SchemeCardProps) {
  const isCentral = (scheme.level || "central").toLowerCase() === "central";

  // Category Icon helper
  const renderCategoryIcon = (slugs: string[]) => {
    if (slugs.includes("health")) {
      return (
        <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
          <HeartPulse className="w-5 h-5" />
        </div>
      );
    }
    if (slugs.includes("education")) {
      return (
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
          <GraduationCap className="w-5 h-5" />
        </div>
      );
    }
    if (slugs.includes("farming")) {
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Tractor className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
        <Sparkles className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header row: category icon, badges */}
        <div className="flex items-start justify-between gap-3">
          {renderCategoryIcon(scheme.needs)}

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isCentral
                  ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                  : "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900"
              }`}
            >
              {isCentral ? t.centralSchemes : `${t.stateSchemes}${scheme.state ? ` (${scheme.state})` : ""}`}
            </span>

            {scheme.is_sample && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {t.sampleBadge}
              </span>
            )}

            {scheme.last_verified && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <CalendarCheck2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t.freshnessBadge}</span>
              </span>
            )}
          </div>
        </div>

        {/* Title link */}
        <Link href={`/schemes/${scheme.id}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading leading-snug line-clamp-2">
            {scheme.name}
          </h3>
        </Link>

        {/* Bold Benefit Summary */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            {t.benefitLabel}
          </span>
          <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 leading-relaxed">
            {scheme.benefit_summary}
          </p>
        </div>

        {/* Category & Documents tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {scheme.needs.map((slug) => (
              <span
                key={slug}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize"
              >
                {slug}
              </span>
            ))}
          </div>

          <span className="text-[11px] font-medium flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>1+ {t.docsCountLabel}</span>
          </span>
        </div>
      </div>

      {/* Two Buttons: Check eligibility + Apply now */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onCheckEligibility(scheme)}
          className="flex-1 py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{t.checkEligibilityBtn}</span>
        </button>

        {scheme.apply_url ? (
          <a
            href={scheme.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>{t.applyNow}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <Link
            href={`/schemes/${scheme.id}`}
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <span>{t.viewDetails}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
