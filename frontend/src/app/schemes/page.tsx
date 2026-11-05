"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  HeartPulse,
  Layers,
  RotateCcw,
  Search,
  Tractor,
  X,
} from "lucide-react";
import {
  checkSchemeEligibility,
  fetchCatalogSchemes,
  fetchNeeds,
  fetchSchemeDetail,
  NeedItem,
  SchemeCatalogItem,
  SchemeCheckResponse,
  SchemeDetailData,
} from "@/lib/api";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

function SchemesDirectoryContent() {
  const searchParams = useSearchParams();
  const initialNeed = searchParams?.get("need") || "";
  const initialState = searchParams?.get("state") || "";

  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeed, setSelectedNeed] = useState<string>(initialNeed);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Directory Data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<SchemeCatalogItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [needs, setNeeds] = useState<NeedItem[]>([]);

  // Master-detail Selected Scheme
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<SchemeDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"eligibility" | "documents" | "apply">("eligibility");

  // Inline "Am I eligible?" Stepper State
  const [checkResult, setCheckResult] = useState<SchemeCheckResponse | null>(null);
  const [checkAnswers, setCheckAnswers] = useState<Record<string, unknown>>({});
  const [stepperIndex, setStepperIndex] = useState<number>(0);
  const [stepperLoading, setStepperLoading] = useState<boolean>(false);

  // Mobile full-screen sheet
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("yojana_lang") as Language | null;
    if (saved) setLang(saved);
    fetchNeeds(lang).then(setNeeds).catch(console.error);
  }, [lang]);

  const handleLanguageToggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    sessionStorage.setItem("yojana_lang", next);
  };

  // Fetch schemes when filter/page changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetchCatalogSchemes({
      page: currentPage,
      page_size: 10,
      need: selectedNeed || undefined,
      level: selectedLevel || undefined,
      state: selectedState || undefined,
      q: searchQuery.trim() || undefined,
      lang,
    })
      .then((res) => {
        if (!isCancelled) {
          setSchemes(res.items);
          setTotalPages(res.total_pages);
          setTotalCount(res.total);
          // Auto select first scheme on desktop if none selected
          if (!selectedSchemeId && res.items.length > 0) {
            setSelectedSchemeId(res.items[0].id);
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) setError(err.message || "Failed to load directory.");
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, selectedNeed, selectedLevel, selectedState, searchQuery, lang, selectedSchemeId]);

  // Fetch detail whenever selectedSchemeId changes
  useEffect(() => {
    if (!selectedSchemeId) {
      setDetailData(null);
      setCheckResult(null);
      return;
    }

    setDetailLoading(true);
    setCheckAnswers({});
    setStepperIndex(0);

    Promise.all([
      fetchSchemeDetail(selectedSchemeId, lang),
      checkSchemeEligibility(selectedSchemeId, {}, null, lang),
    ])
      .then(([detail, check]) => {
        setDetailData(detail);
        setCheckResult(check);
      })
      .catch((err) => console.error("Scheme detail fetch error:", err))
      .finally(() => setDetailLoading(false));
  }, [selectedSchemeId, lang]);

  // Handle Stepper answer
  const handleAnswerStep = async (field: string, value: unknown, isUnknown: boolean = false) => {
    if (!selectedSchemeId) return;
    setStepperLoading(true);
    const updated = { ...checkAnswers, [field]: isUnknown ? null : value };
    setCheckAnswers(updated);

    try {
      const res = await checkSchemeEligibility(selectedSchemeId, updated, null, lang);
      setCheckResult(res);
      setStepperIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setStepperLoading(false);
    }
  };

  const getSchemeIcon = (schemeNeeds?: string[]) => {
    if (!schemeNeeds || schemeNeeds.length === 0) return Layers;
    const first = schemeNeeds[0].toLowerCase();
    if (first.includes("health")) return HeartPulse;
    if (first.includes("education")) return GraduationCap;
    if (first.includes("farming")) return Tractor;
    return Layers;
  };

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* HEADER & FILTER BAR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-ink dark:text-white font-heading">
                  {t.schemesDashboard}
                </h1>
                <p className="text-xs text-ink-muted dark:text-slate-400">
                  {totalCount} {lang === "hi" ? "योजनाएं उपलब्ध" : "verified government benefits catalogued"}
                </p>
              </div>

              <button
                onClick={() => setIsFilterCollapsed((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs font-bold text-ink dark:text-slate-200 hover:border-amber-warm transition-all"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "फ़िल्टर" : "Filters"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterCollapsed ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Collapsible Filters */}
            {!isFilterCollapsed && (
              <div className="p-4 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Search query */}
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/50 text-xs text-ink dark:text-slate-200 focus:outline-hidden focus:border-amber-warm"
                  />
                </div>

                {/* Need category select */}
                <div>
                  <select
                    value={selectedNeed}
                    onChange={(e) => {
                      setSelectedNeed(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/50 text-xs text-ink dark:text-slate-200 focus:outline-hidden focus:border-amber-warm"
                  >
                    <option value="">{t.allNeeds}</option>
                    {needs.map((n) => (
                      <option key={n.id} value={n.slug}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level Select */}
                <div>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/50 text-xs text-ink dark:text-slate-200 focus:outline-hidden focus:border-amber-warm"
                  >
                    <option value="">{t.allLevels}</option>
                    <option value="central">{t.centralSchemes}</option>
                    <option value="state">{t.stateSchemes}</option>
                  </select>
                </div>

                {/* State Input */}
                <div>
                  <input
                    type="text"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={lang === "hi" ? "राज्य खोजें..." : "Filter by state..."}
                    className="w-full py-2 px-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/50 text-xs text-ink dark:text-slate-200 focus:outline-hidden focus:border-amber-warm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* MASTER-DETAIL GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: COMPACT LIST ROWS */}
            <div className="lg:col-span-5 space-y-3">
              {loading && (
                <div className="p-8 text-center text-xs text-ink-muted dark:text-slate-400 font-medium">
                  {t.loading}
                </div>
              )}

              {error && (
                <div className="p-4 rounded-card border border-coral/30 bg-coral-50 text-coral text-xs flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="flex items-center gap-1 font-bold underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.errorRetry}</span>
                  </button>
                </div>
              )}

              {!loading && !error && schemes.length === 0 && (
                <div className="p-8 text-center rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs text-ink-muted">
                  {t.noSchemesFound}
                </div>
              )}

              {!loading &&
                schemes.map((scheme) => {
                  const Icon = getSchemeIcon(scheme.needs);
                  const isSelected = selectedSchemeId === scheme.id;
                  return (
                    <div
                      key={scheme.id}
                      onClick={() => {
                        setSelectedSchemeId(scheme.id);
                        setMobileSheetOpen(true);
                      }}
                      className={`cursor-pointer p-3.5 yojana-card bg-offwhite-surface dark:bg-offwhite-darkSurface border transition-all ${
                        isSelected
                          ? "border-teal-deep dark:border-amber-warm border-l-4 border-l-amber-warm"
                          : "border-offwhite-border dark:border-offwhite-darkBorder hover:border-amber-warm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-deep dark:text-amber-warm flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs font-bold text-ink dark:text-white truncate font-heading">
                              {scheme.name}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-offwhite dark:bg-offwhite-dark border border-offwhite-border dark:border-offwhite-darkBorder text-ink-muted">
                                {scheme.level}
                              </span>
                              {scheme.is_sample && (
                                <span className="text-[9px] font-bold px-1 py-0.5 rounded-sm bg-amber-50 text-amber-warm border border-amber-warm/30">
                                  SAMPLE
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-ink-muted dark:text-slate-400 line-clamp-1">
                            {scheme.benefit_summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-2 flex items-center justify-between text-xs text-ink-muted">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: STICKY DETAIL PANEL (Desktop) */}
            <div className="hidden lg:block lg:col-span-7 sticky top-6">
              {detailLoading && (
                <div className="p-12 text-center rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs text-ink-muted">
                  {t.loading}
                </div>
              )}

              {!detailLoading && detailData && (
                <div className="rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface overflow-hidden space-y-4 p-6">
                  {/* Scheme Header */}
                  <div className="space-y-2 pb-4 border-b border-offwhite-border dark:border-offwhite-darkBorder">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-teal-50 dark:bg-teal-900/40 text-teal-deep dark:text-amber-warm border border-teal-deep/20">
                        {detailData.level} Scheme
                      </span>
                      {detailData.state && (
                        <span className="text-[10px] font-bold text-ink-muted">
                          {detailData.state}
                        </span>
                      )}
                      {detailData.is_sample && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-warm border border-amber-warm/30">
                          SAMPLE
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-ink dark:text-white font-heading">
                      {detailData.name}
                    </h2>
                    <div className="p-3 rounded-lg bg-offwhite/60 dark:bg-offwhite-dark/40 border border-offwhite-border dark:border-offwhite-darkBorder text-xs text-ink-light dark:text-slate-300">
                      <span className="font-bold text-ink dark:text-white">Benefit: </span>
                      {detailData.benefit_summary}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-offwhite-border dark:border-offwhite-darkBorder">
                    {(["eligibility", "documents", "apply"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold capitalize transition-colors border-b-2 ${
                          activeTab === tab
                            ? "border-teal-deep dark:border-amber-warm text-teal-deep dark:text-amber-warm"
                            : "border-transparent text-ink-muted hover:text-ink dark:hover:text-white"
                        }`}
                      >
                        {tab === "eligibility" ? t.tabEligibility : tab === "documents" ? t.tabDocuments : t.tabApply}
                      </button>
                    ))}
                  </div>

                  {/* Tab 1: Eligibility & Stepper */}
                  {activeTab === "eligibility" && (
                    <div className="space-y-4 pt-1">
                      {/* Official Criteria Summary */}
                      {detailData.eligibility_summary && (
                        <div className="text-xs text-ink-muted leading-relaxed">
                          <span className="font-bold text-ink dark:text-white block mb-1">
                            {t.officialCriteria}:
                          </span>
                          {detailData.eligibility_summary}
                        </div>
                      )}

                      {/* Criteria Checklist */}
                      {detailData.criteria && detailData.criteria.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                            {t.rulesCriteria}
                          </h4>
                          <div className="space-y-1 text-xs">
                            {detailData.criteria.map((c, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 p-2 rounded-lg bg-offwhite/50 dark:bg-offwhite-dark/30 border border-offwhite-border/60 dark:border-offwhite-darkBorder"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-warm shrink-0" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* "Am I eligible?" Stepper */}
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

                        {/* Interactive questions from checkResult */}
                        {checkResult?.questions && checkResult.questions.length > stepperIndex && (
                          <div className="space-y-2 pt-2 border-t border-offwhite-border dark:border-offwhite-darkBorder">
                            {(() => {
                              const q = checkResult.questions[stepperIndex];
                              return (
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-ink dark:text-white">
                                    {q.label}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {q.options?.map((opt) => (
                                      <button
                                        key={opt}
                                        disabled={stepperLoading}
                                        onClick={() => handleAnswerStep(q.profile_field || "", opt)}
                                        className="px-3 py-1.5 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-white dark:bg-offwhite-darkSurface text-xs font-medium hover:border-amber-warm"
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                    {q.input_type === "yes_no" && (
                                      <>
                                        <button
                                          disabled={stepperLoading}
                                          onClick={() => handleAnswerStep(q.profile_field || "", true)}
                                          className="px-4 py-1.5 rounded-lg border border-offwhite-border bg-white dark:bg-offwhite-darkSurface text-xs font-bold text-teal-deep hover:border-teal-deep"
                                        >
                                          {t.yes}
                                        </button>
                                        <button
                                          disabled={stepperLoading}
                                          onClick={() => handleAnswerStep(q.profile_field || "", false)}
                                          className="px-4 py-1.5 rounded-lg border border-offwhite-border bg-white dark:bg-offwhite-darkSurface text-xs font-bold text-coral hover:border-coral"
                                        >
                                          {t.no}
                                        </button>
                                      </>
                                    )}
                                    <button
                                      disabled={stepperLoading}
                                      onClick={() => handleAnswerStep(q.profile_field || "", null, true)}
                                      className="px-3 py-1.5 rounded-lg border border-dashed border-offwhite-border text-xs text-ink-muted hover:bg-offwhite"
                                    >
                                      {t.dontKnowBtn}
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Documents */}
                  {activeTab === "documents" && (
                    <div className="space-y-3 pt-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                        {t.documentsTitle}
                      </h4>
                      {detailData.documents.length === 0 ? (
                        <p className="text-xs text-ink-muted">No specific documents specified.</p>
                      ) : (
                        <div className="space-y-2">
                          {detailData.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/40 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="font-bold text-ink dark:text-white flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-amber-warm shrink-0" />
                                  <span>{doc.document_name}</span>
                                </div>
                                <p className="text-[11px] text-ink-muted">
                                  {t.whereToObtain}: {doc.where_to_obtain}
                                </p>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                                  doc.is_mandatory
                                    ? "bg-teal-50 text-teal-deep border border-teal-deep/20"
                                    : "bg-offwhite text-ink-muted border border-offwhite-border"
                                }`}
                              >
                                {doc.is_mandatory ? t.mandatory : t.optional}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Apply */}
                  {activeTab === "apply" && (
                    <div className="space-y-4 pt-1">
                      <div className="space-y-2 text-xs text-ink-light dark:text-slate-300">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                          {t.howToApply}
                        </h4>
                        <p>
                          1. Review eligibility criteria and ensure mandatory documents are prepared.
                        </p>
                        <p>
                          2. Click the official government portal link below to submit your application.
                        </p>
                      </div>

                      <div className="pt-2">
                        <a
                          href={detailData.apply_url || detailData.source_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 rounded-xl bg-teal-deep text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-teal-800 shadow-xs transition-all"
                        >
                          <span>{t.applyNow}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer t={t} />
      </div>

      {/* MOBILE FULL-SCREEN DETAIL SHEET */}
      {mobileSheetOpen && detailData && (
        <div className="lg:hidden fixed inset-0 z-50 bg-offwhite dark:bg-offwhite-dark overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-offwhite-border">
            <span className="text-xs font-bold uppercase text-teal-deep dark:text-amber-warm">
              Scheme Detail
            </span>
            <button
              onClick={() => setMobileSheetOpen(false)}
              className="p-1 rounded-md text-ink hover:text-coral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-black text-ink dark:text-white font-heading">
              {detailData.name}
            </h2>
            <p className="text-xs text-ink-muted">
              {detailData.benefit_summary}
            </p>

            <div className="pt-2 flex gap-2">
              <a
                href={detailData.apply_url || detailData.source_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-lg bg-teal-deep text-white text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <span>{t.applyNow}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchemesDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-offwhite dark:bg-offwhite-dark flex items-center justify-center text-xs font-bold text-ink-muted">
          Loading Directory...
        </div>
      }
    >
      <SchemesDirectoryContent />
    </Suspense>
  );
}
