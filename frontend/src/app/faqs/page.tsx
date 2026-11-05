"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
} from "lucide-react";
import { Language, STRINGS } from "@/lib/strings";
import { NavigationRail } from "@/components/NavigationRail";
import { Footer } from "@/components/Footer";

interface FAQItem {
  qEn: string;
  qHi: string;
  aEn: string;
  aHi: string;
  category: "eligibility" | "documents" | "application" | "privacy";
}

const FAQS: FAQItem[] = [
  // Category: eligibility
  {
    category: "eligibility",
    qEn: "How is my eligibility calculated?",
    qHi: "मेरी पात्रता का मूल्यांकन किस प्रकार किया जाता है?",
    aEn: "Yojana Saathi uses a deterministic tri-state logic engine (True, False, Unknown) running directly against official gazette rules. We never guess or estimate percentages.",
    aHi: "योजना साथी सरकारी नियमों पर आधारित त्रि-स्तरीय (सत्य, असत्य, अज्ञात) तार्किक प्रणाली का उपयोग करता है। हम कोई अनुमानित प्रतिशत नहीं दिखाते।",
  },
  {
    category: "eligibility",
    qEn: "What if I do not know an answer to a question?",
    qHi: "यदि मुझे किसी प्रश्न का उत्तर ज्ञात न हो तो क्या करें?",
    aEn: "You can click 'I don't know'. The engine marks the field as Unknown and preserves all potential schemes that could still qualify based on other criteria.",
    aHi: "'मुझे जानकारी नहीं है' बटन चुनें। प्रणाली उस जानकारी को अज्ञात के रूप में चिह्नित करती है और संभावित योजनाओं को बाहर नहीं करती।",
  },
  // Category: documents
  {
    category: "documents",
    qEn: "Do I have to upload documents on this portal?",
    qHi: "क्या मुझे इस पोर्टल पर कोई दस्तावेज़ अपलोड करने होंगे?",
    aEn: "No. Yojana Saathi does not collect, receive, or store your documents. We provide an organized checklist so you can bring them to the official government portal.",
    aHi: "नहीं। योजना साथी आपके दस्तावेज़ एकत्र या संग्रहित नहीं करता। हम केवल आवश्यक प्रमाण पत्रों की चेकलिस्ट प्रदान करते हैं।",
  },
  {
    category: "documents",
    qEn: "Can I download my personal document checklist as a PDF?",
    qHi: "क्या मैं अपनी दस्तावेज़ चेकलिस्ट को पीडीएफ रूप में डाउनलोड कर सकता हूँ?",
    aEn: "Yes. After completing the eligibility assessment, you can generate and download a clean, consolidated PDF document register with a single click.",
    aHi: "हाँ। पात्रता मूल्यांकन पूर्ण होने के पश्चात आप एक क्लिक में समेकित पीडीएफ दस्तावेज़ रजिस्टर डाउनलोड कर सकते हैं।",
  },
  // Category: application
  {
    category: "application",
    qEn: "Does Yojana Saathi charge any application fee?",
    qHi: "क्या योजना साथी कोई आवेदन शुल्क लेता है?",
    aEn: "Never. Yojana Saathi is a 100% free, open public reference directory. Government welfare scheme applications on official portals are also generally free.",
    aHi: "बिल्कुल नहीं। योजना साथी पूर्णतः निःशुल्क जनसूचना निर्देशिका है। आधिकारिक सरकारी पोर्टलों पर भी आवेदन प्रक्रिया प्रायः निःशुल्क होती है।",
  },
  {
    category: "application",
    qEn: "How do I ensure a portal link is genuine?",
    qHi: "मैं कैसे सुनिश्चित करूँ कि पोर्टल का लिंक असली है?",
    aEn: "We audit every link to verify it terminates in a recognized government domain (.gov.in or .nic.in). Never enter private details on non-governmental portals.",
    aHi: "हम केवल .gov.in या .nic.in वाले प्रमाणित पोर्टलों के लिंक प्रदान करते हैं। किसी भी निजी या गैर-सरकारी वेबसाइट पर अपनी जानकारी न दें।",
  },
  // Category: privacy
  {
    category: "privacy",
    qEn: "Do I need to register or create an account?",
    qHi: "क्या मुझे पंजीकरण या खाता बनाने की आवश्यकता है?",
    aEn: "No accounts, no phone numbers, and no passwords. Your questionnaire answers remain isolated inside your current temporary browser session.",
    aHi: "कोई खाता, मोबाइल नंबर या पासवर्ड की आवश्यकता नहीं है। आपके उत्तर केवल आपके वर्तमान ब्राउज़र सत्र में ही रहते हैं।",
  },
  {
    category: "privacy",
    qEn: "Is my personal financial profile stored on any server?",
    qHi: "क्या मेरी वित्तीय जानकारी किसी सर्वर पर सुरक्षित की जाती है?",
    aEn: "No personal information is retained or tracked. Once your session expires or is closed, all local state is automatically discarded.",
    aHi: "किसी भी सर्वर पर व्यक्तिगत डेटा संग्रहीत नहीं किया जाता। ब्राउज़र सत्र समाप्त होते ही सारी जानकारी स्वतः समाप्त हो जाती है।",
  },
];

export default function FAQsPage() {
  const [lang, setLang] = useState<Language>("en");
  const t = STRINGS[lang];
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  useEffect(() => {
    const saved = sessionStorage.getItem("yojana_lang") as Language | null;
    if (saved) setLang(saved);
  }, []);

  const handleLanguageToggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    sessionStorage.setItem("yojana_lang", next);
  };

  const categories = [
    { id: "all", labelEn: "All Questions", labelHi: "सभी प्रश्न" },
    { id: "eligibility", labelEn: "Eligibility & Logic", labelHi: "पात्रता एवं नियम" },
    { id: "documents", labelEn: "Documents & Proofs", labelHi: "दस्तावेज़ एवं प्रमाण" },
    { id: "application", labelEn: "Application Process", labelHi: "आवेदन प्रक्रिया" },
    { id: "privacy", labelEn: "Data & Privacy", labelHi: "गोपनीयता एवं सुरक्षा" },
  ];

  const filteredFaqs = FAQS.filter((f) => {
    const matchesCat = selectedCat === "all" || f.category === selectedCat;
    const query = search.toLowerCase().trim();
    if (!query) return matchesCat;
    const text = `${f.qEn} ${f.qHi} ${f.aEn} ${f.aHi}`.toLowerCase();
    return matchesCat && text.includes(query);
  });

  return (
    <div className="min-h-screen flex flex-col bg-offwhite dark:bg-offwhite-dark text-ink dark:text-slate-100 dot-grid transition-colors">
      <NavigationRail lang={lang} onLanguageToggle={handleLanguageToggle} t={t} />

      <div className="flex-1 md:pl-60 flex flex-col justify-between">
        <main className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-deep dark:text-amber-warm bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-md border border-teal-deep/20">
              {lang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : "Knowledge Base"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white font-heading">
              {lang === "hi" ? "प्रश्नोत्तरी एवं स्पष्टीकरण" : "Questions & Clarifications"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted dark:text-slate-400">
              {lang === "hi"
                ? "पात्रता मूल्यांकन, आवश्यक दस्तावेज़ों और आधिकारिक आवेदन प्रक्रिया से जुड़े मुख्य प्रश्न।"
                : "Straightforward answers concerning eligibility rules, documents, and application standards."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "hi" ? "प्रश्नों में खोजें..." : "Filter questions by keyword..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-xs text-ink dark:text-slate-200 focus:outline-hidden focus:border-amber-warm"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCat === c.id
                    ? "bg-teal-deep text-white shadow-xs"
                    : "border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface text-ink-light dark:text-slate-300 hover:border-amber-warm"
                }`}
              >
                {lang === "hi" ? c.labelHi : c.labelEn}
              </button>
            ))}
          </div>

          {/* Grouped Section Cards */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center rounded-card border border-offwhite-border bg-offwhite-surface text-xs text-ink-muted">
                {lang === "hi" ? "कोई संबंधित प्रश्न नहीं मिला।" : "No questions matched your search query."}
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-5 rounded-card border border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite-surface dark:bg-offwhite-darkSurface yojana-card space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-ink dark:text-white font-heading">
                      {lang === "hi" ? faq.qHi : faq.qEn}
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-offwhite dark:bg-offwhite-dark border border-offwhite-border dark:border-offwhite-darkBorder text-ink-muted shrink-0">
                      {faq.category}
                    </span>
                  </div>
                  <p className="text-xs text-ink-light dark:text-slate-300 leading-relaxed">
                    {lang === "hi" ? faq.aHi : faq.aEn}
                  </p>
                </div>
              ))
            )}
          </div>
        </main>

        <Footer t={t} />
      </div>
    </div>
  );
}
