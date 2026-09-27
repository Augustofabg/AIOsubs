import { Request, Response } from 'express';
import axios from 'axios';
import AdmZip from 'adm-zip';
import iconv from 'iconv-lite';
import zlib from 'zlib';
import path from 'path';
import { LRUCache } from 'lru-cache';
import { Logger } from '../utils/logger';
import { extractSubtitleFromArchive, ArchiveExtractionOptions } from '../services/archive';
import { convertAssToVtt, clientSupportsNativeAss, isAssOrSsa } from '../services/converter';

export interface ProxyDownloadEntry {
  originalUrl: string;
  filename: string;
  provider: string;
  format: string;
  apiKey?: string;
  fileId?: string | number;
  type?: string;
  season?: number | string;
  episode?: number | string;
  lang?: string;
}

const proxyDownloadStore = new LRUCache<string, ProxyDownloadEntry>({
  max: 10000,
  ttl: 4 * 60 * 60 * 1000
});

export function registerProxyDownload(entry: ProxyDownloadEntry): string {
  const cleanProvider = (entry.provider || 'sub').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const shortId = `${cleanProvider}_${randomSuffix}`;
  
  proxyDownloadStore.set(shortId, entry);
  return shortId;
}

/**
 * Recursively inspects and decompresses GZIP or ZIP archives.
 * Delegates to universal extractSubtitleFromArchive for smart episode matching.
 */
export function decompressBuffer(
  input: Buffer,
  options?: ArchiveExtractionOptions
): { buffer: Buffer; formatHint?: 'srt' | 'vtt' | 'ass' | 'ssa'; filename?: string } {
  const result = extractSubtitleFromArchive(input, options);
  return {
    buffer: result.buffer,
    formatHint: result.format,
    filename: result.filename
  };
}

/**
 * Accurately decodes buffers of unknown charset (UTF-8, Windows-1252, ISO-8859-1, UTF-16 LE/BE)
 * into a clean UTF-8 string and strips BOMs.
 */
export function toCleanUtf8(buffer: Buffer): string {
  if (!buffer || buffer.length === 0) return '';

  let text = '';

  // 1. Detect UTF-16 LE BOM or pattern (common in Windows subtitles)
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    text = iconv.decode(buffer, 'utf16le');
  } else if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    text = iconv.decode(buffer, 'utf16be');
  } else if (buffer.length >= 8 && buffer[1] === 0x00 && buffer[3] === 0x00 && buffer[5] === 0x00) {
    // UTF-16 LE without BOM
    text = iconv.decode(buffer, 'utf16le');
  } else if (buffer.length >= 8 && buffer[0] === 0x00 && buffer[2] === 0x00 && buffer[4] === 0x00) {
    // UTF-16 BE without BOM
    text = iconv.decode(buffer, 'utf16be');
  } else {
    // Standard UTF-8 attempt
    try {
      const utf8 = buffer.toString('utf8');
      if (utf8.includes('\uFFFD')) {
        // Fallback to Windows-1252 / ISO-8859-1 for Latin diacritics
        text = iconv.decode(buffer, 'win1252');
      } else {
        text = utf8;
      }
    } catch {
      text = iconv.decode(buffer, 'win1252');
    }
  }

  // 2. Strip UTF-8 BOM if present at index 0
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  // 3. Normalize CRLF / CR to standard LF
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

/**
 * Validates subtitle timing structure and guarantees correct format rules:
 * - .vtt must strictly start with "WEBVTT" and use '.' timestamp decimals
 * - .srt must begin with numeric index 1 and use ',' timestamp decimals
 */
export function validateAndFormatSubtitle(
  rawText: string,
  preferredFormat: 'srt' | 'vtt' = 'srt'
): { content: string; format: 'srt' | 'vtt'; valid: boolean; reason?: string } {
  let text = rawText.trim();

  if (!text) {
    return { content: '', format: preferredFormat, valid: false, reason: 'Arquivo de legenda vazio (0 bytes).' };
  }

  // Detect API error responses returned as body
  if (text.startsWith('{') && (text.includes('"message"') || text.includes('"error"') || text.includes('"status"'))) {
    return { content: text, format: preferredFormat, valid: false, reason: 'Resposta de erro JSON da API remota.' };
  }
  if (text.startsWith('<!DOCTYPE') || text.toLowerCase().startsWith('<html')) {
    return { content: text, format: preferredFormat, valid: false, reason: 'Página de erro HTML retornada pelo servidor remoto.' };
  }

  // Check for presence of cue timing blocks (e.g. 00:00:01,000 --> 00:00:04,000 or 00:00:01.000 --> 00:00:04.000)
  const timingRegex = /(\d{1,2}:\d{2}:\d{2}[,.]\d{2,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{2,3})/;
  const match = timingRegex.exec(text);
  if (!match) {
    return { content: text, format: preferredFormat, valid: false, reason: 'Nenhum bloco de tempo válido (-->) encontrado no texto da legenda.' };
  }

  if (preferredFormat === 'vtt') {
    // If not starting with WEBVTT, convert SRT timestamps and add header
    if (!text.startsWith('WEBVTT')) {
      // Strip any leading non-subtitle headers before first cue if any
      const firstCueIndex = text.indexOf(match[0]);
      if (firstCueIndex > 0) {
        const preCue = text.substring(0, firstCueIndex).trim();
        const preLines = preCue.split('\n');
        const lastPreLine = preLines[preLines.length - 1].trim();
        if (/^\d+$/.test(lastPreLine)) {
          text = `${lastPreLine}\n${text.substring(firstCueIndex)}`;
        } else {
          text = text.substring(firstCueIndex);
        }
      }
      // Replace commas with dots in timestamps
      text = text.replace(/(\d{1,2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2').replace(/(\d{2}:\d{2}),(\d{3})/g, '$1.$2');
      text = `WEBVTT\n\n${text}`;
    }
    return { content: text, format: 'vtt', valid: true };
  }

  // Preferred format is 'srt'
  if (text.startsWith('WEBVTT')) {
    // Strip WEBVTT header and NOTE blocks
    text = text.replace(/^WEBVTT[^\n]*\n+/i, '').replace(/^NOTE[^\n]*\n+/gm, '').trim();
  }

  // Convert dots to commas in timestamps for SRT
  text = text.replace(/(\d{1,2}:\d{2}:\d{2})\.(\d{3})/g, '$1,$2').replace(/(\d{2}:\d{2})\.(\d{3})/g, '$1,$2');

  // Ensure first line starts strictly with numeric cue index 1
  const firstCueIndex = text.search(/(\d{1,2}:\d{2}:\d{2},\d{2,3})\s*-->/);
  if (firstCueIndex !== -1) {
    text = `1\n${text.substring(firstCueIndex)}`;
  } else {
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.includes('-->')) {
      text = `1\n${text}`;
    }
  }

  return { content: text, format: 'srt', valid: true };
}

/**
 * Sends subtitle text to player with mandatory CORS and Content-Type headers.
 */
export function sendSubtitleResponse(
  res: Response,
  text: string,
  format: 'srt' | 'vtt' | 'ass' | 'ssa',
  filename: string
): void {
  let contentType = 'text/plain; charset=utf-8';
  if (format === 'vtt') {
    contentType = 'text/vtt; charset=utf-8';
  } else if (format === 'ass' || format === 'ssa') {
    contentType = 'text/x-ssa; charset=utf-8';
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(text);
}

/**
 * Unified proxy endpoint: downloads remote subtitles (including .zip and .gz archives from SubDL / Subsource),
 * decompresses season packs in-memory, selects exact episode, converts .ass/.ssa to .vtt conditionally,
 * decodes charset to strict UTF-8, and serves valid text with CORS.
 */
export async function handleUnifiedSubtitleProxy(req: Request, res: Response): Promise<void> {
  let targetUrl = (req.query.url as string) || '';

  if (!targetUrl && req.params.data) {
    try {
      const normalized = req.params.data.replace(/-/g, '+').replace(/_/g, '/');
      targetUrl = Buffer.from(normalized, 'base64').toString('utf8');
    } catch {
      targetUrl = '';
    }
  }

  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    res.status(400);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('URL de download da legenda ausente ou inválida.');
    return;
  }

  let rawFilename = (req.query.filename as string) || '';
  if (!rawFilename) {
    try {
      rawFilename = path.basename(new URL(targetUrl).pathname);
    } catch {
      rawFilename = 'subtitle.srt';
    }
  }
  if (!rawFilename || rawFilename === '/' || rawFilename === '.') {
    rawFilename = 'subtitle.srt';
  }

  const queryType = (req.query.type as string) || '';
  let querySeason = req.query.season !== undefined && req.query.season !== '' ? Number(req.query.season) : undefined;
  let queryEpisode = req.query.episode !== undefined && req.query.episode !== '' ? Number(req.query.episode) : undefined;
  const queryLang = (req.query.lang as string) || (req.query.targetLang as string);
  const clientParam = (req.query.client as string) || (req.query.format as string);

  // If season or episode not in query, infer from rawFilename or targetUrl
  if (queryEpisode === undefined) {
    const sAndEMatch = /(?:^|[^a-z0-9])s0*(\d+)\s*e0*(\d+)(?:[^a-z0-9]|$)/i.exec(rawFilename)
      || /(?:^|[^a-z0-9])0*(\d+)\s*x\s*0*(\d+)(?:[^a-z0-9]|$)/i.exec(rawFilename);
    if (sAndEMatch) {
      if (querySeason === undefined) querySeason = Number(sAndEMatch[1]);
      queryEpisode = Number(sAndEMatch[2]);
    } else {
      const epOnlyMatch = /(?:^|[^a-z0-9])(?:ep?|episode|capitulo|cap)\.?\s*0*(\d+)(?:[^a-z0-9]|$)/i.exec(rawFilename)
        || /(?:-\s*0*(\d+)\b|[[(]0*(\d+)[\])])/i.exec(rawFilename);
      if (epOnlyMatch) {
        queryEpisode = Number(epOnlyMatch[1] || epOnlyMatch[2]);
      }
    }
  }

  const preferredFormat: 'srt' | 'vtt' = rawFilename.toLowerCase().endsWith('.vtt') || targetUrl.toLowerCase().endsWith('.vtt')
    ? 'vtt'
    : 'srt';

  try {
    const requestHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIOSubs v1.0.0',
      'Accept': '*/*'
    };
    const apiKey = (req.query.apiKey as string) || (req.query.key as string);
    if (apiKey) {
      requestHeaders['X-API-Key'] = apiKey;
      requestHeaders['Api-Key'] = apiKey;
    }

    const upstreamRes = await axios.get<ArrayBuffer>(targetUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: requestHeaders
    });

    const rawBuffer = Buffer.from(upstreamRes.data);
    const extraction = extractSubtitleFromArchive(rawBuffer, {
      type: queryType,
      season: querySeason,
      episode: queryEpisode,
      targetLang: queryLang,
      preferredFormat
    });

    const cleanBuffer = extraction.buffer;
    const finalFilename = extraction.filename || rawFilename;
    const detectedFormat = extraction.format;
    const effectiveFormat = detectedFormat || preferredFormat;

    const utf8Text = toCleanUtf8(cleanBuffer);

    // Smart conditional ASS/SSA to WebVTT conversion
    const isAss = detectedFormat === 'ass' || detectedFormat === 'ssa' || isAssOrSsa(utf8Text, finalFilename);

    if (isAss) {
      const vttParam = (req.query.vtt as string) || (req.query.convertVtt as string) || (req.query.vttConversion as string);
      const isVttConversionDisabled = vttParam === '0' || vttParam === 'false' || vttParam === 'off' || vttParam === 'no';

      if (isVttConversionDisabled) {
        // VTT conversion disabled by user configuration: deliver raw ASS/SSA directly
        sendSubtitleResponse(res, utf8Text, 'ass', finalFilename);
        return;
      }

      const nativeAssSupported = clientSupportsNativeAss(req.headers['user-agent'], clientParam);

      if (nativeAssSupported && req.query.format !== 'vtt') {
        // Device/player natively supports ASS styling (e.g. Stremio Desktop with MPV)
        sendSubtitleResponse(res, utf8Text, 'ass', finalFilename);
        return;
      }

      // Convert ASS/SSA to clean WebVTT for browsers, smart TVs, and web players
      const vttContent = convertAssToVtt(utf8Text);
      const vttFilename = finalFilename.replace(/\.(ass|ssa)$/i, '.vtt');
      sendSubtitleResponse(res, vttContent, 'vtt', vttFilename);
      return;
    }

    const validation = validateAndFormatSubtitle(utf8Text, effectiveFormat === 'vtt' ? 'vtt' : 'srt');

    if (!validation.valid) {
      Logger.warn(`Invalid subtitle delivered from ${targetUrl}: ${validation.reason}`);
      // Safe fallback: do not return 500/502 to avoid crashing player
      const emptySubtitle = preferredFormat === 'vtt' ? 'WEBVTT\n\n' : '1\n00:00:00,000 --> 00:00:01,000\n \n';
      res.status(200);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Content-Type', preferredFormat === 'vtt' ? 'text/vtt; charset=utf-8' : 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(finalFilename)}"`);
      res.setHeader('X-Subtitle-Fallback', 'true');
      res.setHeader('X-Subtitle-Fallback-Reason', encodeURIComponent(validation.reason || 'invalid_subtitle'));
      res.send(emptySubtitle);
      return;
    }

    sendSubtitleResponse(res, validation.content, validation.format, finalFilename);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    Logger.error(`Subtitle proxy fetch failed for ${targetUrl}: ${errorMsg}`, err);
    // Safe fallback to prevent breaking video playback
    const emptySubtitle = preferredFormat === 'vtt' ? 'WEBVTT\n\n' : '1\n00:00:00,000 --> 00:00:01,000\n \n';
    res.status(200);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Content-Type', preferredFormat === 'vtt' ? 'text/vtt; charset=utf-8' : 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(rawFilename)}"`);
    res.setHeader('X-Subtitle-Fallback', 'true');
    res.setHeader('X-Subtitle-Fallback-Reason', encodeURIComponent(errorMsg));
    res.send(emptySubtitle);
  }
}

/**
 * Handles OpenSubtitles REST download endpoint:
 * Calls POST /api/v1/download to get the temporary download link,
 * with automatic fallback to OpenSubtitles direct download mirrors if API key lacks token or is rate-limited.
 */
export async function handleOpenSubtitlesRestDownload(req: Request, res: Response): Promise<void> {
  const { fileId } = req.params;
  const apiKey = req.query.apiKey as string;
  const legacyId = (req.query.legacyId as string) || '';
  const filename = (req.query.filename as string) || `subtitle-${fileId}.srt`;
  const preferredFormat: 'srt' | 'vtt' = filename.toLowerCase().endsWith('.vtt') ? 'vtt' : 'srt';

  if (!fileId) {
    res.status(400);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('Identificador de arquivo (fileId) ausente.');
    return;
  }

  let rawBuffer: Buffer | null = null;
  let lastError: unknown;

  // 1. Try official POST /api/v1/download if apiKey is present
  if (apiKey) {
    const userAgents = ['AIOSubtitles v1.0.0', 'AIOSubs v1.0.0'];
    for (const ua of userAgents) {
      try {
        const downloadRes = await axios.post<{ link: string }>(
          'https://api.opensubtitles.com/api/v1/download',
          { file_id: parseInt(fileId, 10) },
          {
            headers: {
              'Api-Key': apiKey,
              'User-Agent': ua,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 7000
          }
        );
        if (downloadRes.data?.link) {
          const subRes = await axios.get<ArrayBuffer>(downloadRes.data.link, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIOSubs v1.0.0',
              'Accept': '*/*'
            }
          });
          if (subRes.data && subRes.data.byteLength > 0) {
            rawBuffer = Buffer.from(subRes.data);
            break;
          }
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  // 2. High-reliability fallback: dl.opensubtitles.org / subs5.strem.io mirrors
  if (!rawBuffer) {
    const candidateUrls: string[] = [];
    if (legacyId && /^\d+$/.test(legacyId)) {
      candidateUrls.push(`https://dl.opensubtitles.org/en/download/sub/${legacyId}`);
    }
    if (/^\d+$/.test(fileId)) {
      candidateUrls.push(`https://dl.opensubtitles.org/en/download/sub/${fileId}`);
      candidateUrls.push(`https://subs5.strem.io/en/download/subencoding-stremio-utf8/src-api/file/${fileId}`);
    }

    for (const mirrorUrl of candidateUrls) {
      try {
        const mirrorRes = await axios.get<ArrayBuffer>(mirrorUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIOSubs v1.0.0',
            'Accept': '*/*'
          }
        });
        if (mirrorRes.data && mirrorRes.data.byteLength > 50) {
          const tempBuf = Buffer.from(mirrorRes.data);
          const preview = tempBuf.slice(0, 100).toString('utf8').toLowerCase();
          if (!preview.includes('<!doctype') && !preview.includes('<html')) {
            rawBuffer = tempBuf;
            break;
          }
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  if (!rawBuffer) {
    const errorMsg = lastError instanceof Error ? lastError.message : String(lastError || 'Falha ao baixar legenda do OpenSubtitles');
    Logger.error(`OpenSubtitles download failed for file ${fileId} (legacyId: ${legacyId}): ${errorMsg}`, lastError);
    res.status(502);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`Erro ao baixar legenda do OpenSubtitles: ${errorMsg}`);
    return;
  }

  try {
    const { buffer: cleanBuffer, formatHint, filename: extractedFilename } = decompressBuffer(rawBuffer);
    const effectiveFormat = formatHint || preferredFormat;
    const finalFilename = extractedFilename || filename;

    const utf8Text = toCleanUtf8(cleanBuffer);
    const isAss = effectiveFormat === 'ass' || effectiveFormat === 'ssa' || isAssOrSsa(utf8Text, finalFilename);
    if (isAss) {
      const vttParam = (req.query.vtt as string) || (req.query.convertVtt as string) || (req.query.vttConversion as string);
      const isVttConversionDisabled = vttParam === '0' || vttParam === 'false' || vttParam === 'off' || vttParam === 'no';

      if (isVttConversionDisabled) {
        // VTT conversion disabled by user configuration: deliver raw ASS/SSA directly
        sendSubtitleResponse(res, utf8Text, 'ass', finalFilename);
        return;
      }

      const nativeAssSupported = clientSupportsNativeAss(req.headers['user-agent'], req.query.client as string);
      if (nativeAssSupported && req.query.format !== 'vtt') {
        sendSubtitleResponse(res, utf8Text, 'ass', finalFilename);
        return;
      }
      const vttContent = convertAssToVtt(utf8Text);
      const vttFilename = finalFilename.replace(/\.(ass|ssa)$/i, '.vtt');
      sendSubtitleResponse(res, vttContent, 'vtt', vttFilename);
      return;
    }

    const validation = validateAndFormatSubtitle(utf8Text, effectiveFormat === 'vtt' ? 'vtt' : 'srt');

    if (!validation.valid) {
      Logger.warn(`Invalid subtitle delivered from OpenSubtitles for file ${fileId}: ${validation.reason}`);
      const emptySubtitle = preferredFormat === 'vtt' ? 'WEBVTT\n\n' : '1\n00:00:00,000 --> 00:00:01,000\n \n';
      res.status(200);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Content-Type', preferredFormat === 'vtt' ? 'text/vtt; charset=utf-8' : 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(finalFilename)}"`);
      res.setHeader('X-Subtitle-Fallback', 'true');
      res.setHeader('X-Subtitle-Fallback-Reason', encodeURIComponent(validation.reason || 'invalid_subtitle'));
      res.send(emptySubtitle);
      return;
    }

    sendSubtitleResponse(res, validation.content, validation.format, finalFilename);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    Logger.error(`OpenSubtitles buffer parsing failed for file ${fileId}: ${errorMsg}`, err);
    const emptySubtitle = preferredFormat === 'vtt' ? 'WEBVTT\n\n' : '1\n00:00:00,000 --> 00:00:01,000\n \n';
    res.status(200);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Content-Type', preferredFormat === 'vtt' ? 'text/vtt; charset=utf-8' : 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('X-Subtitle-Fallback', 'true');
    res.setHeader('X-Subtitle-Fallback-Reason', encodeURIComponent(errorMsg));
    res.send(emptySubtitle);
  }
}

/**
 * Handles shortId download with fallback support to query.url.
 */
export async function handleShortIdDownload(req: Request, res: Response): Promise<void> {
  let shortId = req.params.id;
  let entry = proxyDownloadStore.get(shortId);

  if (!entry && shortId.includes('.')) {
    const cleanId = shortId.replace(/\.(srt|vtt|sub)$/i, '');
    entry = proxyDownloadStore.get(cleanId);
    if (entry) {
      shortId = cleanId;
    }
  }

  // Fallback to query parameters if cache expired
  if (!entry && req.query.url) {
    return handleUnifiedSubtitleProxy(req, res);
  }

  if (!entry) {
    res.status(404);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('Subtitle download link expired or not found. Please refresh subtitles in your player.');
    return;
  }

  if (entry.fileId && entry.apiKey) {
    req.params.fileId = String(entry.fileId);
    req.query.apiKey = String(entry.apiKey);
    req.query.filename = entry.filename;
    return handleOpenSubtitlesRestDownload(req, res);
  }

  req.query.url = entry.originalUrl;
  req.query.filename = entry.filename;
  req.query.provider = entry.provider;
  if (entry.type) req.query.type = entry.type;
  if (entry.season !== undefined) req.query.season = String(entry.season);
  if (entry.episode !== undefined) req.query.episode = String(entry.episode);
  if (entry.lang) req.query.lang = entry.lang;
  return handleUnifiedSubtitleProxy(req, res);
}

/**
 * Backward compatibility handler for legacy base64 subtitle proxy URLs.
 */
export async function handleSubtitleProxy(req: Request, res: Response): Promise<void> {
  return handleUnifiedSubtitleProxy(req, res);
}

