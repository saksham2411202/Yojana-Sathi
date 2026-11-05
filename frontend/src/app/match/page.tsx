"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  RefreshCw,
  Tractor,
} from "lucide-react";
import {
  ChecklistItem,
  createSession,
  fetchChecklist,
  fetchMatches,
  fetchNeeds,
  fetchNextQuestion,
  fetchSchemeDetail,
  getExportPdfUrl,
  MatchesData,
  NeedItem,
  NextQuestionData,
  SchemeDetailData,
  submitAnswer,
  undoLastAnswer,
  updateSessionNeeds,
} from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

type Step = "language" | "needs" | "question" | "results" | "detail";

export default function MatchPage() {
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
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const t = STRINGS[lang];

  useEffect(() => {
    const savedSessionId = sessionStorage.getItem("yojana_session_id");
    const savedLang = sessionStorage.getItem("yojana_lang") as Language | null;

    if (savedLang) {
      setLang(savedLang);
    }

    if (savedSessionId) {
      setSessionId(savedSessionId);
      const effectiveLang = savedLang || "en";
      setLoading(true);
      fetchNextQuestion(savedSessionId, effectiveLang)
        .then((q) => {
          if (q.done) {
            loadResults(savedSessionId, effectiveLang);
          } else {
            setCurrentQuestion(q);
            setStep("question");
          }
        })
        .catch(() => {
          sessionStorage.removeItem("yojana_session_id");
          setSessionId(null);
          setStep("language");
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSession = (id: string, language: Language) => {
    setSessionId(id);
    sessionStorage.setItem("yojana_session_id", id);
    sessionStorage.setItem("yojana_lang", language);
  };

  const clearSession = () => {
    sessionStorage.removeItem("yojana_session_id");
    setSessionId(null);
    setSelectedNeeds([]);
    setCurrentQuestion(null);
    setMatches(null);
    setSelectedSchemeDetail(null);
    setChecklist([]);
    setStep("language");
  };

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
        setStep("question");
        setQuestionCount(1);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (value: unknown, isUnknown: boolean = false) => {
    if (!sessionId || !currentQuestion?.profile_field) return;
    setLoading(true);
    setError(null);

    try {
      await submitAnswer(sessionId, currentQuestion.profile_field, value, isUnknown);
      const nextQ = await fetchNextQuestion(sessionId, lang);
      if (nextQ.done) {
        await loadResults(sessionId);
      } else {
        setCurrentQuestion(nextQ);
        setQuestionCount((prev) => prev + 1);
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
      const prevQ = await fetchNextQuestion(sessionId, lang);
      if (!prevQ.done) {
        setCurrentQuestion(prevQ);
        setQuestionCount((prev) => Math.max(1, prev - 1));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (sid: string, currentLang: Language = lang) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchMatches(sid, currentLang);
      setMatches(results);
      try {
        const cl = await fetchChecklist(sid, currentLang);
        setChecklist(cl.documents);
      } catch (e) {
        console.error("Failed to load checklist", e);
      }
      setStep("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (schemeId: number) => {
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

  const handleLanguageToggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    sessionStorage.setItem("yojana_lang", next);
    if (step === "results" && sessionId) {
      loadResults(sessionId, next);
    }
  };

  const renderNeedIcon = (icon: string) => {
    switch (icon) {
      case "heart-pulse":
        return <HeartPulse className="w-8 h-8 text-rose-600" />;
      case "graduation-cap":
        return <GraduationCap className="w-8 h-8 text-indigo-600" />;
      case "tractor":
        return <Tractor className="w-8 h-8 text-emerald-600" />;
      default:
        return <HelpCircle className="w-8 h-8 text-ink-muted" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-2xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-offwhite-border dark:border-offwhite-darkBorder">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-deep dark:bg-amber-warm" />
              <h1 className="text-sm font-black uppercase tracking-wider text-ink dark:text-white font-heading">
                {t.guidedFlow}
              </h1>
            </div>

            {step !== "language" && (
              <button
                onClick={clearSession}
                className="text-xs font-semibold text-ink-muted hover:text-coral transition-colors"
              >
                {t.restart}
              </button>
            )}
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3.5 rounded-card border border-coral/30 bg-coral-50 text-coral text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-xs font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SCREEN 1: LANGUAGE SELECTION */}
          {step === "language" && (
            <div className="space-y-6 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-ink dark:text-white font-heading">
                  {t.selectLanguage}
                </h2>
                <p className="text-xs text-ink-muted">
                  {t.selectLanguageSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => handleSelectLanguage("en")}
                  className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface hover:border-amber-warm yojana-card text-center space-y-1 transition-all"
                >
                  <div className="text-base font-black text-ink dark:text-white font-heading">
                    English
                  </div>
                  <div className="text-xs text-ink-muted">English</div>
                </button>

                <button
                  onClick={() => handleSelectLanguage("hi")}
                  className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface hover:border-amber-warm yojana-card text-center space-y-1 transition-all"
                >
                  <div className="text-base font-black text-ink dark:text-white font-hindi">
                    हिन्दी
                  </div>
                  <div className="text-xs text-ink-muted">Hindi</div>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: NEEDS SELECTION */}
          {step === "needs" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-ink dark:text-white font-heading">
                  {t.selectNeedsTitle}
                </h2>
                <p className="text-xs text-ink-muted">
                  {t.selectNeedsSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {needs.map((item) => {
                  const isSelected = selectedNeeds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleNeed(item.id)}
                      className={`p-4 rounded-card border text-left yojana-card transition-all ${
                        isSelected
                          ? "border-teal-deep dark:border-amber-warm border-l-4 border-l-amber-warm bg-offwhite-surface dark:bg-offwhite-darkSurface"
                          : "border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface hover:border-amber-warm"
                      }`}
                    >
                      <div className="mb-2">{renderNeedIcon(item.icon)}</div>
                      <div className="text-xs font-bold text-ink dark:text-white">
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                disabled={selectedNeeds.length === 0 || loading}
                onClick={handleContinueNeeds}
                className="w-full py-3 px-4 rounded-xl bg-teal-deep text-white font-bold text-xs hover:bg-teal-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t.continueBtn}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* SCREEN 3: QUESTIONS */}
          {step === "question" && currentQuestion && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backBtn}</span>
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {t.questionProgress} #{questionCount}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-ink dark:text-white font-heading">
                  {currentQuestion.label}
                </h2>
                {currentQuestion.help_text && (
                  <p className="text-xs text-ink-muted">
                    {currentQuestion.help_text}
                  </p>
                )}
              </div>

              {/* Question Controls */}
              <div className="space-y-3">
                {currentQuestion.input_type === "yes_no" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAnswer(true)}
                      className="py-3 px-4 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs font-bold hover:border-teal-deep text-teal-deep transition-all"
                    >
                      {t.yes}
                    </button>
                    <button
                      onClick={() => handleAnswer(false)}
                      className="py-3 px-4 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs font-bold hover:border-coral text-coral transition-all"
                    >
                      {t.no}
                    </button>
                  </div>
                )}

                {currentQuestion.input_type === "single_choice" && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="w-full py-2.5 px-4 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs font-medium text-left hover:border-amber-warm flex items-center justify-between transition-all"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.input_type === "number" && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={numberInputValue}
                      onChange={(e) => setNumberInputValue(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full py-2.5 px-3 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs text-ink dark:text-white focus:outline-hidden focus:border-amber-warm"
                    />
                    <button
                      disabled={!numberInputValue.trim() || loading}
                      onClick={() => handleAnswer(Number(numberInputValue))}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-deep text-white text-xs font-bold hover:bg-teal-800 disabled:opacity-40 transition-all"
                    >
                      {t.submitBtn}
                    </button>
                  </div>
                )}

                {currentQuestion.input_type === "state_picker" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={stateInputValue}
                      onChange={(e) => setStateInputValue(e.target.value)}
                      placeholder="State name..."
                      className="w-full py-2.5 px-3 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs text-ink dark:text-white focus:outline-hidden focus:border-amber-warm"
                    />
                    <button
                      disabled={!stateInputValue.trim() || loading}
                      onClick={() => handleAnswer(stateInputValue.trim())}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-deep text-white text-xs font-bold hover:bg-teal-800 disabled:opacity-40 transition-all"
                    >
                      {t.submitBtn}
                    </button>
                  </div>
                )}

                {/* "I don't know" button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleAnswer(null, true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-offwhite-border dark:border-offwhite-darkBorder text-xs text-ink-muted hover:bg-offwhite dark:hover:bg-offwhite-dark flex items-center justify-center gap-1.5 transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t.dontKnowBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: RESULTS */}
          {step === "results" && matches && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-offwhite-border dark:border-offwhite-darkBorder">
                <h2 className="text-base sm:text-lg font-black text-ink dark:text-white font-heading">
                  {t.resultsTitle}
                </h2>
                {sessionId && (
                  <a
                    href={getExportPdfUrl(sessionId, lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-deep text-white text-xs font-bold hover:bg-teal-800 transition-all self-start"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadPdfBtn}</span>
                  </a>
                )}
              </div>

              {/* Qualifying Schemes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                    {t.eligibleTitle} ({matches.eligible.length})
                  </h3>
                </div>

                {matches.eligible.length === 0 ? (
                  <p className="text-xs text-ink-muted p-4 rounded-card border border-offwhite-border bg-offwhite-surface">
                    {t.noEligibleSchemes}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {matches.eligible.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 rounded-card border border-emerald-300 dark:border-emerald-800 bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-ink dark:text-white font-heading">
                            {s.name}
                          </h4>
                          <button
                            onClick={() => handleViewDetail(s.id)}
                            className="text-xs font-bold text-teal-deep dark:text-amber-warm hover:underline"
                          >
                            {t.viewDetails} →
                          </button>
                        </div>
                        <p className="text-xs text-ink-muted">
                          <span className="font-semibold text-ink dark:text-slate-300">{t.benefitLabel}:</span>{" "}
                          {s.benefit_summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Needs Info Schemes */}
              {matches.needs_info.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-warm" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                      {t.needsInfoTitle} ({matches.needs_info.length})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {matches.needs_info.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 rounded-card border border-amber-warm/40 bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-ink dark:text-white font-heading">
                            {s.name}
                          </h4>
                          <button
                            onClick={() => handleViewDetail(s.id)}
                            className="text-xs font-bold text-teal-deep dark:text-amber-warm hover:underline"
                          >
                            {t.viewDetails} →
                          </button>
                        </div>
                        <p className="text-xs text-ink-muted">
                          {s.benefit_summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              {checklist.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-warm" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                      {t.checklistTitle} ({checklist.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {checklist.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-ink dark:text-white">{doc.document_name}</span>
                        <span className="text-[10px] text-ink-muted">
                          {doc.is_mandatory ? t.mandatory : t.optional}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ineligible Toggle */}
              {matches.not_eligible.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowIneligible((prev) => !prev)}
                    className="text-xs font-bold text-ink-muted hover:text-ink flex items-center gap-1"
                  >
                    <span>{showIneligible ? t.hideNotEligible : t.showNotEligible}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showIneligible ? "rotate-180" : ""}`} />
                  </button>

                  {showIneligible && (
                    <div className="space-y-2 pt-3">
                      {matches.not_eligible.map((s) => (
                        <div
                          key={s.id}
                          className="p-3.5 rounded-card border border-coral/30 bg-coral-50/50 dark:bg-coral/10 text-xs space-y-1"
                        >
                          <h4 className="font-bold text-coral">{s.name}</h4>
                          <p className="text-ink-muted">{s.benefit_summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SCREEN 5: SCHEME DETAIL */}
          {step === "detail" && selectedSchemeDetail && (
            <div className="space-y-6">
              <button
                onClick={() => setStep("results")}
                className="flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to results</span>
              </button>

              <div className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-ink dark:text-white font-heading">
                    {selectedSchemeDetail.name}
                  </h2>
                  <p className="text-xs text-ink-muted">
                    {selectedSchemeDetail.benefit_summary}
                  </p>
                </div>

                {selectedSchemeDetail.documents.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-offwhite-border dark:border-offwhite-darkBorder">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {t.documentsTitle}
                    </h3>
                    <div className="space-y-1.5">
                      {selectedSchemeDetail.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-2.5 rounded-lg border border-offwhite-border bg-offwhite/50 text-xs flex items-center justify-between"
                        >
                          <span>{doc.document_name}</span>
                          <span className="text-[10px] font-bold text-ink-muted">
                            {doc.is_mandatory ? t.mandatory : t.optional}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSchemeDetail.source_url && (
                  <div className="pt-2">
                    <a
                      href={selectedSchemeDetail.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-deep text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-teal-800 transition-all"
                    >
                      <span>{t.sourceLink}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
