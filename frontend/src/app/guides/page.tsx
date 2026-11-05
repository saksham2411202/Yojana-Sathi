"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  RotateCcw,
  Search,
} from "lucide-react";
import { fetchGuides, GuideListItemData } from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

export default function GuidesDirectoryPage() {
  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];

  const [guides, setGuides] = useState<GuideListItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("yojana_lang") as Language | null;
    if (saved) setLang(saved);
  }, []);

  const handleLanguageToggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    sessionStorage.setItem("yojana_lang", next);
  };

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchGuides(lang)
      .then(setGuides)
      .catch((err) => {
        console.error("Guides load failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load guides.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const filteredGuides = guides.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      g.title.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-deep dark:text-amber-warm bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-md border border-teal-deep/20">
              {lang === "hi" ? "आधिकारिक मार्गदर्शिका" : "Step-by-Step Instructions"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white font-heading">
              {t.guidesTitle}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-slate-400 max-w-xl">
              {t.guidesSubtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchGuides}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs text-ink dark:text-slate-200 focus:outline-hidden focus:border-amber-warm"
            />
          </div>

          {/* State Handling */}
          {loading && (
            <div className="py-16 text-center text-xs text-ink-muted font-medium">
              {t.loading}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-card border border-coral/30 bg-coral-50 text-coral text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={loadData}
                className="flex items-center gap-1 font-bold underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.errorRetry}</span>
              </button>
            </div>
          )}

          {/* Card List */}
          {!loading && !error && filteredGuides.length === 0 && (
            <div className="p-8 text-center rounded-card border border-offwhite-border bg-offwhite-surface text-xs text-ink-muted">
              {t.noGuidesFound}
            </div>
          )}

          {!loading && !error && filteredGuides.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface yojana-card flex flex-col justify-between space-y-3 group transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-deep dark:text-amber-warm flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      {guide.is_sample && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-warm border border-amber-warm/30 uppercase">
                          SAMPLE
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-ink dark:text-white font-heading group-hover:text-amber-warm transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-ink-muted dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-offwhite-border/60 dark:border-offwhite-darkBorder flex items-center justify-between text-xs">
                    {guide.last_verified ? (
                      <span className="text-[11px] text-ink-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{t.lastVerified}: {guide.last_verified}</span>
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="font-bold text-teal-deep dark:text-amber-warm flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{t.viewDetails}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
