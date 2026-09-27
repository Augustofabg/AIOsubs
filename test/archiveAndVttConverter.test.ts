import assert from 'assert';
import AdmZip from 'adm-zip';
import http from 'http';
import { createServer } from '../src/server';
import {
  extractSubtitleFromArchive,
  isZipBuffer,
  isGzipBuffer
} from '../src/services/archive';
import {
  convertAssToVtt,
  cleanAssText,
  assTimestampToVtt,
  clientSupportsNativeAss,
  isAssOrSsa
} from '../src/services/converter';
import { decodeUserConfig, encodeUserConfig } from '../src/config/userConfig';

async function runArchiveAndVttTests() {
  console.log('🧪 Starting Universal Archive Extractor & VTT Converter Test Suite...\n');

  // =========================================================================
  // 1. Universal Archive Extractor (Season Packs, Anime & Episode Matching)
  // =========================================================================
  console.log('--- 1. Archive Extractor: Episode & Season Matching ---');

  // Create an in-memory ZIP season pack with various naming schemes
  const zip = new AdmZip();
  zip.addFile('Breaking.Bad.S01E01.720p.srt', Buffer.from('1\n00:00:01,000 --> 00:00:03,000\nEpisode 1\n', 'utf8'));
  zip.addFile('Breaking.Bad.S01E02.720p.srt', Buffer.from('1\n00:00:01,000 --> 00:00:03,000\nEpisode 2\n', 'utf8'));
  zip.addFile('Breaking.Bad.S01E04.720p.srt', Buffer.from('1\n00:00:01,000 --> 00:00:03,000\nEpisode 4 (S01E04)\n', 'utf8'));
  zip.addFile('Breaking.Bad.S02E04.720p.srt', Buffer.from('1\n00:00:01,000 --> 00:00:03,000\nSeason 2 Episode 4\n', 'utf8'));
  zip.addFile('subtitles/frieren_e4.ass', Buffer.from('[Script Info]\nTitle: Frieren 04\n[Events]\nFormat: Layer, Start, End, Text\nDialogue: 0,0:01:00.00,0:01:05.00,Frieren ep 4\n', 'utf8'));
  zip.addFile('anime/[Fansub] Attack on Titan - 04 [1080p].ass', Buffer.from('[Script Info]\nTitle: AoT\n[Events]\nFormat: Layer, Start, End, Text\nDialogue: 0,0:01:00.00,0:01:05.00,AoT ep 4\n', 'utf8'));
  zip.addFile('anime/1x04 - The Fourth Episode.srt', Buffer.from('1\n00:00:01,000 --> 00:00:03,000\n1x04 Episode\n', 'utf8'));
  zip.addFile('other_show/Episode 04.vtt', Buffer.from('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nEpisode 04\n', 'utf8'));
  zip.addFile('__MACOSX/._Breaking.Bad.S01E04.srt', Buffer.from('junk-mac-os', 'utf8'));
  zip.addFile('read_me.txt', Buffer.from('instructions', 'utf8'));

  const zipBuffer = zip.toBuffer();
  assert(isZipBuffer(zipBuffer), 'isZipBuffer must identify valid ZIP header');

  // Test A: S01E04 matching (should pick S01E04, not S02E04)
  const resultS01E04 = extractSubtitleFromArchive(zipBuffer, {
    type: 'series',
    season: 1,
    episode: 4
  });
  assert.strictEqual(resultS01E04.isArchive, true);
  assert.strictEqual(resultS01E04.filename, 'Breaking.Bad.S01E04.720p.srt');
  assert(resultS01E04.buffer.toString('utf8').includes('Episode 4 (S01E04)'));
  console.log('  ✅ S01E04 correctly matched and isolated from Season 2 files');

  // Test B: Season 2 Episode 4
  const resultS02E04 = extractSubtitleFromArchive(zipBuffer, {
    type: 'series',
    season: 2,
    episode: 4
  });
  assert.strictEqual(resultS02E04.filename, 'Breaking.Bad.S02E04.720p.srt');
  assert(resultS02E04.buffer.toString('utf8').includes('Season 2 Episode 4'));
  console.log('  ✅ S02E04 correctly matched for Season 2');

  // Test C: Anime dash pattern " - 04 "
  const animeZip = new AdmZip();
  animeZip.addFile('[Sub] Jujutsu Kaisen - 03.ass', Buffer.from('ep 3', 'utf8'));
  animeZip.addFile('[Sub] Jujutsu Kaisen - 04.ass', Buffer.from('ep 4', 'utf8'));
  animeZip.addFile('[Sub] Jujutsu Kaisen - 05.ass', Buffer.from('ep 5', 'utf8'));
  const animeResult = extractSubtitleFromArchive(animeZip.toBuffer(), {
    type: 'series',
    episode: 4
  });
  assert.strictEqual(animeResult.filename, '[Sub] Jujutsu Kaisen - 04.ass');
  assert.strictEqual(animeResult.format, 'ass');
  console.log('  ✅ Anime dash format "[Sub] Title - 04.ass" matched successfully');

  // Test D: Bracket pattern "[04]" and "1x04"
  const bracketZip = new AdmZip();
  bracketZip.addFile('One_Piece_[03].srt', Buffer.from('ep 3', 'utf8'));
  bracketZip.addFile('One_Piece_[04].srt', Buffer.from('ep 4', 'utf8'));
  const bracketResult = extractSubtitleFromArchive(bracketZip.toBuffer(), {
    type: 'series',
    episode: 4
  });
  assert.strictEqual(bracketResult.filename, 'One_Piece_[04].srt');
  console.log('  ✅ Bracket format "[04]" matched successfully');

  // =========================================================================
  // 2. Language Prioritization in Archive Extraction
  // =========================================================================
  console.log('\n--- 2. Archive Extractor: Language Prioritization ---');

  const multiLangZip = new AdmZip();
  multiLangZip.addFile('Show.S01E04.eng.srt', Buffer.from('English subtitle', 'utf8'));
  multiLangZip.addFile('Show.S01E04.pob.srt', Buffer.from('Legenda em Português Brasil', 'utf8'));
  multiLangZip.addFile('Show.S01E04.spa.srt', Buffer.from('Subtitulo en Espanol', 'utf8'));

  const pobResult = extractSubtitleFromArchive(multiLangZip.toBuffer(), {
    type: 'series',
    season: 1,
    episode: 4,
    targetLang: 'pob'
  });
  assert.strictEqual(pobResult.filename, 'Show.S01E04.pob.srt');
  assert(pobResult.buffer.toString('utf8').includes('Português Brasil'));
  console.log('  ✅ Target language "pob" prioritized when multiple languages exist for episode');

  const engResult = extractSubtitleFromArchive(multiLangZip.toBuffer(), {
    type: 'series',
    season: 1,
    episode: 4,
    targetLang: 'eng'
  });
  assert.strictEqual(engResult.filename, 'Show.S01E04.eng.srt');
  console.log('  ✅ Target language "eng" prioritized correctly');

  // =========================================================================
  // 3. Fallback and Corrupted Archive Handling
  // =========================================================================
  console.log('\n--- 3. Archive Extractor: Corrupted Archive Fallback ---');

  const corruptedBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x99, 0x88]);
  const fallbackResult = extractSubtitleFromArchive(corruptedBuffer, {
    type: 'series',
    season: 1,
    episode: 4
  });
  assert(fallbackResult.buffer !== undefined, 'Corrupted archive must return safe fallback without throwing');
  console.log('  ✅ Corrupted ZIP safely handled without throwing exception');

  // =========================================================================
  // 4. ASS / SSA to WebVTT Smart Conversion
  // =========================================================================
  console.log('\n--- 4. ASS to WebVTT Converter: Timestamps, Styles & Stripping ---');

  // Test timestamp conversion
  assert.strictEqual(assTimestampToVtt('0:01:23.45'), '00:01:23.450');
  assert.strictEqual(assTimestampToVtt('1:05:09.80'), '01:05:09.800');
  assert.strictEqual(assTimestampToVtt('0:00:00.00'), '00:00:00.000');
  console.log('  ✅ ASS centisecond timestamps converted to WebVTT millisecond standard');

  // Test text cleaning
  const sampleAssText = '{\\pos(960,1040)\\c&H00FFFF&}{\\b1}Texto em negrito{\\b0}\\N{\\i1}Segunda linha em itálico{\\i0}';
  const cleaned = cleanAssText(sampleAssText);
  assert.strictEqual(cleaned, '<b>Texto em negrito</b>\n<i>Segunda linha em itálico</i>');
  console.log('  ✅ ASS override tags stripped and basic formatting (<b>, <i>, \\N) converted');

  // Test drawing command removal
  const drawingAss = '{\\p1}m 0 0 l 100 0 100 100 0 100{\\p0}';
  const cleanedDrawing = cleanAssText(drawingAss);
  assert.strictEqual(cleanedDrawing, '', 'Pure drawing commands must be stripped');
  console.log('  ✅ Drawing commands (\\p1...\\p0) safely filtered');

  // Full ASS document conversion
  const rawAssDoc = `[Script Info]
Title: Anime Episode 4
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,55,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:01:23.45,0:01:25.67,Default,,0,0,0,,{\\pos(960,1040)\\c&H00FFFF&}Primeira fala da legenda!
Dialogue: 0,0:01:26.10,0:01:28.90,Default,,0,0,0,,{\\b1}Importante!{\\b0}\\NSegunda linha de diálogo
Comment: 0,0:00:00.00,0:00:00.00,Default,,0,0,0,,Nota do tradutor
Dialogue: 0,0:01:30.00,0:01:33.00,Default,,0,0,0,,{\\i1}Fala em itálico com vírgula, e mais vírgulas, tudo certo{\\i0}
`;

  assert(isAssOrSsa(rawAssDoc, 'episode4.ass'), 'isAssOrSsa must detect ASS document');
  const vttResult = convertAssToVtt(rawAssDoc);

  assert(vttResult.startsWith('WEBVTT'), 'Converted subtitle must begin with WEBVTT');
  assert(vttResult.includes('00:01:23.450 --> 00:01:25.670'), 'Timestamp 1 must match converted value');
  assert(vttResult.includes('Primeira fala da legenda!'), 'Dialogue text 1 must be preserved');
  assert(vttResult.includes('<b>Importante!</b>\nSegunda linha de diálogo'), 'Bold and multiline must be preserved');
  assert(!vttResult.includes('Nota do tradutor'), 'Comments must be excluded');
  assert(vttResult.includes('<i>Fala em itálico com vírgula, e mais vírgulas, tudo certo</i>'), 'Commas in text must not break columns');
  console.log('  ✅ Complete ASS file converted to clean, compliant WebVTT');

  // =========================================================================
  // 5. Client Detection: Desktop MPV vs Web / Browser / TV
  // =========================================================================
  console.log('\n--- 5. Client Detection: Native ASS vs Web/TV ---');

  // Desktop with MPV engine
  assert.strictEqual(clientSupportsNativeAss('Stremio/4.4.168 (Windows; x64)'), true, 'Stremio Desktop supports native ASS');
  assert.strictEqual(clientSupportsNativeAss('mpv 0.35.0'), true, 'MPV client supports native ASS');
  assert.strictEqual(clientSupportsNativeAss('vlc/3.0.18'), true, 'VLC supports native ASS');
  assert.strictEqual(clientSupportsNativeAss('', 'mpv'), true, 'Explicit client=mpv supports native ASS');
  assert.strictEqual(clientSupportsNativeAss('', 'desktop'), true, 'Explicit client=desktop supports native ASS');

  // Web Browsers and Smart TVs
  assert.strictEqual(clientSupportsNativeAss('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'), false, 'Chrome browser must trigger VTT conversion');
  assert.strictEqual(clientSupportsNativeAss('Mozilla/5.0 (SmartTV; Tizen 6.0) AppleWebKit/537.36'), false, 'Tizen SmartTV must trigger VTT conversion');
  assert.strictEqual(clientSupportsNativeAss('Mozilla/5.0 (Web0S; SmartTV) AppleWebKit/537.36'), false, 'LG webOS SmartTV must trigger VTT conversion');
  assert.strictEqual(clientSupportsNativeAss('Nuvio-Web/1.0 Mozilla/5.0'), false, 'Nuvio Web must trigger VTT conversion');
  assert.strictEqual(clientSupportsNativeAss('Mozilla/5.0 StremioWeb/1.0.0 Chrome/119.0.0.0 Safari/537.36'), false, 'Stremio Web must trigger VTT conversion');
  assert.strictEqual(clientSupportsNativeAss('', 'web'), false, 'Explicit client=web must trigger VTT conversion');

  console.log('  ✅ Native ASS clients (Stremio Desktop, MPV, VLC) correctly separated from Web/TV clients');

  // =========================================================================
  // 6. HTTP Endpoint Proxy Delivery (/sub/proxy)
  // =========================================================================
  console.log('\n--- 6. HTTP Proxy Delivery: Headers & Conditional Conversion ---');

  const app = createServer();
  const testServer = http.createServer(app);
  await new Promise<void>((resolve) => testServer.listen(0, resolve));
  const port = (testServer.address() as any).port;

  // Mock upstream server to serve test ZIP and ASS files
  const mockUpstream = http.createServer((req, res) => {
    if (req.url === '/test-pack.zip') {
      res.setHeader('Content-Type', 'application/zip');
      res.end(zipBuffer);
    } else if (req.url === '/test-styled.ass') {
      res.setHeader('Content-Type', 'text/x-ssa');
      res.end(rawAssDoc);
    } else if (req.url === '/corrupted.zip') {
      res.setHeader('Content-Type', 'application/zip');
      res.end(corruptedBuffer);
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });
  await new Promise<void>((resolve) => mockUpstream.listen(0, resolve));
  const mockPort = (mockUpstream.address() as any).port;

  try {
    // 6a. Deliver episode 4 from season pack via /sub/proxy
    const zipProxyRes = await fetch(
      `http://localhost:${port}/sub/proxy?url=${encodeURIComponent(`http://localhost:${mockPort}/test-pack.zip`)}&type=series&season=1&episode=4&filename=Show.S01E04.srt`
    );
    assert.strictEqual(zipProxyRes.status, 200);
    assert.strictEqual(zipProxyRes.headers.get('access-control-allow-origin'), '*');
    assert.strictEqual(zipProxyRes.headers.get('x-archive-extracted'), 'true');
    assert(zipProxyRes.headers.get('content-type')?.includes('text/plain'));
    const zipProxyText = await zipProxyRes.text();
    assert(zipProxyText.includes('Episode 4 (S01E04)'), 'Proxied subtitle must contain extracted S01E04 content');
    console.log('  ✅ /sub/proxy successfully decompressed ZIP season pack and extracted exact episode 4 in-memory');

    // 6b. Deliver ASS to Web Browser -> Converts to VTT
    const browserRes = await fetch(
      `http://localhost:${port}/sub/proxy?url=${encodeURIComponent(`http://localhost:${mockPort}/test-styled.ass`)}&filename=styled.ass`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    assert.strictEqual(browserRes.status, 200);
    assert.strictEqual(browserRes.headers.get('x-vtt-converted'), 'true');
    assert(browserRes.headers.get('content-type')?.includes('text/vtt'), 'Browser client must receive text/vtt');
    const browserVtt = await browserRes.text();
    assert(browserVtt.startsWith('WEBVTT'), 'Converted content must begin with WEBVTT');
    assert(browserVtt.includes('Primeira fala da legenda!'));
    console.log('  ✅ /sub/proxy automatically converted .ass to WebVTT for browser client');

    // 6c. Deliver ASS to Desktop MPV -> Serves original ASS
    const mpvRes = await fetch(
      `http://localhost:${port}/sub/proxy?url=${encodeURIComponent(`http://localhost:${mockPort}/test-styled.ass`)}&filename=styled.ass`,
      {
        headers: {
          'User-Agent': 'Stremio/4.4.168 (Windows; x64)'
        }
      }
    );
    assert.strictEqual(mpvRes.status, 200);
    assert(mpvRes.headers.get('x-vtt-converted')?.includes('native_client_mpv'));
    assert(mpvRes.headers.get('content-type')?.includes('text/x-ssa'), 'MPV desktop client must receive text/x-ssa');
    const mpvText = await mpvRes.text();
    assert(mpvText.includes('[Script Info]'), 'Native desktop client receives raw ASS styling intact');
    console.log('  ✅ /sub/proxy preserved native .ass for Stremio Desktop with MPV');

    // 6d. Corrupted archive fallback -> Returns 200 with empty valid subtitle without breaking player
    const corruptRes = await fetch(
      `http://localhost:${port}/sub/proxy?url=${encodeURIComponent(`http://localhost:${mockPort}/corrupted.zip`)}&filename=broken.srt`
    );
    assert.strictEqual(corruptRes.status, 200, 'Corrupted upstream must return HTTP 200 safe fallback, never 500');
    assert.strictEqual(corruptRes.headers.get('x-subtitle-fallback'), 'true');
    console.log('  ✅ Corrupted ZIP upstream handled with safe HTTP 200 fallback without crashing player');

    // 6e. Deliver ASS to Web Browser with &vtt=0 -> Deactivated VTT conversion delivers raw ASS intact
    const disabledVttRes = await fetch(
      `http://localhost:${port}/sub/proxy?url=${encodeURIComponent(`http://localhost:${mockPort}/test-styled.ass`)}&filename=styled.ass&vtt=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    assert.strictEqual(disabledVttRes.status, 200);
    assert(disabledVttRes.headers.get('x-vtt-converted')?.includes('disabled_by_user'));
    assert(disabledVttRes.headers.get('content-type')?.includes('text/x-ssa'), 'Disabled VTT conversion must return text/x-ssa even to web browsers');
    const disabledVttText = await disabledVttRes.text();
    assert(disabledVttText.includes('[Script Info]'), 'Original raw ASS styling must be preserved when VTT conversion is deactivated');
    assert(!disabledVttText.startsWith('WEBVTT'), 'Must not convert to WEBVTT when vtt=0 is passed');
    console.log('  ✅ /sub/proxy with vtt=0 respected user toggle and bypassed VTT conversion for browser client');

    // 6f. Deliver ASS to Web Browser with &vttConversion=false
    const disabledVttRes2 = await fetch(
      `http://localhost:${port}/sub/proxy?url=${encodeURIComponent(`http://localhost:${mockPort}/test-styled.ass`)}&filename=styled.ass&vttConversion=false`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    assert.strictEqual(disabledVttRes2.status, 200);
    assert(disabledVttRes2.headers.get('content-type')?.includes('text/x-ssa'));
    const disabledVttText2 = await disabledVttRes2.text();
    assert(disabledVttText2.includes('[Script Info]'));
    console.log('  ✅ /sub/proxy with vttConversion=false also disabled VTT conversion correctly');

    // 6g. UserConfig decode & encode maintains vttConversion toggle state
    const cfgDefault = decodeUserConfig('');
    assert.strictEqual(cfgDefault.vttConversion, true, 'Default vttConversion must be true');
    assert.strictEqual(cfgDefault.autoAlignment?.vttConversion, true, 'Default autoAlignment.vttConversion must be true');

    const encodedDisabled = encodeUserConfig({
      ...cfgDefault,
      vttConversion: false,
      autoAlignment: {
        ...cfgDefault.autoAlignment!,
        vttConversion: false
      }
    });
    const cfgDisabled = decodeUserConfig(encodedDisabled);
    assert.strictEqual(cfgDisabled.vttConversion, false, 'vttConversion: false must persist through encoding/decoding');
    assert.strictEqual(cfgDisabled.autoAlignment?.vttConversion, false, 'autoAlignment.vttConversion: false must persist');
    console.log('  ✅ UserConfig correctly serializes and restores vttConversion state');

  } finally {
    await new Promise<void>((resolve) => testServer.close(() => resolve()));
    await new Promise<void>((resolve) => mockUpstream.close(() => resolve()));
  }

  console.log('\n🎉 ALL ARCHIVE EXTRACTOR & VTT CONVERTER TESTS PASSED WITH 100% SUCCESS!');
}

runArchiveAndVttTests().catch((err) => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});
