"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, Search, X } from "lucide-react";
import { fetchCatalogSchemes, SchemeCatalogItem } from "@/lib/api";
import { UIStrings } from "@/lib/strings";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  t: UIStrings;
}

export function CommandPalette({ isOpen, onClose, lang, t }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchemeCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchCatalogSchemes({ q: query.trim() || undefined, page_size: 6, lang })
        .then((res) => setResults(res.items))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t?.searchPlaceholder || "Search schemes across India (e.g. Health, Farmer, Scholarship)..."}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1.5">
          {loading && (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              Searching official schemes...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching schemes found. Try keywords like health, student, or farmer.
            </div>
          )}

          {!loading &&
            results.map((s) => (
              <Link
                key={s.id}
                href={`/schemes/${s.id}`}
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {s.level}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {s.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {s.benefit_summary}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1" />
              </Link>
            ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between px-4">
          <span>{results.length} schemes displayed</span>
          <Link
            href="/match"
            onClick={onClose}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t?.checkEligibilityBtn || "Check My Eligibility"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
