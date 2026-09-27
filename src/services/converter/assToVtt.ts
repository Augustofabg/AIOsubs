/**
 * Service for conditional conversion and detection of Advanced SubStation Alpha (.ass/.ssa)
 * subtitles to WebVTT (.vtt) for clients without native MPV styling support.
 */

/**
 * Checks if client user agent or explicit client param supports native ASS styling.
 * Clientes desktop com MPV integrado (ex.: Stremio Desktop, mpv, vlc) oferecem suporte nativo.
 * Navegadores web, Smart TVs, Nuvio Web e WebViews necessitam de conversão para WebVTT.
 */
export function clientSupportsNativeAss(userAgent?: string, clientParam?: string): boolean {
  if (clientParam) {
    const cp = clientParam.toLowerCase().trim();
    if (cp === 'mpv' || cp === 'stremio-desktop' || cp === 'desktop' || cp === 'native' || cp === 'ass') {
      return true;
    }
    if (cp === 'web' || cp === 'browser' || cp === 'nuvio' || cp === 'vtt' || cp === 'tv') {
      return false;
    }
  }

  if (!userAgent || typeof userAgent !== 'string') {
    return false;
  }

  const ua = userAgent.trim();

  // Explicit browser, web player, smart TV, or mobile webview indicators
  const isWebOrTv = /Mozilla|WebKit|Chrome|Safari|Firefox|Edge|Opera|Nuvio|Tizen|Web0S|SmartTV|Android.*AppleWebKit|SMART-TV/i.test(ua);
  const isStremioWeb = /StremioWeb|web\.stremio/i.test(ua);

  if (isStremioWeb || isWebOrTv) {
    return false;
  }

  // Native desktop media engines (Stremio Desktop standalone, MPV, VLC, IINA, ExoPlayer)
  const isNativeDesktop = /^(?:Stremio\/[0-9.]+\s*\([^)]*\)|mpv|libmpv|vlc|iina|exoplayer)/i.test(ua);
  return isNativeDesktop;
}

/**
 * Checks if a string or filename represents an ASS or SSA subtitle
 */
export function isAssOrSsa(content: string, filename?: string): boolean {
  if (filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.ass') || lower.endsWith('.ssa')) {
      return true;
    }
  }
  return content.includes('[Script Info]') && (content.includes('[Events]') || content.includes('[V4+ Styles]') || content.includes('[V4 Styles]'));
}

/**
 * Converts an ASS timestamp (H:MM:SS.cc or H:MM:SS.ccc) to WebVTT timestamp (HH:MM:SS.mmm)
 */
export function assTimestampToVtt(assTime: string): string {
  const parts = assTime.trim().split(':');
  if (parts.length < 3) return '00:00:00.000';

  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  const secParts = parts[2].split('.');
  const seconds = secParts[0].padStart(2, '0');
  const centisOrMillis = secParts[1] || '0';

  // ASS centiseconds (2 digits) to VTT milliseconds (3 digits)
  const millis = centisOrMillis.padEnd(3, '0').slice(0, 3);
  return `${hours}:${minutes}:${seconds}.${millis}`;
}

/**
 * Cleans ASS styling tags, override codes, and drawing commands from dialog text
 */
export function cleanAssText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // Ignore drawing mode completely: {\p1} ... {\p0}
  if (/\{\\p[1-9]\}/.test(text)) {
    // If the entire text is a drawing command, discard it
    if (/^\{\\p[1-9]\}.*?(?:\{\\p0\}|$)/.test(text.trim())) {
      text = text.replace(/\{\\p[1-9]\}.*?(?:\{\\p0\}|$)/g, '');
    } else {
      text = text.replace(/\{\\p[1-9]\}.*?\{\\p0\}/g, '');
    }
  }

  // Convert basic formatting tags to standard HTML / VTT tags
  text = text
    .replace(/\{\\b([1-9]\d*|1)\}/g, '<b>')
    .replace(/\{\\b0\}/g, '</b>')
    .replace(/\{\\i1\}/g, '<i>')
    .replace(/\{\\i0\}/g, '</i>')
    .replace(/\{\\u1\}/g, '<u>')
    .replace(/\{\\u0\}/g, '</u>')
    .replace(/\{\\s1\}/g, '<s>')
    .replace(/\{\\s0\}/g, '</s>');

  // Strip all other ASS override codes e.g. {\pos(960,1040)\c&H00FFFF&...}
  text = text.replace(/\{[^}]*\}/g, '');

  // Convert line breaks and hard spaces
  text = text
    .replace(/\\N/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\h/g, ' ');

  // Clean trailing/leading spaces on each line and remove redundant empty lines
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines.join('\n').trim();
}

export interface VttCue {
  start: string;
  end: string;
  text: string;
}

/**
 * Converts raw ASS/SSA text into standard WebVTT format
 */
export function convertAssToVtt(assText: string): string {
  if (!assText || typeof assText !== 'string') {
    return 'WEBVTT\n\n';
  }

  const lines = assText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let inEvents = false;
  let startIdx = 1;
  let endIdx = 2;
  let textIdx = 9;

  const cues: VttCue[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('[')) {
      inEvents = trimmed.toLowerCase() === '[events]';
      continue;
    }

    if (!inEvents || !trimmed) continue;

    if (trimmed.toLowerCase().startsWith('format:')) {
      const formatHeaders = trimmed
        .substring(7)
        .split(',')
        .map(h => h.trim().toLowerCase());

      const foundStart = formatHeaders.indexOf('start');
      const foundEnd = formatHeaders.indexOf('end');
      const foundText = formatHeaders.indexOf('text');

      if (foundStart !== -1) startIdx = foundStart;
      if (foundEnd !== -1) endIdx = foundEnd;
      if (foundText !== -1) textIdx = foundText;
      continue;
    }

    // Process only Dialogue lines (ignore Comments and Picture events)
    if (/^dialogue\s*:/i.test(trimmed)) {
      const colonIdx = trimmed.indexOf(':');
      const payload = trimmed.substring(colonIdx + 1).trim();

      // Split up to textIdx commas so that dialogue text containing commas stays intact
      const parts: string[] = [];
      let currentPart = '';
      let commaCount = 0;

      for (let i = 0; i < payload.length; i++) {
        const char = payload[i];
        if (char === ',' && commaCount < textIdx) {
          parts.push(currentPart.trim());
          currentPart = '';
          commaCount++;
        } else {
          currentPart += char;
        }
      }
      parts.push(currentPart);

      if (parts.length > Math.max(startIdx, endIdx)) {
        const rawStart = parts[startIdx] || '0:00:00.00';
        const rawEnd = parts[endIdx] || '0:00:00.00';
        const rawDialogueText = parts[textIdx] || '';

        const vttStart = assTimestampToVtt(rawStart);
        const vttEnd = assTimestampToVtt(rawEnd);
        const cleanedText = cleanAssText(rawDialogueText);

        if (cleanedText.length > 0) {
          cues.push({
            start: vttStart,
            end: vttEnd,
            text: cleanedText
          });
        }
      }
    }
  }

  // Sort cues chronologically by start timestamp
  cues.sort((a, b) => a.start.localeCompare(b.start));

  let vttOutput = 'WEBVTT\n\n';
  cues.forEach((cue, index) => {
    vttOutput += `${index + 1}\n`;
    vttOutput += `${cue.start} --> ${cue.end}\n`;
    vttOutput += `${cue.text}\n\n`;
  });

  return vttOutput.trimEnd() + '\n';
}
