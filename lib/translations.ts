export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    cases: "Cases",
    upload: "Upload",
    outbreaks: "Outbreaks",
    analytics: "Analytics",
    reports: "Reports",
    dataQuality: "Data Quality",
    predictions: "Predictions",
    settings: "Settings",
    organization: "Organization",
    users: "Users",

    // Header
    appTitle: "OneHealth Grid",
    appSubtitle: "Disease Surveillance Platform",
    logout: "Logout",

    // Dashboard
    totalCases: "Total Cases",
    confirmedCases: "Confirmed Cases",
    resolvedCases: "Resolved Cases",
    activeOutbreaks: "Active Outbreaks",
    criticalAlerts: "Critical Alerts",
    recentCases: "Recent Cases",
    outbreakAlerts: "Outbreak Alerts",
    diseaseDistribution: "Disease Distribution",
    casesTrend: "Cases Trend",

    // Cases
    caseID: "Case ID",
    disease: "Disease",
    status: "Status",
    location: "Location",
    reportedDate: "Reported Date",
    viewDetails: "View Details",
    filterByStatus: "Filter by Status",
    filterByDisease: "Filter by Disease",
    filterByDate: "Filter by Date",
    search: "Search",
    export: "Export",

    // Upload
    uploadCases: "Upload Cases",
    dragDropFiles: "Drag and drop CSV files here",
    selectFiles: "Select Files",
    uploading: "Uploading...",
    uploadSuccess: "Upload Successful",
    uploadError: "Upload Error",

    // Outbreaks
    outbreakName: "Outbreak Name",
    severity: "Severity",
    casesCount: "Cases Count",
    startDate: "Start Date",
    endDate: "End Date",

    // Analytics
    statistics: "Statistics",
    trends: "Trends",
    insights: "Insights",

    // Reports
    generateReport: "Generate Report",
    reportType: "Report Type",
    dateRange: "Date Range",

    // Settings
    notifications: "Notifications",
    emailNotifications: "Email Notifications",
    language: "Language",

    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
  },
  hi: {
    // Navigation
    dashboard: "डैशबोर्ड",
    cases: "मामले",
    upload: "अपलोड",
    outbreaks: "प्रकोप",
    analytics: "विश्लेषण",
    reports: "रिपोर्ट",
    dataQuality: "डेटा गुणवत्ता",
    predictions: "भविष्यवाणियां",
    settings: "सेटिंग्स",
    organization: "संगठन",
    users: "उपयोगकर्ता",

    // Header
    appTitle: "वनहेल्थ ग्रिड",
    appSubtitle: "रोग निगरानी मंच",
    logout: "लॉगआउट",

    // Dashboard
    totalCases: "कुल मामले",
    confirmedCases: "पुष्टि किए गए मामले",
    resolvedCases: "समाधान किए गए मामले",
    activeOutbreaks: "सक्रिय प्रकोप",
    criticalAlerts: "महत्वपूर्ण सतर्कताएं",
    recentCases: "हाल के मामले",
    outbreakAlerts: "प्रकोप सतर्कताएं",
    diseaseDistribution: "रोग वितरण",
    casesTrend: "मामलों का रुझान",

    // Cases
    caseID: "मामला आईडी",
    disease: "रोग",
    status: "स्थिति",
    location: "स्थान",
    reportedDate: "रिपोर्ट की गई तारीख",
    viewDetails: "विवरण देखें",
    filterByStatus: "स्थिति के अनुसार फ़िल्टर करें",
    filterByDisease: "रोग के अनुसार फ़िल्टर करें",
    filterByDate: "तारीख के अनुसार फ़िल्टर करें",
    search: "खोज",
    export: "निर्यात",

    // Upload
    uploadCases: "मामले अपलोड करें",
    dragDropFiles: "CSV फ़ाइलों को यहाँ खींचें और छोड़ें",
    selectFiles: "फ़ाइलें चुनें",
    uploading: "अपलोड हो रहा है...",
    uploadSuccess: "अपलोड सफल",
    uploadError: "अपलोड त्रुटि",

    // Outbreaks
    outbreakName: "प्रकोप का नाम",
    severity: "गंभीरता",
    casesCount: "मामलों की संख्या",
    startDate: "शुरुआत की तारीख",
    endDate: "समाप्ति की तारीख",

    // Analytics
    statistics: "आंकड़े",
    trends: "रुझान",
    insights: "अंतर्दृष्टि",

    // Reports
    generateReport: "रिपोर्ट जेनरेट करें",
    reportType: "रिपोर्ट प्रकार",
    dateRange: "तारीख की सीमा",

    // Settings
    notifications: "सूचनाएं",
    emailNotifications: "ईमेल सूचनाएं",
    language: "भाषा",

    // Common
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    add: "जोड़ें",
    close: "बंद करें",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
  },
}

export type Language = "en" | "hi"
export type TranslationKey = keyof typeof translations.en
