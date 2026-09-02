// Real government schemes. Matching runs against what the user entered in
// onboarding and her Money Map, so results differ per user.

export const SCHEMES = [
  {
    id: "mudra-shishu",
    name: "Mudra Shishu",
    max: 50000,
    collateralFree: true,
    blurb: "For a business that is just starting or still small.",
    who: "Any small business. No minimum years needed.",
    docs: ["Aadhaar card", "PAN card", "2 photos", "Simple note on what the money is for"],
    matches: () => true
  },
  {
    id: "mudra-kishore",
    name: "Mudra Kishore",
    max: 500000,
    collateralFree: true,
    blurb: "For a business that is already running and wants to grow.",
    who: "Business running for at least 1 year.",
    docs: [
      "Aadhaar card",
      "PAN card",
      "Bank statement for 6 months",
      "Proof you do this work (rent slip, licence, or photos)"
    ],
    matches: (p) => (Number(p.yearsRunning) || 0) >= 1
  },
  {
    id: "mudra-tarun",
    name: "Mudra Tarun",
    max: 1000000,
    collateralFree: true,
    blurb: "For a well established business making a bigger jump.",
    who: "Business running for at least 3 years.",
    docs: [
      "Aadhaar card",
      "PAN card",
      "Bank statement for 12 months",
      "Business registration if you have it",
      "Income tax return if you file one"
    ],
    matches: (p) => (Number(p.yearsRunning) || 0) >= 3
  },
  {
    id: "annapurna",
    name: "Annapurna Scheme",
    max: 50000,
    collateralFree: false,
    blurb: "Working capital for women in food and catering work.",
    who: "Women who cook, cater, or sell food.",
    docs: ["Aadhaar card", "Guarantor", "List of what you will buy (vessels, stove, etc.)"],
    matches: (p) => ["food", "catering", "tiffin", "snacks"].includes(p.businessType)
  },
  {
    id: "udyogini",
    name: "Udyogini Scheme",
    max: 300000,
    collateralFree: true,
    blurb: "For women running small trade and service businesses.",
    who: "Women aged 18 to 55 in trade, service or small manufacturing.",
    docs: ["Aadhaar card", "Income certificate", "Caste certificate if applicable", "Business details"],
    matches: () => true
  },
  {
    id: "standup-india",
    name: "Stand-Up India",
    max: 10000000,
    collateralFree: false,
    blurb: "Larger loans for women starting a new manufacturing, service or trading business.",
    who: "Women starting a brand new business. From 10 lakh upwards.",
    docs: [
      "Aadhaar card",
      "PAN card",
      "Detailed business plan",
      "Quotations for machines or stock",
      "Proof of place of business"
    ],
    matches: (p) => (Number(p.yearsRunning) || 0) >= 2
  },
  {
    id: "shg-linkage",
    name: "SHG Bank Linkage",
    max: 200000,
    collateralFree: true,
    blurb: "Your Self Help Group borrows from the bank and lends to members. Lowest interest of all.",
    who: "Members of a Self Help Group, usually after 6 months of regular saving.",
    docs: ["Group savings passbook", "Group resolution", "Aadhaar card"],
    matches: (p) => Boolean(p.shgMember)
  }
];

// Every option a user can tap is translated into all five languages.
// These sit on the main data-entry forms, so leaving them in English would
// break the promise that changing language changes the whole experience.

const SOMETHING_ELSE = {
  en: "Something else",
  hi: "कुछ और",
  ta: "வேறு ஏதாவது",
  te: "మరేదైనా",
  ml: "മറ്റെന്തെങ്കിലും"
};

export const BUSINESS_TYPES = [
  { value: "vegetables", icon: "🥬", labels: { en: "Selling vegetables or fruit", hi: "सब्ज़ी या फल बेचना", ta: "காய்கறி அல்லது பழம் விற்பது", te: "కూరగాయలు లేదా పండ్లు అమ్మడం", ml: "പച്ചക്കറി അല്ലെങ്കിൽ പഴം വിൽക്കൽ" } },
  { value: "food", icon: "🍲", labels: { en: "Cooking and selling food", hi: "खाना बनाकर बेचना", ta: "சமைத்து உணவு விற்பது", te: "వంట చేసి ఆహారం అమ్మడం", ml: "ഭക്ഷണം പാകം ചെയ്ത് വിൽക്കൽ" } },
  { value: "tiffin", icon: "🍱", labels: { en: "Tiffin or lunch service", hi: "टिफ़िन या खाने की सेवा", ta: "டிபன் அல்லது மதிய உணவு சேவை", te: "టిఫిన్ లేదా భోజన సేవ", ml: "ടിഫിൻ അല്ലെങ്കിൽ ഉച്ചഭക്ഷണ സേവനം" } },
  { value: "snacks", icon: "🧁", labels: { en: "Making snacks or sweets", hi: "नाश्ता या मिठाई बनाना", ta: "தின்பண்டம் அல்லது இனிப்பு செய்வது", te: "స్నాక్స్ లేదా స్వీట్లు తయారు చేయడం", ml: "പലഹാരം അല്ലെങ്കിൽ മധുരം ഉണ്ടാക്കൽ" } },
  { value: "tailoring", icon: "🧵", labels: { en: "Tailoring or stitching", hi: "सिलाई का काम", ta: "தையல் வேலை", te: "కుట్టు పని", ml: "തയ്യൽ ജോലി" } },
  { value: "beauty", icon: "💇", labels: { en: "Beauty parlour or salon", hi: "ब्यूटी पार्लर या सैलून", ta: "அழகு நிலையம்", te: "బ్యూటీ పార్లర్", ml: "ബ്യൂട്ടി പാർലർ" } },
  { value: "shop", icon: "🏪", labels: { en: "Small shop or kirana", hi: "छोटी दुकान या किराना", ta: "சிறிய கடை", te: "చిన్న దుకాణం", ml: "ചെറിയ കട" } },
  { value: "handicraft", icon: "🧶", labels: { en: "Handicraft or weaving", hi: "हस्तशिल्प या बुनाई", ta: "கைவினை அல்லது நெசவு", te: "చేతిపని లేదా నేత", ml: "കൈത്തൊഴിൽ അല്ലെങ്കിൽ നെയ്ത്ത്" } },
  { value: "dairy", icon: "🐄", labels: { en: "Milk, dairy or poultry", hi: "दूध, डेयरी या मुर्गीपालन", ta: "பால், பண்ணை அல்லது கோழி வளர்ப்பு", te: "పాలు, డెయిరీ లేదా కోళ్ల పెంపకం", ml: "പാൽ, ഡയറി അല്ലെങ്കിൽ കോഴിവളർത്തൽ" } },
  { value: "tuition", icon: "📚", labels: { en: "Teaching or tuition", hi: "पढ़ाना या ट्यूशन", ta: "கற்பித்தல் அல்லது டியூஷன்", te: "బోధన లేదా ట్యూషన్", ml: "പഠിപ്പിക്കൽ അല്ലെങ്കിൽ ട്യൂഷൻ" } },
  { value: "other", icon: "💼", labels: SOMETHING_ELSE }
];

export const EXPENSE_CATEGORIES = [
  { value: "stock", icon: "📦", labels: { en: "Stock or raw material", hi: "सामान या कच्चा माल", ta: "சரக்கு அல்லது மூலப்பொருள்", te: "సరుకు లేదా ముడి పదార్థం", ml: "സാധനം അല്ലെങ്കിൽ അസംസ്കൃത വസ്തു" } },
  { value: "rent", icon: "🏠", labels: { en: "Rent for shop or cart", hi: "दुकान या ठेले का किराया", ta: "கடை அல்லது வண்டி வாடகை", te: "దుకాణం లేదా బండి అద్దె", ml: "കട അല്ലെങ്കിൽ വണ്ടി വാടക" } },
  { value: "transport", icon: "🛺", labels: { en: "Transport", hi: "आना-जाना", ta: "போக்குவரத்து", te: "రవాణా", ml: "യാത്ര" } },
  { value: "household", icon: "🏡", labels: { en: "Household and food", hi: "घर और खाना", ta: "வீடு மற்றும் உணவு", te: "ఇల్లు మరియు ఆహారం", ml: "വീടും ഭക്ഷണവും" } },
  { value: "school", icon: "🎒", labels: { en: "School and children", hi: "स्कूल और बच्चे", ta: "பள்ளி மற்றும் குழந்தைகள்", te: "స్కూల్ మరియు పిల్లలు", ml: "സ്കൂളും കുട്ടികളും" } },
  { value: "health", icon: "💊", labels: { en: "Medicine and health", hi: "दवा और सेहत", ta: "மருந்து மற்றும் உடல்நலம்", te: "మందు మరియు ఆరోగ్యం", ml: "മരുന്നും ആരോഗ്യവും" } },
  { value: "shg", icon: "👭", labels: { en: "Self Help Group payment", hi: "स्वयं सहायता समूह का पैसा", ta: "சுய உதவிக் குழு பணம்", te: "స్వయం సహాయక సంఘం చెల్లింపు", ml: "സ്വയം സഹായ സംഘ പണം" } },
  { value: "loan", icon: "🏦", labels: { en: "Loan repayment", hi: "कर्ज़ की किस्त", ta: "கடன் திருப்பிச் செலுத்தல்", te: "రుణ చెల్లింపు", ml: "വായ്പ തിരിച്ചടവ്" } },
  { value: "other", icon: "•", labels: SOMETHING_ELSE }
];

export const INCOME_SOURCES = [
  { value: "sales", icon: "💰", labels: { en: "Selling my goods", hi: "अपना सामान बेचना", ta: "என் பொருட்களை விற்பது", te: "నా వస్తువులు అమ్మడం", ml: "എന്റെ സാധനങ്ങൾ വിൽക്കൽ" } },
  { value: "service", icon: "🤝", labels: { en: "Service I did", hi: "मैंने जो सेवा दी", ta: "நான் செய்த சேவை", te: "నేను చేసిన సేవ", ml: "ഞാൻ ചെയ്ത സേവനം" } },
  { value: "order", icon: "📋", labels: { en: "A big order", hi: "बड़ा ऑर्डर", ta: "பெரிய ஆர்டர்", te: "పెద్ద ఆర్డర్", ml: "വലിയ ഓർഡർ" } },
  { value: "other", icon: "•", labels: SOMETHING_ELSE }
];

export const ASSET_TYPES = [
  { value: "gold", icon: "💍", labels: { en: "Gold or jewellery", hi: "सोना या गहने", ta: "தங்கம் அல்லது நகை", te: "బంగారం లేదా నగలు", ml: "സ്വർണ്ണം അല്ലെങ്കിൽ ആഭരണം" } },
  { value: "land", icon: "🏘️", labels: { en: "Land or house", hi: "ज़मीन या घर", ta: "நிலம் அல்லது வீடு", te: "భూమి లేదా ఇల్లు", ml: "ഭൂമി അല്ലെങ്കിൽ വീട്" } },
  { value: "vehicle", icon: "🛒", labels: { en: "Cart, cycle or vehicle", hi: "ठेला, साइकिल या गाड़ी", ta: "வண்டி, சைக்கிள் அல்லது வாகனம்", te: "బండి, సైకిల్ లేదా వాహనం", ml: "വണ്ടി, സൈക്കിൾ അല്ലെങ്കിൽ വാഹനം" } },
  { value: "equipment", icon: "⚙️", labels: { en: "Machine or equipment", hi: "मशीन या औज़ार", ta: "இயந்திரம் அல்லது கருவி", te: "యంత్రం లేదా పరికరం", ml: "യന്ത്രം അല്ലെങ്കിൽ ഉപകരണം" } },
  { value: "livestock", icon: "🐐", labels: { en: "Animals", hi: "जानवर", ta: "விலங்குகள்", te: "జంతువులు", ml: "മൃഗങ്ങൾ" } },
  { value: "savings", icon: "🏧", labels: { en: "Savings or deposit", hi: "बचत या जमा", ta: "சேமிப்பு அல்லது வைப்பு", te: "పొదుపు లేదా డిపాజిట్", ml: "സമ്പാദ്യം അല്ലെങ്കിൽ നിക്ഷേപം" } },
  { value: "other", icon: "•", labels: SOMETHING_ELSE }
];

// Turns any of the lists above into the {value, label, icon} shape the
// ChoiceGrid expects, in the language currently selected.
export function localise(list, lang) {
  return list.map((o) => ({
    value: o.value,
    icon: o.icon,
    label: o.labels[lang] || o.labels.en
  }));
}

// Look up a single label, for tables and summaries.
export function labelOf(list, value, lang) {
  const found = list.find((o) => o.value === value);
  return found ? found.labels[lang] || found.labels.en : value;
}

export function matchSchemes(profile) {
  return SCHEMES.map((s) => ({
    ...s,
    qualifies: s.matches(profile || {})
  })).sort((a, b) => Number(b.qualifies) - Number(a.qualifies) || a.max - b.max);
}
