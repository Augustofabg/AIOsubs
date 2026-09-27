import AdmZip from 'adm-zip';
import zlib from 'zlib';
import path from 'path';
import { Logger } from '../../utils/logger';

export interface ArchiveExtractionOptions {
  type?: 'movie' | 'series' | string;
  season?: number | string;
  episode?: number | string;
  targetLang?: string;
  preferredFormat?: 'srt' | 'vtt' | 'ass' | 'ssa';
}

export interface ArchiveExtractionResult {
  buffer: Buffer;
  filename: string;
  format: 'srt' | 'vtt' | 'ass' | 'ssa';
  isArchive: boolean;
  extractedEntryName?: string;
}

const VALID_SUBTITLE_EXTENSIONS = new Set(['.srt', '.vtt', '.ass', '.ssa']);

/**
 * Common language aliases to match filenames against target language tags
 */
const LANGUAGE_ALIASES: Record<string, string[]> = {
  pob: ['pob', 'pt-br', 'pt_br', 'ptbr', 'brazilian', 'pt-brasil', 'pt-brazil', 'por-br'],
  por: ['por', 'pt', 'pt-pt', 'pt_pt', 'portuguese', 'portugues'],
  eng: ['eng', 'en', 'english', 'en-us', 'en-gb'],
  spa: ['spa', 'es', 'spanish', 'espanol', 'esp'],
  fre: ['fre', 'fra', 'fr', 'french', 'francais'],
  ger: ['ger', 'deu', 'de', 'german', 'deutsch'],
  ita: ['ita', 'it', 'italian', 'italiano'],
  rus: ['rus', 'ru', 'russian'],
  ara: ['ara', 'ar', 'arabic'],
  chi: ['chi', 'zho', 'zh', 'chinese']
};

/**
 * Checks if a buffer represents a ZIP archive (PK\x03\x04 signature)
 */
export function isZipBuffer(buf: Buffer): boolean {
  return buf && buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b;
}

/**
 * Checks if a buffer represents a GZIP archive
 */
export function isGzipBuffer(buf: Buffer): boolean {
  return buf && buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b;
}

/**
 * Resolves canonical format from extension
 */
function getFormatFromFilename(name: string): 'srt' | 'vtt' | 'ass' | 'ssa' {
  const ext = path.extname(name).toLowerCase();
  if (ext === '.vtt') return 'vtt';
  if (ext === '.ass') return 'ass';
  if (ext === '.ssa') return 'ssa';
  return 'srt';
}

/**
 * Scores an entry based on episode, season, and language match
 */
function scoreCandidateEntry(
  entryName: string,
  targetSeason?: number,
  targetEpisode?: number,
  targetLang?: string
): number {
  const baseName = path.basename(entryName).toLowerCase();
  const fullPathLower = entryName.toLowerCase();
  let score = 10;

  // 1. Language matching
  if (targetLang) {
    const cleanLang = targetLang.toLowerCase().trim();
    const aliases = LANGUAGE_ALIASES[cleanLang] || [cleanLang];

    let hasLangMatch = false;
    for (const alias of aliases) {
      // Look for separator-bounded alias (e.g. .pob., _pob_, [pob], -pob-)
      const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const langRegex = new RegExp(`(?:^|[._\\-\\s\\[(])${escaped}(?:[._\\-\\s\\])]|$)`, 'i');
      if (langRegex.test(baseName) || langRegex.test(fullPathLower)) {
        hasLangMatch = true;
        break;
      }
    }

    if (hasLangMatch) {
      score += 500;
    } else {
      // Check if it matches a clearly DIFFERENT language to penalize it
      for (const [otherLang, otherAliases] of Object.entries(LANGUAGE_ALIASES)) {
        if (otherLang === cleanLang) continue;
        for (const oAlias of otherAliases) {
          const escaped = oAlias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          const otherRegex = new RegExp(`(?:^|[._\\-\\s\\[(])${escaped}(?:[._\\-\\s\\])]|$)`, 'i');
          if (otherRegex.test(baseName)) {
            score -= 200;
            break;
          }
        }
      }
    }
  }

  // 2. Episode and Season matching (for series / anime)
  if (targetEpisode !== undefined) {
    const epNum = targetEpisode;
    const epPad = String(epNum).padStart(2, '0');
    const sNum = targetSeason !== undefined ? targetSeason : undefined;
    const sPad = sNum !== undefined ? String(sNum).padStart(2, '0') : undefined;

    // Check season conflict first if season is present in filename
    if (sNum !== undefined) {
      const seasonMatch = /(?:^|[^a-z0-9])s0*(\d+)(?:e0*\d+|x0*\d+|[^a-z0-9]|$)/i.exec(baseName)
        || /(?:^|[^a-z0-9])(?:season|temporada)\s*0*(\d+)/i.exec(fullPathLower);
      if (seasonMatch) {
        const foundSeason = Number(seasonMatch[1]);
        if (foundSeason !== sNum) {
          // Explicitly different season - heavy penalty
          return -1000;
        } else {
          score += 300;
        }
      }
    }

    // Pattern A: S01E04, S1E4, 1x04, 01x04
    if (sNum !== undefined && sPad !== undefined) {
      const sAndEPattern = new RegExp(
        `(?:^|[^a-z0-9])(?:s0*${sNum}\\s*e0*${epNum}|0*${sNum}\\s*x\\s*0*${epNum})(?:[^a-z0-9]|$)`,
        'i'
      );
      if (sAndEPattern.test(baseName)) {
        score += 1000;
        return score;
      }
    }

    // Pattern B: E04, e4, Episode 04, Episode 4, Ep 04, Ep. 04, Capitulo 04
    const epPrefixPattern = new RegExp(
      `(?:^|[^a-z0-9])(?:ep?|episode|episodio|capitulo|cap)\\.?\\s*0*${epNum}(?:[^a-z0-9]|$)`,
      'i'
    );
    if (epPrefixPattern.test(baseName)) {
      score += 700;
      return score;
    }

    // Pattern C: " - 04 ", " - 04.", "- 04 [", "[04]", "(04)"
    const bracketOrDashPattern = new RegExp(
      `(?:-\\s*0*${epNum}\\b|[\\[(]0*${epNum}[\\])]|[._\\s]0*${epNum}[._\\s])`,
      'i'
    );
    if (bracketOrDashPattern.test(baseName)) {
      score += 600;
      return score;
    }

    // Pattern D: Basename ends with episode number before extension (e.g. "Title 04.srt" or "04.srt")
    const tailPattern = new RegExp(`(?:^|[\\s_.-])0*${epNum}\\.(?:srt|vtt|ass|ssa)$`, 'i');
    if (tailPattern.test(baseName)) {
      score += 550;
      return score;
    }
  }

  return score;
}

/**
 * Universal archive extraction service:
 * Inspects incoming buffer in-memory, recursively decompresses GZIP/ZIP archives,
 * and uses smart regex matching to extract the exact episode for season packs and animes.
 */
export function extractSubtitleFromArchive(
  rawBuffer: Buffer,
  options?: ArchiveExtractionOptions
): ArchiveExtractionResult {
  if (!rawBuffer || rawBuffer.length === 0) {
    return {
      buffer: Buffer.alloc(0),
      filename: 'subtitle.srt',
      format: 'srt',
      isArchive: false
    };
  }

  let buf = rawBuffer;
  let isArchive = false;
  let extractedEntryName: string | undefined;

  const targetSeason = options?.season !== undefined && options.season !== '' ? Number(options.season) : undefined;
  const targetEpisode = options?.episode !== undefined && options.episode !== '' ? Number(options.episode) : undefined;
  const targetLang = options?.targetLang;

  // Maximum 3 recursion passes (e.g. .tar.gz or nested zip)
  for (let pass = 0; pass < 3; pass++) {
    // 1. Handle GZIP
    if (isGzipBuffer(buf)) {
      try {
        buf = zlib.gunzipSync(buf);
        isArchive = true;
        continue;
      } catch (err) {
        Logger.warn('[ArchiveExtractor] Failed to gunzip buffer, continuing with raw buffer', { error: String(err) });
        break;
      }
    }

    // 2. Handle ZIP
    if (isZipBuffer(buf)) {
      isArchive = true;
      try {
        const zip = new AdmZip(buf);
        const entries = zip.getEntries();

        // Filter valid subtitle entries and discard OS metadata / hidden files
        const validEntries = entries.filter(e => {
          if (e.isDirectory) return false;
          const name = e.entryName;
          if (name.includes('__MACOSX') || path.basename(name).startsWith('.')) return false;
          const ext = path.extname(name).toLowerCase();
          return VALID_SUBTITLE_EXTENSIONS.has(ext);
        });

        if (validEntries.length === 0) {
          const epLabel = targetEpisode !== undefined ? `S${targetSeason || 1}E${targetEpisode}` : 'unknown';
          Logger.warn(`[ArchiveExtractor] Nenhum arquivo correspondente encontrado para ${epLabel} (ZIP não contém legendas suportadas)`);
          break;
        }

        // Rank entries using scoring
        let bestEntry = validEntries[0];
        let bestScore = -Infinity;

        for (const entry of validEntries) {
          const score = scoreCandidateEntry(entry.entryName, targetSeason, targetEpisode, targetLang);
          if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
          }
        }

        if (bestEntry) {
          extractedEntryName = bestEntry.entryName;
          buf = bestEntry.getData();
          continue;
        }
      } catch (err: unknown) {
        const epLabel = targetEpisode !== undefined ? `S${targetSeason || 1}E${targetEpisode}` : 'unknown';
        const msg = err instanceof Error ? err.message : String(err);
        Logger.warn(`[ArchiveExtractor] Nenhum arquivo correspondente encontrado para ${epLabel}: ${msg}`);
        break;
      }
    }

    break;
  }

  const finalName = extractedEntryName ? path.basename(extractedEntryName) : 'subtitle.srt';
  const finalFormat = getFormatFromFilename(finalName);

  return {
    buffer: buf,
    filename: finalName,
    format: finalFormat,
    isArchive,
    extractedEntryName
  };
}
