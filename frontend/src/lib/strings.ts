export type Language = "en" | "hi";

export interface UIStrings {
  appTitle: string;
  tagline: string;
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
  checklistTitle: string;
  checklistSubtitle: string;
  downloadPdfBtn: string;
  neededForSchemes: string;
  browseSchemes: string;
  guidedFlow: string;
  schemesDashboard: string;
  schemesSubtitle: string;
  totalSchemes: string;
  centralSchemes: string;
  stateSchemes: string;
  searchPlaceholder: string;
  allNeeds: string;
  allLevels: string;
  allStates: string;
  sampleBadge: string;
  checkEligibilityBtn: string;
  applyNow: string;
  howToApply: string;
  eligibilityCriteria: string;
  tabEligibility: string;
  tabDocuments: string;
  tabApply: string;
  officialCriteria: string;
  rulesCriteria: string;
  verdictEligible: string;
  verdictNotEligible: string;
  verdictNeedsInfo: string;
  verdictEligibleDesc: string;
  verdictNotEligibleDesc: string;
  verdictNeedsInfoDesc: string;
  criterionMet: string;
  criterionNotMet: string;
  criterionUnknown: string;
  noSchemesFound: string;
  clearFilters: string;
  page: string;
  of: string;
  nextPage: string;
  prevPage: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroSearchPlaceholder: string;
  heroCheckEligibility: string;
  freshnessBadge: string;
  docsCountLabel: string;
  doIQualify: string;
  resultCount: string;
  statsCategories: string;
  health: string;
  education: string;
  farming: string;
}

export const STRINGS: Record<Language, UIStrings> = {
  en: {
    appTitle: "Yojana Saathi",
    tagline: "Transparent eligibility engine for Indian public welfare",
    selectLanguage: "Select Language",
    selectLanguageSubtitle: "Choose your preferred reading language",
    selectNeedsTitle: "Select your priority areas",
    selectNeedsSubtitle: "Choose one or more domains to evaluate",
    continueBtn: "Continue",
    backBtn: "Previous",
    dontKnowBtn: "I don't know",
    submitBtn: "Next question",
    loading: "Retrieving official records...",
    errorTitle: "Network issue encountered. Please re-attempt.",
    errorRetry: "Retry lookup",
    questionProgress: "Step",
    resultsTitle: "Evaluated Welfare Schemes",
    eligibleTitle: "Qualifying Schemes",
    needsInfoTitle: "Requires Additional Details",
    notEligibleTitle: "Does Not Meet Criteria",
    showNotEligible: "Show non-qualifying schemes",
    hideNotEligible: "Hide non-qualifying schemes",
    noEligibleSchemes: "No schemes match the provided answers yet.",
    benefitLabel: "Benefit Value",
    sourceLink: "Government Portal",
    lastVerified: "Audited",
    viewDetails: "Inspect Scheme",
    schemeDetailTitle: "Scheme Specifications",
    documentsTitle: "Prerequisite Documents",
    mandatory: "Required",
    optional: "Supporting",
    whereToObtain: "Issuing Authority",
    restart: "Reset assessment",
    yes: "Yes",
    no: "No",
    checklistTitle: "Document Readiness Register",
    checklistSubtitle: "Consolidated paperwork required for your qualifying schemes",
    downloadPdfBtn: "Export PDF Register",
    neededForSchemes: "Required by:",
    browseSchemes: "Schemes Directory",
    guidedFlow: "Eligibility Engine",
    schemesDashboard: "Scheme Directory",
    schemesSubtitle: "Direct repository of central and state government benefits",
    totalSchemes: "Total Schemes",
    centralSchemes: "Central Government",
    stateSchemes: "State Government",
    searchPlaceholder: "Search schemes by title, keyword or benefit...",
    allNeeds: "All Domains",
    allLevels: "All Jurisdictions",
    allStates: "All States",
    sampleBadge: "SAMPLE",
    checkEligibilityBtn: "Verify Eligibility",
    applyNow: "Official Application Portal",
    howToApply: "Application Instructions",
    eligibilityCriteria: "Official Criteria",
    tabEligibility: "Eligibility",
    tabDocuments: "Documents",
    tabApply: "Application",
    officialCriteria: "Gazette Summary",
    rulesCriteria: "Evaluation Logic",
    verdictEligible: "Criteria Satisfied",
    verdictNotEligible: "Criteria Unmet",
    verdictNeedsInfo: "Pending Verification",
    verdictEligibleDesc: "All mandatory criteria for this scheme evaluate as true.",
    verdictNotEligibleDesc: "One or more conditions fail to meet the published guidelines.",
    verdictNeedsInfoDesc: "Answer the remaining inquiries to complete evaluation.",
    criterionMet: "Satisfied",
    criterionNotMet: "Unmet",
    criterionUnknown: "Unspecified",
    noSchemesFound: "No schemes match your active filter criteria.",
    clearFilters: "Reset filters",
    page: "Page",
    of: "of",
    nextPage: "Next",
    prevPage: "Prev",
    heroHeadline: "Start with your situation.",
    heroSubtitle: "Deterministic qualification evaluation directly mapped to official government guidelines.",
    heroSearchPlaceholder: "Search by welfare program, keyword or grant...",
    heroCheckEligibility: "Run Eligibility Check",
    freshnessBadge: "Official Entry",
    docsCountLabel: "Documents Required",
    doIQualify: "Am I eligible?",
    resultCount: "Schemes Catalogued",
    statsCategories: "Focus Areas",
    health: "Healthcare",
    education: "Education",
    farming: "Agriculture",
  },
  hi: {
    appTitle: "योजना साथी",
    tagline: "भारतीय लोक कल्याण के लिए पारदर्शी पात्रता प्रणाली",
    selectLanguage: "भाषा चुनें",
    selectLanguageSubtitle: "अपनी सुविधानुसार भाषा का चयन करें",
    selectNeedsTitle: "अपनी प्राथमिकता चुनें",
    selectNeedsSubtitle: "एक या अधिक आवश्यक क्षेत्रों का चयन करें",
    continueBtn: "आगे बढ़ें",
    backBtn: "पिछला",
    dontKnowBtn: "मुझे जानकारी नहीं है",
    submitBtn: "अगला प्रश्न",
    loading: "सरकारी डेटा लोड हो रहा है...",
    errorTitle: "संपर्क में त्रुटि। कृपया पुनः प्रयास करें।",
    errorRetry: "पुनः प्रयास",
    questionProgress: "चरण",
    resultsTitle: "मूल्यांकन परिणाम",
    eligibleTitle: "पात्र योजनाएं",
    needsInfoTitle: "अतिरिक्त विवरण अपेक्षित",
    notEligibleTitle: "मानदंड पूर्ण नहीं",
    showNotEligible: "अपात्र योजनाएं देखें",
    hideNotEligible: "अपात्र योजनाएं छिपाएं",
    noEligibleSchemes: "वर्तमान उत्तरों के आधार पर कोई योजना पात्र नहीं मिली।",
    benefitLabel: "लाभ विवरण",
    sourceLink: "आधिकारिक पोर्टल",
    lastVerified: "सत्यापित",
    viewDetails: "योजना विवरण",
    schemeDetailTitle: "योजना की विशिष्टता",
    documentsTitle: "आवश्यक दस्तावेज़",
    mandatory: "अनिवार्य",
    optional: "वैकल्पिक",
    whereToObtain: "जारीकर्ता कार्यालय",
    restart: "पुनः आरंभ करें",
    yes: "हाँ",
    no: "नहीं",
    checklistTitle: "दस्तावेज़ रजिस्टर",
    checklistSubtitle: "पात्र योजनाओं के लिए आवश्यक प्रमाण पत्रों की सूची",
    downloadPdfBtn: "पीडीएफ डाउनलोड करें",
    neededForSchemes: "इन योजनाओं हेतु आवश्यक:",
    browseSchemes: "योजना निर्देशिका",
    guidedFlow: "पात्रता जांच",
    schemesDashboard: "योजना निर्देशिका",
    schemesSubtitle: "केंद्र और राज्य सरकार की प्रमाणित जनकल्याणकारी योजनाएं",
    totalSchemes: "कुल योजनाएं",
    centralSchemes: "केंद्र सरकार",
    stateSchemes: "राज्य सरकार",
    searchPlaceholder: "योजना का नाम, लाभ या शब्द खोजें...",
    allNeeds: "सभी क्षेत्र",
    allLevels: "सभी स्तर",
    allStates: "सभी राज्य",
    sampleBadge: "नमूना (SAMPLE)",
    checkEligibilityBtn: "पात्रता जांचें",
    applyNow: "आधिकारिक आवेदन पोर्टल",
    howToApply: "आवेदन की प्रक्रिया",
    eligibilityCriteria: "सरकारी मानदंड",
    tabEligibility: "पात्रता",
    tabDocuments: "दस्तावेज़",
    tabApply: "आवेदन विधि",
    officialCriteria: "राजपत्र सारांश",
    rulesCriteria: "तार्किक नियम",
    verdictEligible: "मानदंड संतुष्ट",
    verdictNotEligible: "अपात्र",
    verdictNeedsInfo: "सत्यापन बाकी",
    verdictEligibleDesc: "सभी अनिवार्य नियम सफलतापूर्वक संतुष्ट पाए गए हैं।",
    verdictNotEligibleDesc: "एक या अधिक अनिवार्य शर्तें वर्तमान में पूर्ण नहीं होती हैं।",
    verdictNeedsInfoDesc: "योजना की पात्रता जांचने के लिए शेष प्रश्नों का उत्तर दें।",
    criterionMet: "संतुष्ट",
    criterionNotMet: "अपूर्ण",
    criterionUnknown: "अज्ञात",
    noSchemesFound: "वर्तमान फ़िल्टर के अनुसार कोई योजना नहीं मिली।",
    clearFilters: "फ़िल्टर हटाएं",
    page: "पृष्ठ",
    of: "का",
    nextPage: "आगे",
    prevPage: "पीछे",
    heroHeadline: "अपनी स्थिति से शुरुआत करें।",
    heroSubtitle: "आधिकारिक नियमों पर आधारित पारदर्शी और सटीक पात्रता मूल्यांकन प्रणाली।",
    heroSearchPlaceholder: "योजना या कल्याणकारी सहायता खोजें...",
    heroCheckEligibility: "पात्रता जांचें",
    freshnessBadge: "सत्यापित प्रविष्टि",
    docsCountLabel: "आवश्यक दस्तावेज़",
    doIQualify: "क्या मैं पात्र हूँ?",
    resultCount: "सूचीबद्ध योजनाएं",
    statsCategories: "प्रमुख क्षेत्र",
    health: "स्वास्थ्य",
    education: "शिक्षा",
    farming: "कृषि",
  },
};
