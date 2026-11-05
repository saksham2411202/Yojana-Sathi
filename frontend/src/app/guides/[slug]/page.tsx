"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileCheck2,
  FileText,
  RotateCcw,
  X,
} from "lucide-react";
import { fetchGuideBySlug, GuideDetailData } from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

export default function GuideDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || "");

  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];

  const [guide, setGuide] = useState<GuideDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

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
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchGuideBySlug(slug, lang)
      .then(setGuide)
      .catch((err) => {
        console.error("Guide detail load error:", err);
        setError(err instanceof Error ? err.message : "Guide not found.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lang]);

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Back button */}
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink bg-offwhite-surface dark:bg-offwhite-darkSurface border border-offwhite-border dark:border-offwhite-darkBorder px-3 py-1.5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.guidesTitle}</span>
          </Link>

          {/* Loading State */}
          {loading && (
            <div className="py-20 text-center text-xs text-ink-muted font-medium">
              {t.loading}
            </div>
          )}

          {/* Error State */}
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

          {/* Guide Content */}
          {!loading && guide && (
            <div className="space-y-8">
              {/* Header Box */}
              <div className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {guide.is_sample && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-warm border border-amber-warm/30 uppercase">
                      SAMPLE
                    </span>
                  )}
                  {guide.last_verified && (
                    <span className="text-[11px] text-ink-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{t.lastVerified}: {guide.last_verified}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-ink dark:text-white font-heading">
                  {guide.title}
                </h1>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-2xl">
                  {guide.summary}
                </p>

                {/* Mobile Button to toggle documents sheet */}
                <div className="pt-2 lg:hidden">
                  <button
                    onClick={() => setMobileDocsOpen(true)}
                    className="w-full py-2.5 px-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 text-xs font-bold text-ink dark:text-slate-200 flex items-center justify-center gap-2"
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-warm" />
                    <span>{t.documentsNeeded} ({guide.documents.length})</span>
                  </button>
                </div>
              </div>

              {/* Main 2-column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Vertical Timeline of Numbered Steps */}
                <div className="lg:col-span-8 space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted font-heading">
                    {lang === "hi" ? "चरणबद्ध प्रक्रिया" : "Numbered Step Procedure"}
                  </h2>

                  <div className="space-y-4">
                    {guide.steps.map((st) => (
                      <div
                        key={st.step_number}
                        className="flex items-start gap-4 p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface yojana-card transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl bg-teal-deep text-amber-warm flex items-center justify-center font-black text-sm shrink-0 font-heading">
                          {String(st.step_number).padStart(2, "0")}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h3 className="text-sm font-bold text-ink dark:text-white font-heading">
                            {st.title}
                          </h3>
                          <p className="text-xs text-ink-light dark:text-slate-300 leading-relaxed">
                            {st.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Official Portal Link at bottom */}
                  {guide.official_url && (
                    <div className="pt-4">
                      <a
                        href={guide.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-5 rounded-xl bg-teal-deep text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-teal-800 shadow-xs transition-all"
                      >
                        <span>{t.officialPortalLink}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right: Sticky Documents Side Box (Desktop) */}
                <div className="hidden lg:block lg:col-span-4 sticky top-6 space-y-4">
                  <div className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-offwhite-border dark:border-offwhite-darkBorder">
                      <FileCheck2 className="w-4 h-4 text-amber-warm" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white font-heading">
                        {t.documentsNeeded}
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {guide.documents.length === 0 ? (
                        <p className="text-xs text-ink-muted">No specific documents required.</p>
                      ) : (
                        guide.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/40 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-ink dark:text-white flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-amber-warm shrink-0" />
                                <span>{doc.name}</span>
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                                  doc.is_mandatory
                                    ? "bg-teal-50 text-teal-deep dark:bg-teal-900/40 dark:text-amber-warm"
                                    : "text-ink-muted"
                                }`}
                              >
                                {doc.is_mandatory ? t.mandatory : t.optional}
                              </span>
                            </div>
                            {doc.description && (
                              <p className="text-[11px] text-ink-muted">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer t={t} />
      </div>

      {/* MOBILE BOTTOM SHEET FOR DOCUMENTS */}
      {mobileDocsOpen && guide && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-offwhite-surface dark:bg-offwhite-darkSurface border-t border-offwhite-border dark:border-offwhite-darkBorder rounded-t-2xl max-h-[80vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-offwhite-border">
              <span className="text-xs font-bold uppercase text-ink dark:text-white">
                {t.documentsNeeded} ({guide.documents.length})
              </span>
              <button
                onClick={() => setMobileDocsOpen(false)}
                className="p-1 rounded-md text-ink hover:text-coral"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {guide.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-offwhite-border bg-offwhite/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink dark:text-white">{doc.name}</span>
                    <span className="text-[10px] text-ink-muted uppercase">
                      {doc.is_mandatory ? t.mandatory : t.optional}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-[11px] text-ink-muted">{doc.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
