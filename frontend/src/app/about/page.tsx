"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, UserX } from "lucide-react";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
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

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-deep dark:text-amber-warm bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-md border border-teal-deep/20">
              {lang === "hi" ? "हमारे बारे में" : "Public Welfare Mission"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-ink dark:text-white font-heading">
              {lang === "hi" ? "योजना साथी का उद्देश्य" : "About Yojana Saathi"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-slate-400 max-w-xl leading-relaxed">
              {lang === "hi"
                ? "योजना साथी एक स्वतंत्र, गैर-व्यावसायिक जनसूचना मंच है जिसका उद्देश्य भारत भर के नागरिकों को पारदर्शी तरीके से सरकारी योजनाओं की जानकारी उपलब्ध कराना है।"
                : "An independent, public directory providing transparent eligibility calculation and structured application guidance for Indian central and state welfare programs."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-2 yojana-card">
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/50 text-teal-deep dark:text-amber-warm flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-ink dark:text-white font-heading">
                Zero Registrations
              </h3>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                No user profiles, phone verification, or logins. You evaluate schemes freely without leaving an electronic trail.
              </p>
            </div>

            <div className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-2 yojana-card">
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/50 text-teal-deep dark:text-amber-warm flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-ink dark:text-white font-heading">
                Official Sources Only
              </h3>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Rules and criteria are mapped from official gazette notifications. Application links route exclusively to authenticated .gov.in portals.
              </p>
            </div>

            <div className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-2 yojana-card">
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/50 text-teal-deep dark:text-amber-warm flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-ink dark:text-white font-heading">
                Deterministic Engine
              </h3>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Pure tri-state logic running locally in your session. No opaque AI guessing or arbitrary scoring.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-4">
            <h3 className="text-sm font-bold text-ink dark:text-white font-heading">
              {lang === "hi" ? "पात्रता जांच शुरू करें" : "Ready to evaluate your eligibility?"}
            </h3>
            <p className="text-xs text-ink-muted">
              {lang === "hi"
                ? "हमारी प्रश्नमाला आपको केवल उन योजनाओं के लिए पूछेगी जो आपके चुने गए क्षेत्रों से मेल खाती हैं।"
                : "Answer a focused questionnaire to evaluate qualifying benefits with zero data collection."}
            </p>
            <Link
              href="/match"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-deep text-white text-xs font-bold hover:bg-teal-800 transition-all"
            >
              <span>{t.checkEligibilityBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
