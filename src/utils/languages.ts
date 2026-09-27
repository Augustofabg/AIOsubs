export interface LanguageInfo {
  code: string;       // Normalized 3-letter code (e.g. pob, por, eng)
  iso639_1: string;   // 2-letter code (e.g. pt, en)
  iso639_2: string;   // ISO 639-2 (T or B)
  name: string;       // Display name in English
  nativeName: string; // Native name
  flag: string;       // Emoji flag
  aliases: string[];  // Known aliases, variants, or provider codes
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'pob',
    iso639_1: 'pt',
    iso639_2: 'pob',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    aliases: [
      'pt-br', 'pt_br', 'ptbr', 'brazilian', 'brazilian portuguese', 'pob', 'pb',
      'portuguese (brazil)', 'portuguese (br)', 'portuguese brazil', 'portuguese brasil',
      'portugues (brasil)', 'portugues (br)', 'português (brasil)', 'português (br)',
      'portuguese-brazil', 'portuguese-br', 'portugues brasil', 'português brasil'
    ]
  },
  {
    code: 'por',
    iso639_1: 'pt',
    iso639_2: 'por',
    name: 'Portuguese (Portugal)',
    nativeName: 'Português (Portugal)',
    flag: '🇵🇹',
    aliases: [
      'pt-pt', 'pt_pt', 'ptpt', 'european portuguese', 'portuguese (portugal)', 'portuguese (pt)',
      'portuguese portugal', 'portugues (portugal)', 'portugues (pt)', 'português (portugal)', 'português (pt)',
      'portuguese-portugal', 'portuguese-pt', 'portugues portugal', 'português portugal',
      'portuguese', 'portugues', 'português', 'por', 'pt'
    ]
  },
  {
    code: 'eng',
    iso639_1: 'en',
    iso639_2: 'eng',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    aliases: ['en-us', 'en-gb', 'english', 'eng', 'en']
  },
  {
    code: 'spa',
    iso639_1: 'es',
    iso639_2: 'spa',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    aliases: ['es-es', 'es-419', 'spanish', 'castilian', 'castellano', 'spa', 'es']
  },
  {
    code: 'fra',
    iso639_1: 'fr',
    iso639_2: 'fra',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    aliases: ['fr-fr', 'french', 'francais', 'fra', 'fre', 'fr']
  },
  {
    code: 'deu',
    iso639_1: 'de',
    iso639_2: 'deu',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    aliases: ['de-de', 'german', 'deutsch', 'deu', 'ger', 'de']
  },
  {
    code: 'ita',
    iso639_1: 'it',
    iso639_2: 'ita',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    aliases: ['it-it', 'italian', 'italiano', 'ita', 'it']
  },
  {
    code: 'jpn',
    iso639_1: 'ja',
    iso639_2: 'jpn',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    aliases: ['ja-jp', 'japanese', 'nihongo', 'jpn', 'ja']
  },
  {
    code: 'kor',
    iso639_1: 'ko',
    iso639_2: 'kor',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    aliases: ['ko-kr', 'korean', 'kor', 'ko']
  },
  {
    code: 'zho',
    iso639_1: 'zh',
    iso639_2: 'zho',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    aliases: ['zh-cn', 'zh-tw', 'chinese', 'mandarin', 'chi', 'zho', 'zh']
  },
  {
    code: 'rus',
    iso639_1: 'ru',
    iso639_2: 'rus',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    aliases: ['ru-ru', 'russian', 'rus', 'ru']
  },
  {
    code: 'ara',
    iso639_1: 'ar',
    iso639_2: 'ara',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    aliases: ['arabic', 'ara', 'ar']
  },
  {
    code: 'hin',
    iso639_1: 'hi',
    iso639_2: 'hin',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    aliases: ['hindi', 'hin', 'hi']
  },
  {
    code: 'pol',
    iso639_1: 'pl',
    iso639_2: 'pol',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    aliases: ['polish', 'polski', 'pol', 'pl']
  },
  {
    code: 'nld',
    iso639_1: 'nl',
    iso639_2: 'nld',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    aliases: ['dutch', 'nederlands', 'nld', 'dut', 'nl']
  },
  {
    code: 'tur',
    iso639_1: 'tr',
    iso639_2: 'tur',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    aliases: ['turkish', 'turkce', 'tur', 'tr']
  },
  {
    code: 'swe',
    iso639_1: 'sv',
    iso639_2: 'swe',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    aliases: ['swedish', 'svenska', 'swe', 'sv']
  },
  {
    code: 'nor',
    iso639_1: 'no',
    iso639_2: 'nor',
    name: 'Norwegian',
    nativeName: 'Norsk',
    flag: '🇳🇴',
    aliases: ['norwegian', 'norsk', 'nor', 'no', 'nob', 'nno']
  },
  {
    code: 'dan',
    iso639_1: 'da',
    iso639_2: 'dan',
    name: 'Danish',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    aliases: ['danish', 'dansk', 'dan', 'da']
  },
  {
    code: 'fin',
    iso639_1: 'fi',
    iso639_2: 'fin',
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    aliases: ['finnish', 'suomi', 'fin', 'fi']
  },
  {
    code: 'ell',
    iso639_1: 'el',
    iso639_2: 'ell',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    aliases: ['greek', 'ell', 'gre', 'el']
  },
  {
    code: 'ces',
    iso639_1: 'cs',
    iso639_2: 'ces',
    name: 'Czech',
    nativeName: 'Čeština',
    flag: '🇨🇿',
    aliases: ['czech', 'ces', 'cze', 'cs']
  },
  {
    code: 'hun',
    iso639_1: 'hu',
    iso639_2: 'hun',
    name: 'Hungarian',
    nativeName: 'Magyar',
    flag: '🇭🇺',
    aliases: ['hungarian', 'magyar', 'hun', 'hu']
  },
  {
    code: 'ron',
    iso639_1: 'ro',
    iso639_2: 'ron',
    name: 'Romanian',
    nativeName: 'Română',
    flag: '🇷🇴',
    aliases: ['romanian', 'ron', 'rum', 'ro']
  },
  {
    code: 'ukr',
    iso639_1: 'uk',
    iso639_2: 'ukr',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    aliases: ['ukrainian', 'ukr', 'uk']
  },
  {
    code: 'ind',
    iso639_1: 'id',
    iso639_2: 'ind',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    aliases: ['indonesian', 'bahasa', 'ind', 'id']
  },
  {
    code: 'vie',
    iso639_1: 'vi',
    iso639_2: 'vie',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    aliases: ['vietnamese', 'vie', 'vi']
  },
  {
    code: 'tha',
    iso639_1: 'th',
    iso639_2: 'tha',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    aliases: ['thai', 'tha', 'th']
  },
  {
    code: 'heb',
    iso639_1: 'he',
    iso639_2: 'heb',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    aliases: ['hebrew', 'heb', 'he', 'iw']
  },
  {
    code: 'cat',
    iso639_1: 'ca',
    iso639_2: 'cat',
    name: 'Catalan',
    nativeName: 'Català',
    flag: '🇪🇸',
    aliases: ['catalan', 'catala', 'cat', 'ca']
  },
  {
    code: 'hrv',
    iso639_1: 'hr',
    iso639_2: 'hrv',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    flag: '🇭🇷',
    aliases: ['croatian', 'hrvatski', 'hrv', 'scr', 'hr']
  },
  {
    code: 'srp',
    iso639_1: 'sr',
    iso639_2: 'srp',
    name: 'Serbian',
    nativeName: 'Srpski',
    flag: '🇷🇸',
    aliases: ['serbian', 'srpski', 'srp', 'scc', 'sr']
  },
  {
    code: 'slv',
    iso639_1: 'sl',
    iso639_2: 'slv',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    flag: '🇸🇮',
    aliases: ['slovenian', 'slovenscina', 'slv', 'sl']
  },
  {
    code: 'bul',
    iso639_1: 'bg',
    iso639_2: 'bul',
    name: 'Bulgarian',
    nativeName: 'Български',
    flag: '🇧🇬',
    aliases: ['bulgarian', 'bul', 'bg']
  },
  {
    code: 'slk',
    iso639_1: 'sk',
    iso639_2: 'slk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    flag: '🇸🇰',
    aliases: ['slovak', 'slovencina', 'slk', 'slo', 'sk']
  },
  {
    code: 'tam',
    iso639_1: 'ta',
    iso639_2: 'tam',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    aliases: ['tamil', 'tam', 'ta']
  },
  {
    code: 'tgl',
    iso639_1: 'tl',
    iso639_2: 'tgl',
    name: 'Tagalog / Filipino',
    nativeName: 'Filipino',
    flag: '🇵🇭',
    aliases: ['tagalog', 'filipino', 'tgl', 'fil', 'tl']
  },
  {
    code: 'msa',
    iso639_1: 'ms',
    iso639_2: 'msa',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    aliases: ['malay', 'bahasa melayu', 'msa', 'may', 'ms']
  },
  {
    code: 'glg',
    iso639_1: 'gl',
    iso639_2: 'glg',
    name: 'Galician',
    nativeName: 'Galego',
    flag: '🇪🇸',
    aliases: ['galician', 'galego', 'glg', 'gl']
  },
  {
    code: 'eus',
    iso639_1: 'eu',
    iso639_2: 'eus',
    name: 'Basque',
    nativeName: 'Euskara',
    flag: '🇪🇸',
    aliases: ['basque', 'euskara', 'eus', 'baq', 'eu']
  }
];

// Pre-compute lookup table for fast O(1) matching
const LOOKUP_MAP = new Map<string, LanguageInfo>();
const VALID_ISO639_2_CODES = new Set<string>();

for (const lang of SUPPORTED_LANGUAGES) {
  VALID_ISO639_2_CODES.add(lang.code.toLowerCase());
  LOOKUP_MAP.set(lang.code.toLowerCase(), lang);
  LOOKUP_MAP.set(lang.iso639_1.toLowerCase(), lang);
  LOOKUP_MAP.set(lang.iso639_2.toLowerCase(), lang);
  LOOKUP_MAP.set(lang.name.toLowerCase(), lang);
  LOOKUP_MAP.set(lang.nativeName.toLowerCase(), lang);
  for (const alias of lang.aliases) {
    LOOKUP_MAP.set(alias.toLowerCase(), lang);
  }
}

/**
 * Checks whether a 3-letter code is a valid ISO 639-2 code known to Stremio/Nuvio
 */
export function isValidIso639_2(code: string | undefined | null): boolean {
  if (!code) return false;
  return VALID_ISO639_2_CODES.has(code.trim().toLowerCase());
}

/**
 * Normalizes any language string/code/alias into a standard 3-letter ISO 639-2 code (e.g. 'pob', 'eng', 'spa').
 * Returns null if the language cannot be resolved to a known ISO 639-2 code.
 */
export function normalizeLanguageCode(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim().toLowerCase().replace(/_/g, '-');
  if (clean === '' || clean === 'unknown' || clean === 'desconhecido') return null;

  // 1. Direct match in lookup map
  const found = LOOKUP_MAP.get(clean);
  if (found) return found.code;

  // 2. Strip brackets, parentheses, slashes (e.g. "Portuguese (BR)" -> "portuguese br")
  const stripped = clean.replace(/[()[\]/]/g, ' ').replace(/\s+/g, ' ').trim();
  const strippedFound = LOOKUP_MAP.get(stripped);
  if (strippedFound) return strippedFound.code;

  // 3. Try matching hyphenated prefix or subtag (e.g. "pt-br-sdh" -> "pt-br")
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 2) {
      const tag2 = `${parts[0]}-${parts[1]}`;
      const tag2Found = LOOKUP_MAP.get(tag2);
      if (tag2Found) return tag2Found.code;
    }
    const prefixFound = LOOKUP_MAP.get(parts[0]);
    if (prefixFound) return prefixFound.code;
  }

  return null;
}

/**
 * Maps ISO 639-2 whitelist languages to OpenSubtitles v1 codes (e.g. 'pob' -> 'pt-br,pob', 'eng' -> 'en,eng').
 * Also includes source languages from remapRules if their target is in the whitelist.
 */
export function mapWhitelistToOpenSubtitles(
  languages: string[],
  remapRules?: Record<string, string>
): string[] {
  const effectiveLanguages = new Set(languages.map(l => normalizeLanguageCode(l) || l.trim().toLowerCase()));

  if (remapRules && Object.keys(remapRules).length > 0) {
    for (const [from, to] of Object.entries(remapRules)) {
      const normTo = normalizeLanguageCode(to) || to.trim().toLowerCase();
      if (effectiveLanguages.has(normTo)) {
        const normFrom = normalizeLanguageCode(from) || from.trim().toLowerCase();
        effectiveLanguages.add(normFrom);
      }
    }
  }

  const result = new Set<string>();
  for (const lang of effectiveLanguages) {
    const norm = normalizeLanguageCode(lang) || lang.trim().toLowerCase();
    if (norm === 'pob') {
      result.add('pt-br');
      result.add('pob');
    } else if (norm === 'por') {
      result.add('pt-pt');
      result.add('por');
      result.add('pt');
    } else {
      const info = LOOKUP_MAP.get(norm);
      if (info?.iso639_1) {
        result.add(info.iso639_1);
      }
      result.add(norm);
    }
  }
  return Array.from(result);
}

/**
 * Maps ISO 639-2 whitelist languages to SubDL compatible codes (e.g. 'pob' -> 'PT-BR', 'eng' -> 'EN').
 * Also includes source languages from remapRules if their target is in the whitelist.
 */
export function mapWhitelistToSubDL(
  languages: string[],
  remapRules?: Record<string, string>
): string[] {
  const effectiveLanguages = new Set(languages.map(l => normalizeLanguageCode(l) || l.trim().toLowerCase()));

  if (remapRules && Object.keys(remapRules).length > 0) {
    for (const [from, to] of Object.entries(remapRules)) {
      const normTo = normalizeLanguageCode(to) || to.trim().toLowerCase();
      if (effectiveLanguages.has(normTo)) {
        const normFrom = normalizeLanguageCode(from) || from.trim().toLowerCase();
        effectiveLanguages.add(normFrom);
      }
    }
  }

  const result = new Set<string>();
  for (const lang of effectiveLanguages) {
    const norm = normalizeLanguageCode(lang) || lang.trim().toLowerCase();
    if (norm === 'pob') {
      result.add('PT-BR');
      result.add('POB');
    } else if (norm === 'por') {
      result.add('PT-PT');
      result.add('POR');
      result.add('PT');
    } else {
      const info = LOOKUP_MAP.get(norm);
      if (info?.iso639_1) {
        result.add(info.iso639_1.toUpperCase());
      }
      result.add(norm.toUpperCase());
    }
  }
  return Array.from(result);
}
