"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Language, STRINGS } from "@/lib/strings";

interface PlaceholderPageProps {
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
}

export function PlaceholderPage({
  titleEn,
  titleHi,
  subtitleEn,
  subtitleHi,
}: PlaceholderPageProps) {
  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];

  useEffect(() => {
    const saved = sessionStorage.getItem("yojana_lang") as Language | null;
    if (saved) setLang(saved);
  }, []);

  const handleLanguageToggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    sessionStorage.setItem("yojana_lang", next);
  };

  const title = lang === "en" ? titleEn : titleHi;
  const subtitle = lang === "en" ? subtitleEn : subtitleHi;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-emerald-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center items-center text-center">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-xl max-w-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider inline-block">
              Coming Soon / जल्द आ रहा है
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "Back to Home" : "मुख्य पृष्ठ पर जाएं"}</span>
            </Link>

            <Link
              href="/schemes"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "Explore Schemes" : "योजनाएं देखें"}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer t={t} />
    </div>
  );
}

