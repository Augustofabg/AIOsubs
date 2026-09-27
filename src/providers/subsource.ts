import { BaseSubtitleProvider } from './base';
import { SubtitleQuery, ProviderContext, RawSubtitleItem } from '../types/provider';

interface SubsourceMovieItem {
  movieId: number;
  title: string;
  type: string;
  season?: number | null;
  imdbId?: string;
}

interface SubsourceSubtitleItem {
  subtitleId: number;
  movieId: number;
  language: string;
  releaseInfo?: string[];
  hearingImpaired?: boolean;
  link?: string;
  [key: string]: unknown;
}

interface SubsourceMovieSearchResponse {
  success: boolean;
  data?: SubsourceMovieItem[];
}

interface SubsourceSubtitlesResponse {
  subtitles?: SubsourceSubtitleItem[];
  data?: SubsourceSubtitleItem[];
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
    const timeout = context.timeoutMs || 10000;

    // 1. Search Subsource for the movie/show by IMDb ID
    const movieSearchUrl = 'https://api.subsource.net/api/v1/movies/search';
    const movieRes = await this.httpGet<SubsourceMovieSearchResponse>(
      movieSearchUrl,
      {
        params: { imdb: cleanImdb, searchType: 'imdb' },
        headers: { 'X-API-Key': apiKey },
        timeout
      },
      signal
    );

    const moviesList = movieRes.data?.data || [];
    if (!Array.isArray(moviesList) || moviesList.length === 0) {
      return [];
    }

    // Match season if series
    let targetMovie: SubsourceMovieItem | undefined;
    if (query.type === 'series' && query.season !== null) {
      targetMovie = moviesList.find(m => m.season === query.season);
    }
    if (!targetMovie) {
      targetMovie = moviesList.find(m => m.type === 'movie') || moviesList[0];
    }

    if (!targetMovie?.movieId) {
      return [];
    }

    // 2. Fetch subtitles for the found movieId
    const subsUrl = 'https://api.subsource.net/api/v1/subtitles';
    const subsRes = await this.httpGet<SubsourceSubtitlesResponse>(
      subsUrl,
      {
        params: { movieId: targetMovie.movieId },
        headers: { 'X-API-Key': apiKey },
        timeout
      },
      signal
    );

    const list = subsRes.data?.subtitles || subsRes.data?.data || [];
    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }

    const items: RawSubtitleItem[] = [];

    for (const sub of list) {
      const rawLang = sub.language || 'unknown';
      const releaseName = (Array.isArray(sub.releaseInfo) && sub.releaseInfo[0]) || `${targetMovie.title || cleanImdb}`;
      const isHI = Boolean(sub.hearingImpaired || /\[cc\]|\[hi\]|\(hi\)/i.test(releaseName));

      const downloadUrl = `https://api.subsource.net/api/v1/subtitles/${sub.subtitleId}/download`;
      const proxyUrl = `/sub/proxy?url=${encodeURIComponent(downloadUrl)}&apiKey=${encodeURIComponent(apiKey)}&filename=${encodeURIComponent(releaseName + '.srt')}&provider=subsource`;

      items.push({
        id: `subsource-${sub.subtitleId}`,
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
