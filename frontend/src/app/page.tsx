"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Info,
  RefreshCw,
  Tractor,
} from "lucide-react";

import {
  createSession,
  fetchMatches,
  fetchNeeds,
  fetchNextQuestion,
  fetchSchemeDetail,
  MatchesData,
  NeedItem,
  NextQuestionData,
  SchemeDetailData,
  submitAnswer,
  undoLastAnswer,
  updateSessionNeeds,
} from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";

type Step = "language" | "needs" | "question" | "results" | "detail";

export default function HomePage() {
  const [lang, setLang] = useState<Language>("en");
  const [step, setStep] = useState<Step>("language");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Data states
  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<NextQuestionData | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [numberInputValue, setNumberInputValue] = useState<string>("");
  const [stateInputValue, setStateInputValue] = useState<string>("");
  const [matches, setMatches] = useState<MatchesData | null>(null);
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<SchemeDetailData | null>(null);
  const [showIneligible, setShowIneligible] = useState<boolean>(false);

  // UI status
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const t = STRINGS[lang];

  // Try to restore session from sessionStorage on initial load
  useEffect(() => {
    const savedSessionId = sessionStorage.getItem("yojana_session_id");
    const savedLang = sessionStorage.getItem("yojana_lang") as Language | null;

    if (savedLang) {
      setLang(savedLang);
    }

    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  const saveSession = (id: string, language: Language) => {
    setSessionId(id);
    sessionStorage.setItem("yojana_session_id", id);
    sessionStorage.setItem("yojana_lang", language);
  };

  const clearSession = () => {
    setSessionId(null);
    setSelectedNeeds([]);
    setCurrentQuestion(null);
    setMatches(null);
    setSelectedSchemeDetail(null);
    setQuestionCount(1);
    setNumberInputValue("");
    setStateInputValue("");
    sessionStorage.removeItem("yojana_session_id");
    setStep("language");
  };

  // ─── Step 1: Handle Language Selection ────────────────────────────────────
  const handleSelectLanguage = async (selectedLang: Language) => {
    setLang(selectedLang);
    setLoading(true);
    setError(null);

    try {
      const session = await createSession(selectedLang);
      saveSession(session.id, selectedLang);

      const needsData = await fetchNeeds(selectedLang);
      setNeeds(needsData);
      setStep("needs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Handle Needs Submit ──────────────────────────────────────────
  const toggleNeed = (id: number) => {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinueNeeds = async () => {
    if (!sessionId || selectedNeeds.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      await updateSessionNeeds(sessionId, selectedNeeds);
      const q = await fetchNextQuestion(sessionId, lang);
      if (q.done) {
        await loadResults(sessionId);
      } else {
        setCurrentQuestion(q);
        setQuestionCount(1);
        setNumberInputValue("");
        setStateInputValue("");
        setStep("question");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Handle Questions ─────────────────────────────────────────────
  const handleAnswer = async (value: unknown, unknown = false) => {
    if (!sessionId || !currentQuestion?.profile_field) return;
    setLoading(true);
    setError(null);

    try {
      await submitAnswer(sessionId, currentQuestion.profile_field, value, unknown);
      const nextQ = await fetchNextQuestion(sessionId, lang);

      if (nextQ.done) {
        await loadResults(sessionId);
      } else {
        setCurrentQuestion(nextQ);
        setQuestionCount((c) => c + 1);
        setNumberInputValue("");
        setStateInputValue("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    try {
      await undoLastAnswer(sessionId);
      const q = await fetchNextQuestion(sessionId, lang);

      if (q.done) {
        // If it was already done, stay on question or go back
        setStep("needs");
      } else {
        setCurrentQuestion(q);
        setQuestionCount((c) => Math.max(1, c - 1));
        setNumberInputValue("");
        setStateInputValue("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 4: Handle Results ───────────────────────────────────────────────
  const loadResults = async (sId: string) => {
    setLoading(true);
    try {
      const matchData = await fetchMatches(sId, lang);
      setMatches(matchData);
      setStep("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 5: Handle Scheme Detail ─────────────────────────────────────────
  const handleViewSchemeDetail = async (schemeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchSchemeDetail(schemeId, lang);
      setSelectedSchemeDetail(detail);
      setStep("detail");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const renderNeedIcon = (icon: string) => {
    switch (icon) {
      case "heart-pulse":
        return <HeartPulse className="w-10 h-10 text-rose-600" />;
      case "graduation-cap":
        return <GraduationCap className="w-10 h-10 text-indigo-600" />;
      case "tractor":
        return <Tractor className="w-10 h-10 text-emerald-600" />;
      default:
        return <HelpCircle className="w-10 h-10 text-slate-600" />;
    }
  };

  // ─── Screen: Loading & Error States ───────────────────────────────────────
  if (loading && !currentQuestion && !matches && !needs.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-700">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-blue-900">{t.appTitle}</h1>
        {step !== "language" && (
          <button
            onClick={clearSession}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100"
          >
            {t.restart}
          </button>
        )}
      </header>

      {/* Error alert if any */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 font-bold text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Screen 1: Language Picker ───────────────────────────────────── */}
      {step === "language" && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Choose Language / भाषा चुनें
            </h2>
            <p className="text-sm text-slate-600">{t.selectLanguageSubtitle}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSelectLanguage("en")}
              className="w-full min-h-[64px] py-4 px-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/50 shadow-sm flex items-center justify-between text-left transition-all active:scale-[0.98]"
            >
              <div>
                <span className="text-xl font-bold text-slate-900 block">English</span>
                <span className="text-xs text-slate-500">Continue in English</span>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400" />
            </button>

            <button
              onClick={() => handleSelectLanguage("hi")}
              className="w-full min-h-[64px] py-4 px-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/50 shadow-sm flex items-center justify-between text-left transition-all active:scale-[0.98]"
            >
              <div>
                <span className="text-xl font-bold text-slate-900 block">हिन्दी</span>
                <span className="text-xs text-slate-500">हिन्दी में जारी रखें</span>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Screen 2: Needs Grid ────────────────────────────────────────── */}
      {step === "needs" && (
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">{t.selectNeedsTitle}</h2>
            <p className="text-sm text-slate-600">{t.selectNeedsSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 mb-8">
            {needs.map((item) => {
              const isSelected = selectedNeeds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleNeed(item.id)}
                  className={`min-h-[76px] p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all active:scale-[0.98] ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0">
                    {renderNeedIcon(item.icon)}
                  </div>
                  <div className="flex-1">
                    <span className="text-base font-semibold text-slate-900 block leading-snug">
                      {item.label}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4">
            <button
              disabled={selectedNeeds.length === 0 || loading}
              onClick={handleContinueNeeds}
              className="w-full min-h-[52px] py-3.5 px-6 rounded-xl bg-blue-600 text-white font-semibold text-base shadow-md hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t.continueBtn}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Screen 3: Question Screen ───────────────────────────────────── */}
      {step === "question" && currentQuestion && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Top Back & Progress bar */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg bg-slate-100 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {t.questionProgress} #{questionCount}
              </span>
            </div>

            {/* Question Label */}
            <h2 className="text-xl font-bold text-slate-900 leading-snug mb-2">
              {currentQuestion.label}
            </h2>

            {currentQuestion.help_text && (
              <p className="text-sm text-slate-500 mb-6 flex items-start gap-1.5">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{currentQuestion.help_text}</span>
              </p>
            )}

            {/* Input Controls */}
            <div className="mt-6 space-y-3">
              {/* YES / NO */}
              {currentQuestion.input_type === "yes_no" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="min-h-[64px] py-4 px-6 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-600 hover:bg-emerald-50 text-slate-900 font-bold text-lg active:scale-95 transition-all shadow-sm"
                  >
                    {t.yes}
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="min-h-[64px] py-4 px-6 rounded-xl border-2 border-slate-200 bg-white hover:border-rose-600 hover:bg-rose-50 text-slate-900 font-bold text-lg active:scale-95 transition-all shadow-sm"
                  >
                    {t.no}
                  </button>
                </div>
              )}

              {/* SINGLE CHOICE OPTIONS */}
              {currentQuestion.input_type === "single_choice" &&
                currentQuestion.options && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="w-full min-h-[56px] py-3.5 px-5 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50 text-slate-900 font-semibold text-left flex items-center justify-between active:scale-95 transition-all shadow-sm"
                      >
                        <span className="capitalize">{opt}</span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

              {/* NUMBER INPUT */}
              {currentQuestion.input_type === "number" && (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={numberInputValue}
                    onChange={(e) => setNumberInputValue(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full min-h-[56px] py-3 px-4 rounded-xl border-2 border-slate-300 text-slate-900 text-xl font-semibold focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                  <button
                    disabled={!numberInputValue.trim() || loading}
                    onClick={() => handleAnswer(Number(numberInputValue))}
                    className="w-full min-h-[52px] py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold text-base shadow hover:bg-blue-700 disabled:opacity-40 transition-all"
                  >
                    {t.submitBtn}
                  </button>
                </div>
              )}

              {/* STATE PICKER */}
              {currentQuestion.input_type === "state_picker" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={stateInputValue}
                    onChange={(e) => setStateInputValue(e.target.value)}
                    placeholder="Enter state name (e.g. Delhi, Punjab)"
                    className="w-full min-h-[56px] py-3 px-4 rounded-xl border-2 border-slate-300 text-slate-900 text-lg font-semibold focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                  <button
                    disabled={!stateInputValue.trim() || loading}
                    onClick={() => handleAnswer(stateInputValue.trim())}
                    className="w-full min-h-[52px] py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold text-base shadow hover:bg-blue-700 disabled:opacity-40 transition-all"
                  >
                    {t.submitBtn}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* "I DON'T KNOW" ALWAYS VISIBLE */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleAnswer(null, true)}
              className="w-full min-h-[50px] py-3 px-4 rounded-xl border border-slate-300 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>{t.dontKnowBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Screen 4: Results ───────────────────────────────────────────── */}
      {step === "results" && matches && (
        <div className="flex-1 flex flex-col space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">{t.resultsTitle}</h2>
          </div>

          {/* Section: You Qualify */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {t.eligibleTitle} ({matches.eligible.length})
              </h3>
            </div>

            {matches.eligible.length === 0 ? (
              <p className="text-sm text-slate-500 italic bg-white p-4 rounded-xl border border-slate-200">
                {t.noEligibleSchemes}
              </p>
            ) : (
              <div className="space-y-3.5">
                {matches.eligible.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-white border-2 border-emerald-500 shadow-sm space-y-3"
                  >
                    {/* Benefit shown first */}
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-800 uppercase block mb-0.5">
                        {t.benefitLabel}
                      </span>
                      <p className="text-sm font-semibold text-emerald-950">
                        {s.benefit_summary}
                      </p>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {s.name}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      {s.last_verified && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {t.lastVerified}: {s.last_verified}
                        </span>
                      )}
                      {s.source_url && (
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <span>{t.sourceLink}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewSchemeDetail(s.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: You May Qualify */}
          {matches.needs_info.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  {t.needsInfoTitle} ({matches.needs_info.length})
                </h3>
              </div>

              <div className="space-y-3.5">
                {matches.needs_info.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-3"
                  >
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100">
                      <span className="text-xs font-bold text-amber-800 uppercase block mb-0.5">
                        {t.benefitLabel}
                      </span>
                      <p className="text-sm font-semibold text-amber-950">
                        {s.benefit_summary}
                      </p>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {s.name}
                    </h4>

                    <button
                      onClick={() => handleViewSchemeDetail(s.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition-all"
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Ineligible Toggle */}
          {matches.not_eligible.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setShowIneligible(!showIneligible)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-between"
              >
                <span>{showIneligible ? t.hideNotEligible : t.showNotEligible}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showIneligible ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showIneligible && (
                <div className="mt-3 space-y-3">
                  {matches.not_eligible.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl bg-slate-100/60 border border-slate-200 text-slate-600"
                    >
                      <h4 className="text-sm font-bold text-slate-800">{s.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{s.benefit_summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Screen 5: Scheme Detail Modal/Screen ────────────────────────── */}
      {step === "detail" && selectedSchemeDetail && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-5">
            <button
              onClick={() => setStep("results")}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg bg-slate-100 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backBtn}</span>
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {selectedSchemeDetail.name}
              </h2>
              {selectedSchemeDetail.ministry && (
                <p className="text-xs text-slate-500 mt-1">
                  {selectedSchemeDetail.ministry}
                </p>
              )}
            </div>

            {/* Benefit Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">
                {t.benefitLabel}
              </span>
              <p className="text-base font-semibold text-emerald-950">
                {selectedSchemeDetail.benefit_summary}
              </p>
            </div>

            {/* Documents List */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                {t.documentsTitle}
              </h3>

              {selectedSchemeDetail.documents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No specific documents listed.</p>
              ) : (
                <div className="space-y-3">
                  {selectedSchemeDetail.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {doc.document_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            doc.is_mandatory
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {doc.is_mandatory ? t.mandatory : t.optional}
                        </span>
                      </div>
                      {doc.where_to_obtain && (
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-600">
                            {t.whereToObtain}:
                          </span>{" "}
                          {doc.where_to_obtain}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* External Source Link */}
          {selectedSchemeDetail.source_url && (
            <div className="mt-8 pt-4 border-t border-slate-200">
              <a
                href={selectedSchemeDetail.source_url}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>{t.sourceLink}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
