"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  RotateCcw,
  Search,
} from "lucide-react";
import { FAQItemData, fetchFaqs } from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

export default function FAQsPage() {
  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];

  const [faqs, setFaqs] = useState<FAQItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

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
    fetchFaqs(lang)
      .then((data) => {
        setFaqs(data);
        // Expand first two by default
        if (data.length > 0) {
          setExpandedIds(data.slice(0, 2).map((d) => d.id));
        }
      })
      .catch((err) => {
        console.error("FAQs fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load FAQs.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: "all", labelEn: "All Questions", labelHi: "सभी प्रश्न" },
    { id: "eligibility", labelEn: "Eligibility & Logic", labelHi: "पात्रता एवं नियम" },
    { id: "documents", labelEn: "Documents & Proofs", labelHi: "दस्तावेज़ एवं प्रमाण" },
    { id: "application", labelEn: "Application & Portals", labelHi: "आवेदन प्रक्रिया" },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = selectedCat === "all" || f.category === selectedCat;
    if (!search.trim()) return matchesCat;
    const q = search.toLowerCase().trim();
    const text = `${f.question} ${f.answer}`.toLowerCase();
    return matchesCat && text.includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-deep dark:text-amber-warm bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-md border border-teal-deep/20">
              {lang === "hi" ? "सत्यापित प्रश्नोत्तरी" : "Knowledge Base"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white font-heading">
              {lang === "hi" ? "प्रश्नोत्तरी एवं स्पष्टीकरण" : "Questions & Clarifications"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-slate-400">
              {lang === "hi"
                ? "पात्रता मूल्यांकन, आवश्यक दस्तावेज़ों और आधिकारिक आवेदन प्रक्रिया से जुड़े मुख्य प्रश्न।"
                : "Straightforward answers concerning eligibility rules, documents, and application standards."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "hi" ? "प्रश्नों में खोजें..." : "Filter questions by keyword..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs text-ink dark:text-slate-200 focus:outline-hidden focus:border-amber-warm"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCat === c.id
                    ? "bg-teal-deep text-white shadow-xs"
                    : "border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-ink-light dark:text-slate-300 hover:border-amber-warm"
                }`}
              >
                {lang === "hi" ? c.labelHi : c.labelEn}
              </button>
            ))}
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

          {/* Grouped Section Cards with Expandable Items */}
          {!loading && !error && filteredFaqs.length === 0 && (
            <div className="p-8 text-center rounded-card border border-offwhite-border bg-offwhite-surface text-xs text-ink-muted">
              {lang === "hi" ? "कोई संबंधित प्रश्न नहीं मिला।" : "No questions matched your search query."}
            </div>
          )}

          {!loading && !error && filteredFaqs.length > 0 && (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedIds.includes(faq.id);
                return (
                  <div
                    key={faq.id}
                    className="p-4 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface yojana-card space-y-2 transition-all"
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full flex items-start justify-between gap-3 text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-offwhite dark:bg-offwhite-dark border border-offwhite-border dark:border-offwhite-darkBorder text-ink-muted">
                            {faq.category}
                          </span>
                          {faq.is_sample && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded-sm bg-amber-50 text-amber-warm border border-amber-warm/30 uppercase">
                              SAMPLE
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-ink dark:text-white font-heading">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted shrink-0 mt-1 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <p className="text-xs text-ink-light dark:text-slate-300 pt-2 border-t border-offwhite-border/60 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
