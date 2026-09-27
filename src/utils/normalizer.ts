import { normalizeLanguageCode, isValidIso639_2 } from './languages';

export interface LanguageValidationResult {
  valid: boolean;
  normalizedLang: string;
  discardedReason?: string;
}

/**
 * Resolves a language code through user remap rules.
 * Handles direct matches, canonical ISO 639-2 aliases, and chaining.
 */
export function resolveLanguageRemap(
  lang: string,
  remapRules?: Record<string, string>
): string {
  if (!remapRules || Object.keys(remapRules).length === 0) {
    return lang;
  }

  let current = lang.trim().toLowerCase();
  const visited = new Set<string>();

  while (current && !visited.has(current)) {
    visited.add(current);

    // 1. Direct match on current string (e.g. 'por', 'pt-pt', 'pt-br')
    if (remapRules[current]) {
      const target = remapRules[current].trim().toLowerCase();
      current = normalizeLanguageCode(target) || target;
      continue;
    }

    // 2. Canonical ISO 639-2 match
    const canonical = normalizeLanguageCode(current);
    if (canonical && canonical !== current && remapRules[canonical]) {
      const target = remapRules[canonical].trim().toLowerCase();
      current = normalizeLanguageCode(target) || target;
      continue;
    }

    // 3. Match against aliases of rules
    let found = false;
    for (const [fromKey, toVal] of Object.entries(remapRules)) {
      const canonicalFrom = normalizeLanguageCode(fromKey);
      if (canonicalFrom && (canonicalFrom === current || canonicalFrom === canonical)) {
        const target = toVal.trim().toLowerCase();
        current = normalizeLanguageCode(target) || target;
        found = true;
        break;
      }
    }

    if (!found) {
      break;
    }
  }

  return normalizeLanguageCode(current) || current;
}

export function validateAndNormalizeLanguage(
  rawLang: string | undefined | null,
  allowUnknown: boolean = false,
  remapRules?: Record<string, string>
): LanguageValidationResult {
  if (!rawLang || typeof rawLang !== 'string' || rawLang.trim() === '') {
    if (allowUnknown) {
      return { valid: true, normalizedLang: 'und' };
    }
    return {
      valid: false,
      normalizedLang: '',
      discardedReason: 'Campo de idioma vazio ou ausente na resposta do provedor.'
    };
  }

  const cleanRaw = rawLang.trim().toLowerCase();

  // Canonicalize to ISO 639-2 first
  const normalized = normalizeLanguageCode(cleanRaw);

  if (normalized && isValidIso639_2(normalized)) {
    let finalLang = normalized;
    if (remapRules && Object.keys(remapRules).length > 0) {
      if (remapRules[cleanRaw]) {
        finalLang = resolveLanguageRemap(remapRules[cleanRaw], remapRules);
      } else {
        finalLang = resolveLanguageRemap(normalized, remapRules);
      }
    }
    return { valid: true, normalizedLang: finalLang };
  }

  // Also check if raw alias exists in remap rules directly (e.g. "pt-br" -> "pob")
  if (remapRules && remapRules[cleanRaw]) {
    const remapped = resolveLanguageRemap(remapRules[cleanRaw], remapRules);
    if (isValidIso639_2(remapped)) {
      return { valid: true, normalizedLang: remapped };
    }
  }

  if (allowUnknown) {
    return { valid: true, normalizedLang: 'und' };
  }

  return {
    valid: false,
    normalizedLang: '',
    discardedReason: `Código de idioma "${rawLang}" não é um ISO 639-2 válido reconhecido.`
  };
}

export function isLanguageWhitelisted(
  normalizedLang: string,
  whitelist: string[]
): boolean {
  if (!whitelist || whitelist.length === 0) {
    return true;
  }

  const cleanLang = normalizedLang.trim().toLowerCase();
  const normalizedWhitelist = whitelist
    .map(l => normalizeLanguageCode(l) || l.trim().toLowerCase());

  return normalizedWhitelist.includes(cleanLang);
}
