import { BaseSubtitleProvider } from './base';
import { SubtitleQuery, ProviderContext, RawSubtitleItem } from '../types/provider';
import { ENV } from '../config/env';
import { mapWhitelistToOpenSubtitles } from '../utils/languages';

interface OpenSubtitlesRestItem {
  id: string;
  type: string;
  attributes: {
    subtitle_id: string;
    language: string;
    download_count: number;
    hearing_impaired: boolean;
    fps: number;
    ratings: number;
    release: string;
    comments?: string;
    url?: string;
    legacy_subtitle_id?: number;
    files: Array<{
      file_id: number;
      cd_number: number;
      file_name: string;
    }>;
  };
}

interface OpenSubtitlesRestResponse {
  total_pages: number;
  total_count: number;
  data: OpenSubtitlesRestItem[];
}

export class OpenSubtitlesProvider extends BaseSubtitleProvider {
  readonly id = 'opensubtitles';
  readonly name = 'OpenSubtitles';
  readonly description = 'Provedor oficial OpenSubtitles.com v1 com metadados completos e alta precisão';
  readonly requiresApiKey = true;
  readonly defaultEnabled = true;

  protected async executeSearch(
    query: SubtitleQuery,
    context: ProviderContext,
    signal: AbortSignal
  ): Promise<RawSubtitleItem[]> {
    const apiKey = context.providerConfig?.apiKey || ENV.DEFAULT_OPENSUBTITLES_API_KEY;
    if (!apiKey) {
      return [];
    }

    if (!query.imdbId) {
      return [];
    }

    const cleanImdb = query.imdbId.replace(/^tt/i, '');
    const params: Record<string, string | number> = {
      imdb_id: cleanImdb
    };

    if (query.type === 'series' && query.season !== null && query.episode !== null) {
      params.season_number = query.season;
      params.episode_number = query.episode;
      params.type = 'episode';
    } else if (query.season !== null && query.episode !== null) {
      params.season_number = query.season;
      params.episode_number = query.episode;
      params.type = 'episode';
    } else {
      params.type = 'movie';
    }

    // Native language filter: convert whitelist into OpenSubtitles API v1 format
    const effectiveLangs = (context.config.languages && context.config.languages.length > 0)
      ? context.config.languages
      : ['pob', 'eng'];
    const activeRemap = context.config.language_remapping || context.config.languageRemap;
    const osLangs = mapWhitelistToOpenSubtitles(effectiveLangs, activeRemap);
    if (osLangs.length > 0) {
      params.languages = osLangs.join(',');
    }

    const response = await this.httpGet<OpenSubtitlesRestResponse>(
      'https://api.opensubtitles.com/api/v1/subtitles',
      {
        params,
        headers: {
          'Api-Key': apiKey,
          'User-Agent': 'AIOSubs v1.0.0',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      },
      signal
    );

    if (!response.data || !Array.isArray(response.data.data)) {
      return [];
    }

    const items: RawSubtitleItem[] = [];

    for (const item of response.data.data) {
      const attr = item.attributes;
      if (!attr || !attr.files || attr.files.length === 0) continue;

      const file = attr.files[0];
      const fileId = file.file_id;
      const legacyId = attr.legacy_subtitle_id || '';
      const fileName = file.file_name || attr.release || `${query.id}.srt`;

      const downloadProxyUrl = `/proxy/download/os-rest/${fileId}?filename=${encodeURIComponent(fileName)}&apiKey=${encodeURIComponent(apiKey)}${legacyId ? `&legacyId=${encodeURIComponent(String(legacyId))}` : ''}`;

      items.push({
        id: `os-${item.id || fileId}`,
        provider: this.id,
        providerName: 'OpenSubtitles',
        url: downloadProxyUrl,
        lang: attr.language || 'unknown',
        release: attr.release || fileName.replace(/\.(srt|vtt)$/i, ''),
        format: fileName.toLowerCase().endsWith('.vtt') ? 'vtt' : 'srt',
        hearingImpaired: Boolean(attr.hearing_impaired),
        fps: attr.fps,
        rating: attr.ratings,
        downloads: attr.download_count,
        rawMetadata: { fileId, attributes: attr }
      });
    }

    return items;
  }
}
