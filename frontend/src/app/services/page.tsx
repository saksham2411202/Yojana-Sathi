"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

export default function GuidesPage() {
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

  const steps = [
    {
      num: "01",
      titleEn: "Confirm Official Eligibility",
      titleHi: "पात्रता एवं दिशा-निर्देशों की पुष्टि",
      descEn:
        "Check that your age, household annual income, and domicile match the scheme's gazetted criteria before proceeding.",
      descHi:
        "आवेदन से पूर्व सुनिश्चित करें कि आपकी आयु, पारिवारिक आय और निवास राज्य योजना के सरकारी नियमों के अनुरूप हैं।",
      tipEn: "Use our Eligibility Engine for an instant criteria evaluation.",
      tipHi: "त्वरित मूल्यांकन के लिए हमारी पात्रता जांच प्रणाली का उपयोग करें।",
    },
    {
      num: "02",
      titleEn: "Collate Required Documents",
      titleHi: "आवश्यक दस्तावेज़ एकत्र करें",
      descEn:
        "Assemble genuine copies of all required paperwork. Ensure the name spelling across your Aadhaar and bank account matches exactly.",
      descHi:
        "आधार कार्ड, बैंक पासबुक और अन्य अनिवार्य प्रमाण पत्र तैयार रखें। नाम और जन्मतिथि सभी अभिलेखों में समान होनी चाहिए।",
      tipEn: "Check spelling and active mobile link for OTP verification.",
      tipHi: "ओटीपी सत्यापन हेतु आधार से मोबाइल नंबर लिंक होना आवश्यक है।",
    },
    {
      num: "03",
      titleEn: "Access the Official .gov.in Portal",
      titleHi: "आधिकारिक सरकारी पोर्टल पर जाएं",
      descEn:
        "Open only verified government portals ending with .gov.in or .nic.in. Beware of unverified third-party fee collection websites.",
      descHi:
        "केवल .gov.in या .nic.in पर समाप्त होने वाली आधिकारिक वेबसाइट पर ही पंजीकरण करें। किसी अनाधिकृत पोर्टल को शुल्क न दें।",
      tipEn: "All official scheme application forms are 100% free of charge.",
      tipHi: "अधिकांश सरकारी योजनाओं का ऑनलाइन पंजीकरण पूर्णतः निःशुल्क होता है।",
    },
    {
      num: "04",
      titleEn: "Submit Application & Retain Acknowledgment",
      titleHi: "आवेदन पत्र जमा करें व पावती सुरक्षित रखें",
      descEn:
        "Complete all fields carefully, attach readable scans, and record your application registration number / acknowledgment receipt.",
      descHi:
        "सावधानीपूर्वक प्रपत्र भरें, स्पष्ट प्रतिलिपि अपलोड करें और आवेदन संदर्भ संख्या (Acknowledgment ID) नोट कर लें।",
      tipEn: "Keep the SMS acknowledgment for DBT installment tracking.",
      tipHi: "लाभ अंतरण (DBT) की स्थिति जानने हेतु पावती रसीद संभाल कर रखें।",
    },
  ];

  const commonDocuments = [
    {
      name: lang === "hi" ? "आधार कार्ड" : "Aadhaar Card",
      desc: lang === "hi" ? "यूआईडीएआई द्वारा जारी पहचान पत्र" : "UIDAI biometric identity proof",
      mandatory: true,
    },
    {
      name: lang === "hi" ? "बैंक खाता पासबुक" : "Bank Passbook",
      desc: lang === "hi" ? "डीबीटी सक्रिय बैंक खाता" : "Aadhaar-seeded active account",
      mandatory: true,
    },
    {
      name: lang === "hi" ? "आय प्रमाण पत्र" : "Income Certificate",
      desc: lang === "hi" ? "तहसीलदार / राजस्व अधिकारी द्वारा जारी" : "Issued by Tehsildar / Revenue Authority",
      mandatory: false,
    },
    {
      name: lang === "hi" ? "निवास / अधिवास प्रमाण पत्र" : "Domicile Certificate",
      desc: lang === "hi" ? "राज्य निवासी होने का आधिकारिक प्रमाण" : "Proof of permanent state residency",
      mandatory: false,
    },
    {
      name: lang === "hi" ? "राशन कार्ड" : "Ration Card",
      desc: lang === "hi" ? "खाद्य एवं नागरिक आपूर्ति विभाग" : "State Civil Supplies Dept card",
      mandatory: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-deep dark:text-amber-warm bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-md border border-teal-deep/20">
              {lang === "hi" ? "प्रक्रिया मार्गदर्शिका" : "Step-by-Step Instructions"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white font-heading">
              {lang === "hi" ? "सरकारी योजना आवेदन मार्गदर्शिका" : "Official Application Protocol"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-slate-400 max-w-xl">
              {lang === "hi"
                ? "पात्रता परीक्षण से लेकर अंतिम पावती रसीद प्राप्त करने तक के सत्यापित चरण।"
                : "Standardized instructions for verifying eligibility, organizing records, and applying on official portals."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* VERTICAL TIMELINE OF NUMBERED STEPS */}
            <div className="lg:col-span-8 space-y-6">
              {steps.map((st) => (
                <div
                  key={st.num}
                  className="flex items-start gap-4 p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface yojana-card transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-deep text-amber-warm flex items-center justify-center font-black text-sm shrink-0 font-heading">
                    {st.num}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-sm font-bold text-ink dark:text-white font-heading">
                      {lang === "hi" ? st.titleHi : st.titleEn}
                    </h3>
                    <p className="text-xs text-ink-light dark:text-slate-300 leading-relaxed">
                      {lang === "hi" ? st.descHi : st.descEn}
                    </p>
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-teal-deep dark:text-amber-warm font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{lang === "hi" ? st.tipHi : st.tipEn}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* STICKY "DOCUMENTS NEEDED" SIDE BOX */}
            <div className="lg:col-span-4 sticky top-6 space-y-4">
              <div className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-offwhite-border dark:border-offwhite-darkBorder">
                  <FileCheck2 className="w-4 h-4 text-amber-warm" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white font-heading">
                    {lang === "hi" ? "आवश्यक दस्तावेज़ सूची" : "Documents Needed"}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {commonDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/40 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink dark:text-white">
                          {doc.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                            doc.mandatory
                              ? "bg-teal-50 text-teal-deep dark:bg-teal-900/40 dark:text-amber-warm"
                              : "text-ink-muted"
                          }`}
                        >
                          {doc.mandatory ? t.mandatory : t.optional}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted">
                        {doc.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/match"
                    className="w-full py-2.5 px-3 rounded-xl bg-teal-deep text-white font-bold text-xs text-center flex items-center justify-center gap-2 hover:bg-teal-800 transition-all"
                  >
                    <span>{lang === "hi" ? "मेरी योजना सूची बनाएं" : "Evaluate My Scheme List"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
