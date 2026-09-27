import { normalizeLanguageCode, isValidIso639_2 } from './languages';

export interface LanguageValidationResult {
  valid: boolean;
  normalizedLang: string;
  discardedReason?: string;
}

/**
 * Resolves a language code through user remap rules.
 * Handles direct matches, canonical ISO 639-2 aliases, and arbitrary N:N custom mappings.
 */
export function resolveLanguageRemap(
  lang: string,
  remapRules?: Record<string, string>
): string {
  if (!remapRules || Object.keys(remapRules).length === 0) {
    return lang;
  }

  const current = lang.trim().toLowerCase();

  // 1. Direct match on raw input string (e.g. 'eng', 'pt-br', 'por', 'pob', 'spa')
  if (remapRules[current]) {
    const target = remapRules[current].trim().toLowerCase();
    return normalizeLanguageCode(target) || target;
  }

  // 2. Direct match on canonical ISO 639-2 code
  const canonical = normalizeLanguageCode(current);
  if (canonical && remapRules[canonical]) {
    const target = remapRules[canonical].trim().toLowerCase();
    return normalizeLanguageCode(target) || target;
  }

  // 3. Match against aliases of keys in remapRules
  for (const [fromKey, toVal] of Object.entries(remapRules)) {
    const canonicalFrom = normalizeLanguageCode(fromKey);
    if (canonicalFrom && (canonicalFrom === current || canonicalFrom === canonical)) {
      const target = toVal.trim().toLowerCase();
      return normalizeLanguageCode(target) || target;
    }
  }

  return canonical || current;
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

  // 1. Check if raw string directly matches any remap rule first (e.g. user defined "pt-br" -> "eng")
  if (remapRules && Object.keys(remapRules).length > 0) {
    if (remapRules[cleanRaw]) {
      const target = remapRules[cleanRaw].trim().toLowerCase();
      const mapped = normalizeLanguageCode(target) || target;
      if (isValidIso639_2(mapped)) {
        return { valid: true, normalizedLang: mapped };
      }
    }
  }

  // 2. Canonicalize to ISO 639-2
  const normalized = normalizeLanguageCode(cleanRaw);

  if (normalized && isValidIso639_2(normalized)) {
    let finalLang = normalized;
    if (remapRules && Object.keys(remapRules).length > 0) {
      finalLang = resolveLanguageRemap(normalized, remapRules);
    }
    return { valid: true, normalizedLang: finalLang };
  }

  // 3. Check if raw alias matches remap rule
  if (remapRules && Object.keys(remapRules).length > 0) {
    const remapped = resolveLanguageRemap(cleanRaw, remapRules);
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
