import { StremioSubtitle, StremioSubtitlesResponse } from '../types/stremio';
import { SubtitleQuery, RawSubtitleItem } from '../types/provider';
import { UserConfig } from '../types/config';
import { executeParallelSearch } from '../providers';
import { validateAndNormalizeLanguage, isLanguageWhitelisted } from '../utils/normalizer';
import { deduplicateSubtitles, prioritizeSubtitles } from '../utils/deduplicator';
import { globalSubtitleCache } from '../utils/cache';
import { Logger } from '../utils/logger';

export function parseSubtitleQuery(
  type: string,
  id: string,
  extra?: Record<string, string | undefined>
): SubtitleQuery {
  let imdbId: string | null = null;
  let season: number | null = null;
  let episode: number | null = null;
  let kitsuId: string | null = null;

  if (id.includes(':')) {
    const parts = id.split(':');
    if (parts[0].startsWith('tt')) {
      imdbId = parts[0];
      season = parseInt(parts[1], 10);
      episode = parseInt(parts[2], 10);
    } else if (parts[0] === 'kitsu') {
      kitsuId = `${parts[0]}:${parts[1]}`;
      episode = parseInt(parts[2], 10);
    } else {
      imdbId = parts[0].startsWith('tt') ? parts[0] : (parts[0].match(/^\d+$/) ? `tt${parts[0]}` : parts[0]);
      if (parts.length >= 3) {
        season = parseInt(parts[1], 10);
        episode = parseInt(parts[2], 10);
      }
    }
  } else {
    imdbId = id.startsWith('tt') ? id : (id.match(/^\d+$/) ? `tt${id}` : id);
  }

  return {
    type,
    id,
    imdbId,
    season: isNaN(Number(season)) ? null : season,
    episode: isNaN(Number(episode)) ? null : episode,
    kitsuId,
    extra
  };
}

export async function getAggregatedSubtitles(
  query: SubtitleQuery,
  config: UserConfig,
  baseUrl: string
): Promise<StremioSubtitlesResponse> {
  const enabledProviderIds = Object.keys(config.providers).filter(
    id => config.providers[id]?.enabled !== false
  );

  const cacheKey = globalSubtitleCache.generateKey(
    query.id,
    config.languages,
    enabledProviderIds,
    query.season,
    query.episode
  );

  let rawSubtitles = globalSubtitleCache.get(cacheKey);

  if (!rawSubtitles) {
    rawSubtitles = await executeParallelSearch(query, config);
    globalSubtitleCache.set(cacheKey, rawSubtitles, config.cacheTtlMinutes);
  } else {
    Logger.info(`Serving subtitles from cache for ${query.id} (${rawSubtitles.length} items)`);
  }

  // Canonicalize language codes to ISO 639-2 and drop unsupported codes to avoid player issues
  const normalizedItems: RawSubtitleItem[] = [];

  for (const sub of rawSubtitles) {
    const validation = validateAndNormalizeLanguage(
      sub.lang,
      config.allowUnknownLanguages,
      config.languageRemap
    );

    if (!validation.valid || !validation.normalizedLang) {
      Logger.warn(`Discarded subtitle due to invalid ISO 639-2 language: "${sub.lang}" from provider [${sub.provider}]`, {
        provider: sub.providerName || sub.provider,
        release: sub.release,
        reason: validation.discardedReason
      });
      continue;
    }

    sub.lang = validation.normalizedLang;
    normalizedItems.push(sub);
  }

  Logger.info(`Language validation (ISO 639-2): ${rawSubtitles.length} -> ${normalizedItems.length} subtitles`, {
    allowUnknown: config.allowUnknownLanguages
  });

  const effectiveWhitelist = (config.languages && config.languages.length > 0)
    ? config.languages
    : ['pob', 'eng'];

  const whitelistedItems = normalizedItems.filter(item =>
    isLanguageWhitelisted(item.lang, effectiveWhitelist)
  );

  Logger.info(`Language whitelist filter: ${normalizedItems.length} -> ${whitelistedItems.length} subtitles`, {
    whitelist: effectiveWhitelist
  });

  let orderedItems = prioritizeSubtitles(whitelistedItems, config.providerPriority);

  if (config.deduplication) {
    const beforeCount = orderedItems.length;
    orderedItems = deduplicateSubtitles(orderedItems, 0.85, config.deduplicationStrategy || 'both');
    Logger.info(`Deduplication: ${beforeCount} -> ${orderedItems.length} subtitles`);
  }

  // Build clean response with original IDs, normalized language codes, absolute URLs, and formatted display title
  const subtitles: StremioSubtitle[] = orderedItems.map(item => {
    let finalUrl = item.url;
    if (finalUrl.startsWith('/')) {
      finalUrl = `${baseUrl}${finalUrl}`;
    }

    const displayTitle = item.release || `${item.providerName || item.provider} Subtitle`;

    return {
      id: item.id,
      lang: item.lang,
      url: finalUrl,
      title: displayTitle
    };
  });

  return {
    subtitles
  };
}
