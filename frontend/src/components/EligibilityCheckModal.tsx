"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { checkSchemeEligibility, NextQuestionData, SchemeCheckResponse } from "@/lib/api";
import { UIStrings } from "@/lib/strings";

interface EligibilityCheckModalProps {
  schemeId: number | null;
  schemeName?: string;
  applyUrl?: string | null;
  lang: string;
  t: UIStrings;
  isOpen: boolean;
  onClose: () => void;
}

export function EligibilityCheckModal({
  schemeId,
  schemeName,
  applyUrl,
  lang,
  t,
  isOpen,
  onClose,
}: EligibilityCheckModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchemeCheckResponse | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [numberVal, setNumberVal] = useState("");
  const [stateVal, setStateVal] = useState("");

  // Load initial check on open
  useEffect(() => {
    if (!isOpen || !schemeId) return;

    // Prefill from sessionStorage if available
    let storedAnswers: Record<string, unknown> = {};
    const savedSessionId = sessionStorage.getItem("yojana_session_id");
    const rawAnswers = sessionStorage.getItem("yojana_answers");
    if (rawAnswers) {
      try {
        storedAnswers = JSON.parse(rawAnswers);
      } catch {
        // ignore
      }
    }

    setAnswers(storedAnswers);
    setActiveQuestionIdx(0);
    setLoading(true);

    checkSchemeEligibility(schemeId, storedAnswers, savedSessionId, lang)
      .then((res) => {
        setResult(res);
      })
      .catch((err) => {
        console.error("Failed to check eligibility:", err);
      })
      .finally(() => setLoading(false));
  }, [isOpen, schemeId, lang]);

  if (!isOpen || !schemeId) return null;

  const currentQuestions = result?.questions || [];
  const hasPendingQuestions =
    result?.status === "NEEDS_INFO" &&
    currentQuestions.length > 0 &&
    activeQuestionIdx < currentQuestions.length;

  const handleAnswerQuestion = async (field: string, value: unknown, isUnknown = false) => {
    const nextAnswers = {
      ...answers,
      [field]: isUnknown ? "unknown" : value,
    };
    setAnswers(nextAnswers);

    // Save locally for prefill
    sessionStorage.setItem("yojana_answers", JSON.stringify(nextAnswers));

    if (activeQuestionIdx + 1 < currentQuestions.length) {
      setActiveQuestionIdx((i) => i + 1);
      setNumberVal("");
      setStateVal("");
    } else {
      // Re-evaluate with all collected answers
      setLoading(true);
      const savedSessionId = sessionStorage.getItem("yojana_session_id");
      try {
        const updated = await checkSchemeEligibility(schemeId, nextAnswers, savedSessionId, lang);
        setResult(updated);
        setActiveQuestionIdx(updated.questions.length);
      } catch (err) {
        console.error("Re-evaluation failed:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const q: NextQuestionData | undefined = currentQuestions[activeQuestionIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.checkEligibilityBtn}</h3>
            {schemeName && (
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{schemeName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-600">{t.loading}</p>
            </div>
          )}

          {!loading && hasPendingQuestions && q && (
            <div className="space-y-4">
              {/* Stepper progress */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>
                  {t.questionProgress} {activeQuestionIdx + 1} / {currentQuestions.length}
                </span>
                <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  Step {activeQuestionIdx + 1}
                </span>
              </div>

              {/* Question label */}
              <div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {q.label}
                </h4>
                {q.help_text && (
                  <p className="text-xs text-slate-500 mt-1">{q.help_text}</p>
                )}
              </div>

              {/* Question Input */}
              <div className="pt-2">
                {q.input_type === "single_choice" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswerQuestion(q.profile_field!, opt)}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/50 text-left text-xs font-bold text-slate-800 transition-all active:scale-[0.99]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.input_type === "yes_no" && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleAnswerQuestion(q.profile_field!, true)}
                      className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:bg-emerald-50 text-xs font-bold text-slate-800 transition-all active:scale-95 text-center"
                    >
                      {t.yes}
                    </button>
                    <button
                      onClick={() => handleAnswerQuestion(q.profile_field!, false)}
                      className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:border-rose-600 hover:bg-rose-50 text-xs font-bold text-slate-800 transition-all active:scale-95 text-center"
                    >
                      {t.no}
                    </button>
                  </div>
                )}

                {q.input_type === "number" && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={numberVal}
                      onChange={(e) => setNumberVal(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-blue-600"
                    />
                    <button
                      disabled={!numberVal}
                      onClick={() => handleAnswerQuestion(q.profile_field!, Number(numberVal))}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      {t.submitBtn}
                    </button>
                  </div>
                )}

                {q.input_type === "state_picker" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-blue-600"
                    />
                    <button
                      disabled={!stateVal.trim()}
                      onClick={() => handleAnswerQuestion(q.profile_field!, stateVal.trim())}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      {t.submitBtn}
                    </button>
                  </div>
                )}
              </div>

              {/* I don't know button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleAnswerQuestion(q.profile_field!, null, true)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t.dontKnowBtn}</span>
                </button>
              </div>
            </div>
          )}

          {!loading && !hasPendingQuestions && result && (
            <div className="space-y-4">
              {/* Verdict Banner */}
              {result.status === "ELIGIBLE" && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h4 className="text-sm font-bold text-emerald-900">{t.verdictEligible}</h4>
                  </div>
                  <p className="text-xs text-emerald-800 pl-7 leading-relaxed">
                    {t.verdictEligibleDesc}
                  </p>
                </div>
              )}

              {result.status === "NOT_ELIGIBLE" && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <h4 className="text-sm font-bold text-rose-900">{t.verdictNotEligible}</h4>
                  </div>
                  <p className="text-xs text-rose-800 pl-7 leading-relaxed">
                    {t.verdictNotEligibleDesc}
                  </p>
                </div>
              )}

              {result.status === "NEEDS_INFO" && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <h4 className="text-sm font-bold text-amber-900">{t.verdictNeedsInfo}</h4>
                  </div>
                  <p className="text-xs text-amber-800 pl-7 leading-relaxed">
                    {t.verdictNeedsInfoDesc}
                  </p>
                </div>
              )}

              {/* Per-criterion list with ✓ / ✗ / ? */}
              <div className="pt-1">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5">
                  {t.rulesCriteria}
                </h5>

                <div className="space-y-2">
                  {result.criteria.map((c, i) => {
                    const isMet = c.status === "met";
                    const isNotMet = c.status === "not_met";
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                          isMet
                            ? "bg-emerald-50/60 border-emerald-200"
                            : isNotMet
                            ? "bg-rose-50/60 border-rose-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isMet && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                              ✓
                            </span>
                          )}
                          {isNotMet && (
                            <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                              ✗
                            </span>
                          )}
                          {!isMet && !isNotMet && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                              ?
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{c.rendered_text}</p>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 ${
                              isMet
                                ? "text-emerald-700"
                                : isNotMet
                                ? "text-rose-700"
                                : "text-amber-700"
                            }`}
                          >
                            {isMet ? t.criterionMet : isNotMet ? t.criterionNotMet : t.criterionUnknown}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Apply Now if eligible */}
              {result.status === "ELIGIBLE" && applyUrl && (
                <div className="pt-2">
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
                  >
                    <span>{t.applyNow}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

