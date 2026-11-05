"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  checkSchemeEligibility,
  fetchSchemeDetail,
  NextQuestionData,
  SchemeCheckResponse,
  SchemeDetailData,
} from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

export default function SchemeDetailPage() {
  const params = useParams();
  const schemeId = Number(params?.id);

  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];

  const [scheme, setScheme] = useState<SchemeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"eligibility" | "documents" | "apply">("eligibility");

  // "Do I qualify?" inline stepper state
  const [checkResult, setCheckResult] = useState<SchemeCheckResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  useEffect(() => {
    const savedLang = sessionStorage.getItem("yojana_lang") as Language | null;
    if (savedLang) setLang(savedLang);
  }, []);

  const handleLanguageToggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    sessionStorage.setItem("yojana_lang", next);
  };

  const loadSchemeData = useCallback(() => {
    if (!schemeId) return;
    setLoading(true);
    setError(null);
    fetchSchemeDetail(schemeId, lang)
      .then((data) => setScheme(data))
      .catch((err) => {
        console.error("Scheme fetch error:", err);
        setError(err instanceof Error ? err.message : "Cannot reach the server.");
      })
      .finally(() => setLoading(false));
  }, [schemeId, lang]);

  useEffect(() => {
    loadSchemeData();
  }, [loadSchemeData]);

  // Initial qualification check
  useEffect(() => {
    if (!schemeId) return;
    let stored: Record<string, unknown> = {};
    const raw = sessionStorage.getItem("yojana_answers");
    if (raw) {
      try {
        stored = JSON.parse(raw);
      } catch {}
    }
    setAnswers(stored);

    const savedSessionId = sessionStorage.getItem("yojana_session_id");
    checkSchemeEligibility(schemeId, stored, savedSessionId, lang)
      .then((res) => setCheckResult(res))
      .catch((err) => console.error("Initial check error:", err));
  }, [schemeId, lang]);

  const handleAnswerStep = async (field: string, value: unknown, isUnknown = false) => {
    const nextAnswers = {
      ...answers,
      [field]: isUnknown ? "unknown" : value,
    };
    setAnswers(nextAnswers);
    sessionStorage.setItem("yojana_answers", JSON.stringify(nextAnswers));

    const questions = checkResult?.questions || [];
    if (activeQuestionIdx + 1 < questions.length) {
      setActiveQuestionIdx((i) => i + 1);
    } else {
      const savedSessionId = sessionStorage.getItem("yojana_session_id");
      try {
        const updated = await checkSchemeEligibility(schemeId, nextAnswers, savedSessionId, lang);
        setCheckResult(updated);
        setActiveQuestionIdx(updated.questions.length);
      } catch (err) {
        console.error("Stepper re-evaluation failed:", err);
      }
    }
  };

  const currentQuestions = checkResult?.questions || [];
  const hasPendingQuestions =
    checkResult?.status === "NEEDS_INFO" &&
    currentQuestions.length > 0 &&
    activeQuestionIdx < currentQuestions.length;
  const currentQ: NextQuestionData | undefined = currentQuestions[activeQuestionIdx];

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
          {/* Back navigation */}
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink bg-offwhite-surface dark:bg-offwhite-darkSurface border border-offwhite-border dark:border-offwhite-darkBorder px-3 py-1.5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.schemesDashboard}</span>
          </Link>

          {/* Loading state */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-deep animate-spin" />
              <p className="text-xs font-semibold text-ink-muted">{t.loading}</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-4 rounded-card bg-coral-50 border border-coral/30 text-coral flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold">{error}</span>
              <button
                onClick={loadSchemeData}
                className="px-3 py-1 bg-coral text-white font-bold rounded-lg shrink-0"
              >
                {t.errorRetry}
              </button>
            </div>
          )}

          {/* Main content */}
          {!loading && scheme && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-teal-50 dark:bg-teal-900/40 text-teal-deep dark:text-amber-warm border border-teal-deep/20">
                    {scheme.level} Scheme
                  </span>
                  {scheme.state && (
                    <span className="text-[10px] font-bold text-ink-muted">
                      {scheme.state}
                    </span>
                  )}
                  {scheme.is_sample && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-warm border border-amber-warm/30">
                      SAMPLE
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-ink dark:text-white font-heading">
                  {scheme.name}
                </h1>

                <div className="p-3.5 rounded-lg bg-offwhite/50 dark:bg-offwhite-dark/40 border border-offwhite-border dark:border-offwhite-darkBorder text-xs text-ink-light dark:text-slate-300">
                  <span className="font-bold text-ink dark:text-white">{t.benefitLabel}: </span>
                  {scheme.benefit_summary}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-offwhite-border dark:border-offwhite-darkBorder">
                {(["eligibility", "documents", "apply"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                      activeTab === tab
                        ? "border-teal-deep dark:border-amber-warm text-teal-deep dark:text-amber-warm"
                        : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    {tab === "eligibility" ? t.tabEligibility : tab === "documents" ? t.tabDocuments : t.tabApply}
                  </button>
                ))}
              </div>

              {/* Tab 1: Eligibility */}
              {activeTab === "eligibility" && (
                <div className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-4">
                  {scheme.eligibility_summary && (
                    <div className="space-y-1 text-xs text-ink-light dark:text-slate-300 leading-relaxed">
                      <h3 className="font-bold text-ink dark:text-white uppercase tracking-wider text-[11px]">
                        {t.officialCriteria}
                      </h3>
                      <p>{scheme.eligibility_summary}</p>
                    </div>
                  )}

                  {/* Checklist */}
                  {scheme.criteria && scheme.criteria.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-offwhite-border dark:border-offwhite-darkBorder">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                        {t.rulesCriteria}
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        {scheme.criteria.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-offwhite/50 dark:bg-offwhite-dark/30 border border-offwhite-border/60"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-warm shrink-0" />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stepper box */}
                  <div className="p-4 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/40 dark:bg-offwhite-dark/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-heading text-teal-deep dark:text-amber-warm">
                        {t.doIQualify}
                      </span>
                      {checkResult && (
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm border ${
                            checkResult.status === "ELIGIBLE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : checkResult.status === "NOT_ELIGIBLE"
                              ? "bg-coral-50 text-coral border-coral/30"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                        >
                          {checkResult.status === "ELIGIBLE"
                            ? t.verdictEligible
                            : checkResult.status === "NOT_ELIGIBLE"
                            ? t.verdictNotEligible
                            : t.verdictNeedsInfo}
                        </span>
                      )}
                    </div>

                    {hasPendingQuestions && currentQ && (
                      <div className="space-y-2 pt-2 border-t border-offwhite-border">
                        <p className="text-xs font-bold text-ink dark:text-white">
                          {currentQ.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {currentQ.options?.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleAnswerStep(currentQ.profile_field || "", opt)}
                              className="px-3 py-1.5 rounded-lg border border-offwhite-border bg-white dark:bg-offwhite-darkSurface text-xs font-medium hover:border-amber-warm"
                            >
                              {opt}
                            </button>
                          ))}
                          {currentQ.input_type === "yes_no" && (
                            <>
                              <button
                                onClick={() => handleAnswerStep(currentQ.profile_field || "", true)}
                                className="px-4 py-1.5 rounded-lg border border-offwhite-border bg-white dark:bg-offwhite-darkSurface text-xs font-bold text-teal-deep"
                              >
                                {t.yes}
                              </button>
                              <button
                                onClick={() => handleAnswerStep(currentQ.profile_field || "", false)}
                                className="px-4 py-1.5 rounded-lg border border-offwhite-border bg-white dark:bg-offwhite-darkSurface text-xs font-bold text-coral"
                              >
                                {t.no}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleAnswerStep(currentQ.profile_field || "", null, true)}
                            className="px-3 py-1.5 rounded-lg border border-dashed border-offwhite-border text-xs text-ink-muted"
                          >
                            {t.dontKnowBtn}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Documents */}
              {activeTab === "documents" && (
                <div className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {t.documentsTitle}
                  </h3>
                  {scheme.documents.length === 0 ? (
                    <p className="text-xs text-ink-muted">No documents specified.</p>
                  ) : (
                    <div className="space-y-2">
                      {scheme.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-ink dark:text-white block">
                              {doc.document_name}
                            </span>
                            <span className="text-[11px] text-ink-muted">
                              {t.whereToObtain}: {doc.where_to_obtain}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                              doc.is_mandatory
                                ? "bg-teal-50 text-teal-deep border border-teal-deep/20"
                                : "text-ink-muted border border-offwhite-border"
                            }`}
                          >
                            {doc.is_mandatory ? t.mandatory : t.optional}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Related Guide Link */}
                  <div className="pt-2">
                    <Link
                      href="/guides"
                      className="p-3 rounded-lg border border-teal-deep/20 bg-teal-50/50 dark:bg-teal-900/20 text-xs flex items-center justify-between group hover:border-amber-warm transition-all"
                    >
                      <span className="text-ink dark:text-slate-200">
                        {lang === "hi"
                          ? "दस्तावेज़ तैयार करने में सहायता चाहिए? आधिकारिक प्रक्रिया देखें।"
                          : "Need instructions for preparing official paperwork? Review step-by-step guides."}
                      </span>
                      <span className="font-bold text-teal-deep dark:text-amber-warm underline shrink-0">
                        {t.guidesTitle} →
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 3: Apply */}
              {activeTab === "apply" && (
                <div className="p-6 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-4">
                  <div className="space-y-2 text-xs text-ink-light dark:text-slate-300">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {t.howToApply}
                    </h3>
                    <p>1. Review prerequisites and keep scanned documents ready.</p>
                    <p>2. Access the designated government portal via the button below.</p>
                  </div>

                  <a
                    href={scheme.apply_url || scheme.source_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-teal-deep text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-teal-800 transition-all"
                  >
                    <span>{t.applyNow}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
