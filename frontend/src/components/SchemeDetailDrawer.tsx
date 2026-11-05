"use client";

import React, { useState } from "react";
import {
  Calendar,
  Check,
  ExternalLink,
  FileText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { SchemeDetailData } from "@/lib/api";
import { UIStrings } from "@/lib/strings";

interface SchemeDetailDrawerProps {
  scheme: SchemeDetailData | null;
  t: UIStrings;
  isOpen: boolean;
  onClose: () => void;
  onCheckEligibility: (schemeId: number) => void;
}

export function SchemeDetailDrawer({
  scheme,
  t,
  isOpen,
  onClose,
  onCheckEligibility,
}: SchemeDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"eligibility" | "documents" | "apply">("eligibility");

  if (!isOpen || !scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                {scheme.level === "central" ? t.centralSchemes : `${t.stateSchemes}${scheme.state ? ` (${scheme.state})` : ""}`}
              </span>
              {scheme.is_sample && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  {t.sampleBadge}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {scheme.name}
            </h2>
            {scheme.ministry && (
              <p className="text-xs text-slate-500">{scheme.ministry}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefit Callout */}
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
            {t.benefitLabel}
          </span>
          <p className="text-xs font-semibold text-emerald-950">
            {scheme.benefit_summary}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 sm:px-5 mt-3 gap-2">
          <button
            onClick={() => setActiveTab("eligibility")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "eligibility"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.tabEligibility}</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "documents"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.tabDocuments}</span>
          </button>

          <button
            onClick={() => setActiveTab("apply")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "apply"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.tabApply}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "eligibility" && (
            <div className="space-y-4">
              {scheme.eligibility_summary && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 leading-relaxed">
                  <span className="font-bold block mb-1">{t.officialCriteria}</span>
                  {scheme.eligibility_summary}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  {t.rulesCriteria}
                </h4>
                {scheme.criteria && scheme.criteria.length > 0 ? (
                  <ul className="space-y-2">
                    {scheme.criteria.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs font-medium text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific rules defined.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              {scheme.documents_note && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                  <span className="font-bold block mb-1">Important Note</span>
                  {scheme.documents_note}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  {t.documentsTitle}
                </h4>
                {scheme.documents && scheme.documents.length > 0 ? (
                  <div className="space-y-2">
                    {scheme.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{doc.document_name}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              doc.is_mandatory ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {doc.is_mandatory ? t.mandatory : t.optional}
                          </span>
                        </div>
                        {doc.where_to_obtain && (
                          <p className="text-slate-500">
                            <span className="font-medium">{t.whereToObtain}:</span> {doc.where_to_obtain}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific documents required.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "apply" && (
            <div className="space-y-4">
              {/* Prominent Apply Now button */}
              {scheme.apply_url ? (
                <a
                  href={scheme.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[50px] py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-center"
                >
                  <span>{t.applyNow}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs text-center">
                  Online application portal not available for this scheme.
                </div>
              )}

              {/* Official Source Link */}
              {scheme.source_url && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{t.sourceLink}:</span>
                  <a
                    href={scheme.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Verified date */}
              {scheme.last_verified && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-center">
                  <Calendar className="w-3 h-3" />
                  <span>{t.lastVerified}: {scheme.last_verified}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              onCheckEligibility(scheme.id);
            }}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.checkEligibilityBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

