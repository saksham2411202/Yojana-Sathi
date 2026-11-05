"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Tractor,
  User,
  Users,
  Accessibility,
} from "lucide-react";
import {
  createSession,
  fetchMatches,
  fetchNeeds,
  fetchNextQuestion,
  fetchCatalogStats,
  MatchesData,
  NeedItem,
  NextQuestionData,
  SchemeStatsResponse,
  submitAnswer,
  updateSessionNeeds,
} from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

interface Persona {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: React.ElementType;
  needSlug: string;
}

const PERSONAS: Persona[] = [
  {
    id: "student",
    titleEn: "Student",
    titleHi: "विद्यार्थी / छात्र",
    descEn: "Scholarships, fee waivers & education support",
    descHi: "छात्रवृत्ति, शुल्क छूट एवं अध्ययन सहायता",
    icon: GraduationCap,
    needSlug: "education",
  },
  {
    id: "farmer",
    titleEn: "Farmer",
    titleHi: "किसान",
    descEn: "Input subsidies, crop cover & direct income",
    descHi: "खाद-बीज अनुदान, फसल बीमा व सम्मान निधि",
    icon: Tractor,
    needSlug: "farming",
  },
  {
    id: "senior",
    titleEn: "Senior Citizen",
    titleHi: "वरिष्ठ नागरिक",
    descEn: "Pension schemes, healthcare & concessions",
    descHi: "वृद्धावस्था पेंशन, स्वास्थ्य बीमा व रियायतें",
    icon: User,
    needSlug: "health",
  },
  {
    id: "woman",
    titleEn: "Woman",
    titleHi: "महिला",
    descEn: "Livelihood, maternity aid & welfare grants",
    descHi: "मातृत्व सहायता, स्वरोजगार व सुरक्षा योजनाएं",
    icon: Users,
    needSlug: "health",
  },
  {
    id: "worker",
    titleEn: "Worker",
    titleHi: "श्रमिक / कामगार",
    descEn: "Social security, e-Shram & wage assistance",
    descHi: "श्रमिक कार्ड, बीमा व असंगठित क्षेत्र सहायता",
    icon: Briefcase,
    needSlug: "farming",
  },
  {
    id: "disability",
    titleEn: "Person with Disability",
    titleHi: "दिव्यांगजन",
    descEn: "Assistive aids, monthly pension & allowances",
    descHi: "सहायक उपकरण, विशेष पेंशन व प्रमाण पत्र",
    icon: Accessibility,
    needSlug: "health",
  },
  {
    id: "family",
    titleEn: "Family in Need",
    titleHi: "ज़रूरतमंद परिवार",
    descEn: "Ration support, housing & subsidized health",
    descHi: "राशन, आवास योजना व आयुष्मान कार्ड",
    icon: HeartPulse,
    needSlug: "health",
  },
];

export default function HomePage() {
  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];

  // Stats and category data
  const [stats, setStats] = useState<SchemeStatsResponse | null>(null);
  const [needs, setNeeds] = useState<NeedItem[]>([]);

  // Inline Quick-check state
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [quickSessionId, setQuickSessionId] = useState<string | null>(null);
  const [quickQuestion, setQuickQuestion] = useState<NextQuestionData | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [quickLoading, setQuickLoading] = useState<boolean>(false);
  const [quickResults, setQuickResults] = useState<MatchesData | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("yojana_lang") as Language | null;
    if (saved) setLang(saved);

    Promise.all([fetchCatalogStats(), fetchNeeds(lang)])
      .then(([statsData, needsData]) => {
        setStats(statsData);
        setNeeds(needsData);
      })
      .catch((err) => console.error("Initial load error:", err));
  }, [lang]);

  const handleLanguageToggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    sessionStorage.setItem("yojana_lang", next);
  };

  // Start Quick Check when a persona tile is selected
  const handleSelectPersona = async (persona: Persona) => {
    setSelectedPersona(persona);
    setQuickLoading(true);
    setQuickResults(null);
    setQuestionIndex(0);

    try {
      const session = await createSession(lang);
      setQuickSessionId(session.id);
      sessionStorage.setItem("yojana_session_id", session.id);

      // Map persona to need ID
      const matchedNeed = needs.find((n) => n.slug === persona.needSlug);
      const needIds = matchedNeed ? [matchedNeed.id] : needs.slice(0, 1).map((n) => n.id);
      await updateSessionNeeds(session.id, needIds);

      const q = await fetchNextQuestion(session.id, lang);
      if (q.done) {
        const matches = await fetchMatches(session.id, lang);
        setQuickResults(matches);
      } else {
        setQuickQuestion(q);
        setQuestionIndex(1);
      }
    } catch (err) {
      console.error("Quick check start failed:", err);
    } finally {
      setQuickLoading(false);
    }
  };

  // Handle answering inline quick-check questions
  const handleAnswerQuestion = async (value: unknown, isUnknown: boolean = false) => {
    if (!quickSessionId || !quickQuestion?.profile_field) return;
    setQuickLoading(true);

    try {
      await submitAnswer(quickSessionId, quickQuestion.profile_field, value, isUnknown);

      // Stop after 3 questions max for the quick check
      if (questionIndex >= 3) {
        const matches = await fetchMatches(quickSessionId, lang);
        setQuickResults(matches);
        setQuickQuestion(null);
      } else {
        const nextQ = await fetchNextQuestion(quickSessionId, lang);
        if (nextQ.done) {
          const matches = await fetchMatches(quickSessionId, lang);
          setQuickResults(matches);
          setQuickQuestion(null);
        } else {
          setQuickQuestion(nextQ);
          setQuestionIndex((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("Answer submission failed:", err);
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      {/* Main content shifted right on desktop for sidebar rail */}
      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
          {/* ========================================================= */}
          {/* 1. START WITH YOUR SITUATION / WHO ARE YOU? */}
          {/* ========================================================= */}
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-teal-deep dark:text-amber-warm bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-md border border-teal-deep/20">
                {lang === "hi" ? "त्वरित पात्रता जांच" : "Quick Evaluation"}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-ink dark:text-white font-heading">
                {lang === "hi" ? "अपनी स्थिति से शुरुआत करें।" : "Start with your situation."}
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted dark:text-slate-400 max-w-xl">
                {lang === "hi"
                  ? "नीचे अपनी उपयुक्त श्रेणी चुनें और 3 सरल प्रश्नों में सत्यापित सरकारी योजनाओं की पात्रता देखें।"
                  : "Select the category that best describes your profile for an immediate 3-question eligibility check."}
              </p>
            </div>

            {/* Persona Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {PERSONAS.map((persona) => {
                const Icon = persona.icon;
                const isSelected = selectedPersona?.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`text-left p-4 yojana-card bg-offwhite-surface dark:bg-offwhite-darkSurface border transition-all ${
                      isSelected
                        ? "border-teal-deep dark:border-amber-warm border-l-4 border-l-amber-warm ring-1 ring-amber-warm/40"
                        : "border-offwhite-border dark:border-offwhite-darkBorder hover:border-amber-warm"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/50 text-teal-deep dark:text-amber-warm flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-ink dark:text-white font-heading">
                      {lang === "hi" ? persona.titleHi : persona.titleEn}
                    </h3>
                    <p className="text-[11px] text-ink-muted dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {lang === "hi" ? persona.descHi : persona.descEn}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* INLINE 3-QUESTION QUICK CHECK */}
            {selectedPersona && (
              <div className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-offwhite-border dark:border-offwhite-darkBorder">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-warm animate-pulse" />
                    <span className="text-xs font-bold text-ink dark:text-white font-heading">
                      {lang === "hi"
                        ? `${selectedPersona.titleHi} — प्रश्न ${questionIndex || 1}/3`
                        : `${selectedPersona.titleEn} — Question ${questionIndex || 1} of 3`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPersona(null);
                      setQuickQuestion(null);
                      setQuickResults(null);
                    }}
                    className="text-[11px] text-ink-muted dark:text-slate-400 hover:text-coral transition-colors"
                  >
                    {lang === "hi" ? "रद्द करें" : "Cancel"}
                  </button>
                </div>

                {quickLoading && (
                  <div className="py-8 text-center text-xs text-ink-muted dark:text-slate-400 font-medium animate-pulse">
                    {t.loading}
                  </div>
                )}

                {!quickLoading && quickQuestion && !quickResults && (
                  <div className="space-y-4 max-w-xl">
                    <h4 className="text-sm sm:text-base font-bold text-ink dark:text-white">
                      {quickQuestion.label}
                    </h4>
                    {quickQuestion.help_text && (
                      <p className="text-xs text-ink-muted dark:text-slate-400">
                        {quickQuestion.help_text}
                      </p>
                    )}

                    {/* Options */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {quickQuestion.options?.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswerQuestion(opt)}
                          className="px-4 py-2 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite dark:bg-offwhite-dark hover:border-amber-warm text-xs font-semibold text-ink dark:text-slate-200 transition-all"
                        >
                          {opt}
                        </button>
                      ))}

                      {quickQuestion.input_type === "yes_no" && (
                        <>
                          <button
                            onClick={() => handleAnswerQuestion(true)}
                            className="px-5 py-2 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite dark:bg-offwhite-dark hover:border-teal-deep text-xs font-bold text-ink dark:text-slate-200"
                          >
                            {t.yes}
                          </button>
                          <button
                            onClick={() => handleAnswerQuestion(false)}
                            className="px-5 py-2 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite dark:bg-offwhite-dark hover:border-coral text-xs font-bold text-ink dark:text-slate-200"
                          >
                            {t.no}
                          </button>
                        </>
                      )}

                      {/* "I don't know" button */}
                      <button
                        onClick={() => handleAnswerQuestion(null, true)}
                        className="px-4 py-2 rounded-lg border border-dashed border-offwhite-border dark:border-offwhite-darkBorder bg-transparent hover:bg-offwhite dark:hover:bg-offwhite-dark text-xs text-ink-muted dark:text-slate-400 font-medium transition-all flex items-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{t.dontKnowBtn}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* RESULT STRIP */}
                {!quickLoading && quickResults && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-deep dark:text-amber-warm" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-deep dark:text-amber-warm">
                          {lang === "hi" ? "प्रारंभिक परिणाम तैयार हैं" : "Preliminary Evaluation Ready"}
                        </h4>
                      </div>
                      <Link
                        href="/match"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-deep text-white text-xs font-bold hover:bg-teal-800 transition-all"
                      >
                        <span>{lang === "hi" ? "पूरे परिणाम देखें" : "See full results"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[...quickResults.eligible, ...quickResults.needs_info].slice(0, 4).map((item) => (
                        <Link
                          key={item.id}
                          href={`/schemes/${item.id}`}
                          className="p-3.5 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/40 hover:border-amber-warm flex items-start justify-between gap-2 group transition-all"
                        >
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-ink dark:text-white group-hover:text-amber-warm transition-colors">
                              {item.name}
                            </h5>
                            <p className="text-[11px] text-ink-muted dark:text-slate-400 line-clamp-1">
                              {item.benefit_summary}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-amber-warm shrink-0 mt-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* 2. HORIZONTAL STATS TICKER */}
          {/* ========================================================= */}
          <section className="py-3 px-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface overflow-x-auto">
            <div className="flex items-center justify-between min-w-[580px] text-xs font-bold text-ink dark:text-slate-200 divide-x divide-offwhite-border dark:divide-offwhite-darkBorder">
              <div className="pr-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-deep dark:bg-amber-warm" />
                <span className="text-ink-muted dark:text-slate-400">{t.totalSchemes}:</span>
                <span className="text-sm font-black font-heading text-teal-deep dark:text-amber-warm">
                  {stats?.total || 14}
                </span>
              </div>
              <div className="px-4 flex items-center gap-2">
                <span className="text-ink-muted dark:text-slate-400">{t.centralSchemes}:</span>
                <span className="text-sm font-black font-heading">
                  {stats?.by_level["central"] || 8}
                </span>
              </div>
              <div className="px-4 flex items-center gap-2">
                <span className="text-ink-muted dark:text-slate-400">{t.stateSchemes}:</span>
                <span className="text-sm font-black font-heading">
                  {stats?.by_level["state"] || 6}
                </span>
              </div>
              <div className="pl-4 flex items-center gap-2">
                <span className="text-ink-muted dark:text-slate-400">
                  {lang === "hi" ? "सत्यापित नियम" : "Verified Rules"}:
                </span>
                <span className="text-sm font-black font-heading text-teal-deep dark:text-amber-warm">
                  100%
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. BROWSE BY CATEGORY PILL ROW */}
          {/* ========================================================= */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-slate-400 font-heading">
                {lang === "hi" ? "श्रेणी अनुसार देखें" : "Browse by category"}
              </h2>
              <Link
                href="/schemes"
                className="text-xs font-bold text-teal-deep dark:text-amber-warm hover:underline"
              >
                {lang === "hi" ? "सभी योजनाएं देखें" : "View all schemes"} →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/schemes"
                className="px-4 py-2 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface hover:border-amber-warm text-xs font-bold text-ink dark:text-slate-200 transition-all"
              >
                {t.allNeeds}
              </Link>
              {needs.map((need) => (
                <Link
                  key={need.id}
                  href={`/schemes?need=${need.slug}`}
                  className="px-4 py-2 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface hover:border-amber-warm hover:text-teal-deep dark:hover:text-amber-warm text-xs font-bold text-ink-light dark:text-slate-300 transition-all"
                >
                  {need.label}
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
