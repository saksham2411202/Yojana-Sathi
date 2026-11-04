export type Language = "en" | "hi";

export interface UIStrings {
  appTitle: string;
  selectLanguage: string;
  selectLanguageSubtitle: string;
  selectNeedsTitle: string;
  selectNeedsSubtitle: string;
  continueBtn: string;
  backBtn: string;
  dontKnowBtn: string;
  submitBtn: string;
  loading: string;
  errorTitle: string;
  errorRetry: string;
  questionProgress: string;
  resultsTitle: string;
  eligibleTitle: string;
  needsInfoTitle: string;
  notEligibleTitle: string;
  showNotEligible: string;
  hideNotEligible: string;
  noEligibleSchemes: string;
  benefitLabel: string;
  sourceLink: string;
  lastVerified: string;
  viewDetails: string;
  schemeDetailTitle: string;
  documentsTitle: string;
  mandatory: string;
  optional: string;
  whereToObtain: string;
  restart: string;
  yes: string;
  no: string;
}

export const STRINGS: Record<Language, UIStrings> = {
  en: {
    appTitle: "Yojana Saathi",
    selectLanguage: "Choose your language",
    selectLanguageSubtitle: "Select the language you are most comfortable with",
    selectNeedsTitle: "What do you need help with?",
    selectNeedsSubtitle: "Choose one or more areas that apply to you",
    continueBtn: "Continue",
    backBtn: "Back",
    dontKnowBtn: "I don't know",
    submitBtn: "Next",
    loading: "Loading...",
    errorTitle: "Something went wrong. Please check your connection.",
    errorRetry: "Try Again",
    questionProgress: "Question",
    resultsTitle: "Your Scheme Results",
    eligibleTitle: "You Qualify",
    needsInfoTitle: "You May Qualify",
    notEligibleTitle: "Not Eligible",
    showNotEligible: "Show schemes you don't qualify for",
    hideNotEligible: "Hide ineligible schemes",
    noEligibleSchemes: "No schemes found for this category yet.",
    benefitLabel: "Benefit",
    sourceLink: "Official Portal",
    lastVerified: "Verified on",
    viewDetails: "View Details & Documents",
    schemeDetailTitle: "Scheme Details",
    documentsTitle: "Required Documents",
    mandatory: "Mandatory",
    optional: "Optional",
    whereToObtain: "Where to get it",
    restart: "Start Over",
    yes: "Yes",
    no: "No",
  },
  hi: {
    appTitle: "योजना साथी",
    selectLanguage: "अपनी भाषा चुनें",
    selectLanguageSubtitle: "वह भाषा चुनें जिसमें आप सबसे सहज हैं",
    selectNeedsTitle: "आपको किस क्षेत्र में सहायता चाहिए?",
    selectNeedsSubtitle: "एक या अधिक विकल्प चुनें जो आप पर लागू होते हैं",
    continueBtn: "आगे बढ़ें",
    backBtn: "पीछे जाएं",
    dontKnowBtn: "मुझे नहीं पता",
    submitBtn: "अगला",
    loading: "लोड हो रहा है...",
    errorTitle: "कुछ गड़बड़ हुई। कृपया अपना कनेक्शन जांचें।",
    errorRetry: "पुनः प्रयास करें",
    questionProgress: "प्रश्न",
    resultsTitle: "आपके लिए योजनाएं",
    eligibleTitle: "आप पात्र हैं",
    needsInfoTitle: "आप पात्र हो सकते हैं",
    notEligibleTitle: "अपात्र योजनाएं",
    showNotEligible: "वे योजनाएं देखें जिनके लिए आप पात्र नहीं हैं",
    hideNotEligible: "अपात्र योजनाएं छिपाएं",
    noEligibleSchemes: "इस श्रेणी में अभी कोई योजना नहीं मिली।",
    benefitLabel: "लाभ",
    sourceLink: "आधिकारिक पोर्टल",
    lastVerified: "सत्यापित तिथि",
    viewDetails: "विवरण और आवश्यक दस्तावेज देखें",
    schemeDetailTitle: "योजना का विवरण",
    documentsTitle: "आवश्यक दस्तावेज",
    mandatory: "अनिवार्य",
    optional: "वैकल्पिक",
    whereToObtain: "कहाँ से प्राप्त करें",
    restart: "शुरू से करें",
    yes: "हाँ",
    no: "नहीं",
  },
};

