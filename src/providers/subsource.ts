import { BaseSubtitleProvider } from './base';
import { SubtitleQuery, ProviderContext, RawSubtitleItem } from '../types/provider';

interface SubsourceSearchItem {
  id?: string;
  subId?: string;
  name?: string;
  release?: string;
  lang?: string;
  language?: string;
  link?: string;
  downloadToken?: string;
  hi?: boolean;
  hearingImpaired?: boolean;
  season?: number;
  episode?: number;
}

interface SubsourceResponse {
  success?: boolean;
  subtitles?: SubsourceSearchItem[];
  data?: SubsourceSearchItem[];
}

export class SubsourceProvider extends BaseSubtitleProvider {
  readonly id = 'subsource';
  readonly name = 'Subsource';
  readonly description = 'Community-driven high accuracy subtitles from Subsource';
  readonly requiresApiKey = true;
  readonly defaultEnabled = true;

  protected async executeSearch(
    query: SubtitleQuery,
    context: ProviderContext,
    signal: AbortSignal
  ): Promise<RawSubtitleItem[]> {
    const apiKey = context.providerConfig?.apiKey;
    if (!apiKey) {
      return [];
    }

    if (!query.imdbId) {
      return [];
    }

    const cleanImdb = query.imdbId.startsWith('tt') ? query.imdbId : `tt${query.imdbId}`;
    
    // Subsource movie/series search endpoint
    const url = `https://api.subsource.net/api/v1/subtitles/search?imdb=${encodeURIComponent(cleanImdb)}`;

    const response = await this.httpGet<SubsourceResponse>(
      url,
      {
        timeout: 10000,
        headers: {
          'Referer': 'https://subsource.net/'
        }
      },
      signal
    );

    const list = response.data?.subtitles || response.data?.data || [];
    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }

    const items: RawSubtitleItem[] = [];

    for (const sub of list) {
      // If series, match season and episode if present
      if (query.season !== null && sub.season !== undefined && sub.season !== query.season) {
        continue;
      }
      if (query.episode !== null && sub.episode !== undefined && sub.episode !== query.episode) {
        continue;
      }

      const rawLang = sub.lang || sub.language || 'unknown';
      const releaseName = sub.release || sub.name || `${cleanImdb}`;
      const isHI = Boolean(sub.hi || sub.hearingImpaired || /\[cc\]|\[hi\]|\(hi\)/i.test(releaseName));

      // Construct download URL
      let downloadUrl = sub.link || '';
      if (!downloadUrl && (sub.id || sub.subId)) {
        const id = sub.id || sub.subId;
        downloadUrl = `https://api.subsource.net/api/v1/subtitles/download/${id}`;
      }

      if (!downloadUrl) continue;

      const proxyUrl = `/sub/proxy?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(releaseName + '.srt')}&provider=subsource`;

      items.push({
        id: `subsource-${sub.id || sub.subId || Math.random().toString(36).substring(2, 9)}`,
        provider: this.id,
        providerName: 'Subsource',
        url: proxyUrl,
        lang: rawLang,
        release: releaseName,
        format: 'srt',
        hearingImpaired: isHI,
        rawMetadata: sub as Record<string, unknown>
      });
    }

    return items;
  }
}
