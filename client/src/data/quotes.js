// Quotes shown around the app.
//
// TWO KINDS, kept apart on purpose:
//
// 1. Quotes with an `author` are real, well-documented lines from real women.
//    VERIFY THESE BEFORE YOUR DEMO. Misattributing a quote to Savitribai Phule
//    in front of judges is worse than having no quote at all.
//
// 2. Quotes with author: null are written for this app, about money and
//    independence. Nobody is being quoted, so nothing can be misattributed.
//
// All of them are translated, because a line meant to encourage her is useless
// in a language she does not read.

export const QUOTES = [
  {
    id: "phule",
    author: "Savitribai Phule",
    text: {
      en: "Awake, arise, and educate. Break the chains of tradition.",
      hi: "जागो, उठो और शिक्षा पाओ। परंपरा की बेड़ियाँ तोड़ो।",
      ta: "விழித்தெழு, எழுந்து நில், கல்வி கற். மரபின் விலங்குகளை உடை.",
      te: "మేల్కొను, లేచి నిలబడు, చదువుకో. సంప్రదాయపు సంకెళ్లను తెంచు.",
      ml: "ഉണരൂ, എഴുന്നേൽക്കൂ, പഠിക്കൂ. പാരമ്പര്യത്തിന്റെ ചങ്ങലകൾ പൊട്ടിക്കൂ."
    }
  },
  {
    id: "chawla",
    author: "Kalpana Chawla",
    text: {
      en: "The path from dreams to success does exist.",
      hi: "सपनों से सफलता तक का रास्ता ज़रूर है।",
      ta: "கனவுகளிலிருந்து வெற்றிக்கான பாதை நிச்சயம் உள்ளது.",
      te: "కలల నుండి విజయానికి దారి ఖచ్చితంగా ఉంది.",
      ml: "സ്വപ്നങ്ങളിൽ നിന്ന് വിജയത്തിലേക്കുള്ള വഴി തീർച്ചയായും ഉണ്ട്."
    }
  },
  {
    id: "malala",
    author: "Malala Yousafzai",
    text: {
      en: "One child, one teacher, one book and one pen can change the world.",
      hi: "एक बच्चा, एक शिक्षक, एक किताब और एक कलम दुनिया बदल सकते हैं।",
      ta: "ஒரு குழந்தை, ஒரு ஆசிரியர், ஒரு புத்தகம், ஒரு பேனா உலகை மாற்றும்.",
      te: "ఒక పిల్ల, ఒక ఉపాధ్యాయుడు, ఒక పుస్తకం, ఒక పెన్ను ప్రపంచాన్ని మార్చగలవు.",
      ml: "ഒരു കുട്ടി, ഒരു അധ്യാപകൻ, ഒരു പുസ്തകം, ഒരു പേന ലോകത്തെ മാറ്റും."
    }
  },

  // --- written for this app, no attribution -----------------------------------
  {
    id: "own-name",
    author: null,
    text: {
      en: "An account in your own name is the first brick of your independence.",
      hi: "अपने नाम का खाता आपकी आज़ादी की पहली ईंट है।",
      ta: "உங்கள் சொந்தப் பெயரில் ஒரு கணக்கு, உங்கள் சுதந்திரத்தின் முதல் செங்கல்.",
      te: "మీ సొంత పేరు మీద ఖాతా మీ స్వాతంత్ర్యానికి మొదటి ఇటుక.",
      ml: "നിങ്ങളുടെ സ്വന്തം പേരിലുള്ള അക്കൗണ്ട് നിങ്ങളുടെ സ്വാതന്ത്ര്യത്തിന്റെ ആദ്യ ഇഷ്ടികയാണ്."
    }
  },
  {
    id: "small-daily",
    author: null,
    text: {
      en: "Twenty rupees saved every day beats a big amount promised once.",
      hi: "हर दिन बचाए बीस रुपये, एक बार वादा की गई बड़ी रकम से बेहतर हैं।",
      ta: "தினமும் சேமிக்கும் இருபது ரூபாய், ஒருமுறை வாக்களித்த பெரிய தொகையை விட சிறந்தது.",
      te: "ప్రతిరోజూ దాచిన ఇరవై రూపాయలు, ఒకసారి వాగ్దానం చేసిన పెద్ద మొత్తం కంటే మేలు.",
      ml: "എല്ലാ ദിവസവും സൂക്ഷിക്കുന്ന ഇരുപത് രൂപ, ഒരിക്കൽ വാഗ്ദാനം ചെയ്ത വലിയ തുകയേക്കാൾ മികച്ചതാണ്."
    }
  },
  {
    id: "your-numbers",
    author: null,
    text: {
      en: "When you know your own numbers, nobody can decide them for you.",
      hi: "जब आप अपने आँकड़े जानती हैं, तो कोई और उन्हें तय नहीं कर सकता।",
      ta: "உங்கள் சொந்த எண்களை நீங்கள் அறிந்தால், வேறு யாரும் அவற்றை முடிவு செய்ய முடியாது.",
      te: "మీ సొంత లెక్కలు మీకు తెలిస్తే, వాటిని మరెవరూ నిర్ణయించలేరు.",
      ml: "നിങ്ങളുടെ സ്വന്തം കണക്കുകൾ അറിയാമെങ്കിൽ, മറ്റാർക്കും അവ തീരുമാനിക്കാൻ കഴിയില്ല."
    }
  },
  {
    id: "no-collateral",
    author: null,
    text: {
      en: "You are not a risk. You are simply unmeasured. Let us change that.",
      hi: "आप जोखिम नहीं हैं। आपको बस मापा नहीं गया। आइए यह बदलें।",
      ta: "நீங்கள் ஆபத்து அல்ல. உங்களை அளக்கவே இல்லை. அதை மாற்றுவோம்.",
      te: "మీరు ప్రమాదం కాదు. మిమ్మల్ని కొలవలేదు అంతే. దాన్ని మారుద్దాం.",
      ml: "നിങ്ങൾ ഒരു അപകടമല്ല. നിങ്ങളെ അളന്നിട്ടില്ല എന്നു മാത്രം. അത് മാറ്റാം."
    }
  },
  {
    id: "record-is-proof",
    author: null,
    text: {
      en: "Every day you write down is a day a bank cannot ignore.",
      hi: "आप जो हर दिन लिखती हैं, वह एक ऐसा दिन है जिसे बैंक अनदेखा नहीं कर सकता।",
      ta: "நீங்கள் எழுதும் ஒவ்வொரு நாளும், வங்கியால் புறக்கணிக்க முடியாத ஒரு நாள்.",
      te: "మీరు రాసే ప్రతి రోజు, బ్యాంకు విస్మరించలేని ఒక రోజు.",
      ml: "നിങ്ങൾ എഴുതുന്ന ഓരോ ദിവസവും ബാങ്കിന് അവഗണിക്കാനാവാത്ത ഒരു ദിവസമാണ്."
    }
  }
];

// A different quote each day, but stable within a day, so the page does not
// flicker to a new one on every re-render.
export function quoteOfTheDay() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

export function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
