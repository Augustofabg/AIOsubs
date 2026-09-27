import assert from 'assert';
import path from 'path';
import fs from 'fs';
import os from 'os';
import express from 'express';
import http from 'http';
import axios from 'axios';
import { AlignmentCacheManager } from '../src/services/alignment/cache';
import { detectAvailableTools } from '../src/services/alignment/aligner';
import { alignSubtitle } from '../src/services/alignment/service';
import { createServer } from '../src/server';
import { encodeUserConfig, decodeUserConfig } from '../src/config/userConfig';
import { configStorage } from '../src/storage/configStore';
import { UserConfig } from '../src/types/config';

async function runTests() {
  console.log('🧪 Starting Alignment & Auto-Sync Test Suite...\n');

  // 1. Cache Manager Tests
  console.log('--- Test 1: AlignmentCacheManager (Memory + Disk + TTL) ---');
  const testCacheDir = path.join(os.tmpdir(), `aiosubs-test-cache-${Date.now()}`);
  const cacheManager = new AlignmentCacheManager(testCacheDir, 5); // 5 min TTL

  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const subUrl = 'https://example.com/subtitles.srt';
  const sampleSrt = '1\n00:00:01,000 --> 00:00:04,000\nHello World\n';

  const key1 = cacheManager.generateKey(videoUrl, subUrl, 2, 'auto');
  const key2 = cacheManager.generateKey(videoUrl, subUrl, 5, 'auto');
  assert.notStrictEqual(key1, key2, 'Keys with different sample durations must differ');

  assert.strictEqual(cacheManager.get(key1), null, 'Cache miss before set should return null');

  cacheManager.set(key1, sampleSrt);
  const retrieved = cacheManager.get(key1);
  assert.strictEqual(retrieved, sampleSrt, 'Cache hit should return stored content');

  // Verify file written to disk
  const diskFile = path.join(testCacheDir, `${key1}.srt`);
  assert(fs.existsSync(diskFile), 'Cache file should exist on disk');
  assert.strictEqual(fs.readFileSync(diskFile, 'utf8'), sampleSrt, 'Disk content matches');

  cacheManager.clear();
  assert.strictEqual(cacheManager.get(key1), null, 'After clear, cache should return null');
  cacheManager.close();

  // Clean test cache dir
  try {
    fs.rmSync(testCacheDir, { recursive: true, force: true });
  } catch {}
  console.log('✅ Test 1 Passed: Cache generation, memory, disk, and cleanup work as expected.\n');

  // 2. Binary Tool Detection Test (Non-blocking)
  console.log('--- Test 2: Binary Detection (Non-blocking & Safe) ---');
  const tools = await detectAvailableTools();
  assert(typeof tools.ffmpeg === 'boolean', 'ffmpeg must be boolean');
  assert(typeof tools.alass === 'boolean', 'alass must be boolean');
  assert(typeof tools.ffsubsync === 'boolean', 'ffsubsync must be boolean');
  assert(Array.isArray(tools.activeEngines), 'activeEngines must be an array');
  assert(typeof tools.ffmpegAvailable === 'boolean', 'ffmpegAvailable must be boolean');
  assert(typeof tools.alassAvailable === 'boolean', 'alassAvailable must be boolean');
  assert(typeof tools.ffsubsyncAvailable === 'boolean', 'ffsubsyncAvailable must be boolean');
  console.log(`Tools detected on host: ffmpeg=${tools.ffmpeg}, alass=${tools.alass}, ffsubsync=${tools.ffsubsync}, activeEngines=[${tools.activeEngines.join(', ')}]`);
  console.log('✅ Test 2 Passed: Detection runs safely without blocking or throwing.\n');

  // 3. Fallback Mechanism & Safety Timeout
  console.log('--- Test 3: Fallback Mechanism on Missing Tools / Timeout ---');
  // Start a local mock server to serve candidate subtitle
  const mockApp = express();
  const candidateSrt = '1\n00:00:02,500 --> 00:00:05,000\nCandidate subtitle line\n';
  mockApp.get('/mock.srt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(candidateSrt);
  });
  const mockServer = http.createServer(mockApp);
  await new Promise<void>((resolve) => mockServer.listen(0, '127.0.0.1', () => resolve()));
  const mockPort = (mockServer.address() as any).port;
  const mockSubUrl = `http://127.0.0.1:${mockPort}/mock.srt`;

  const alignResult = await alignSubtitle({
    videoUrl: 'http://127.0.0.1:9999/dummy.mp4',
    subUrl: mockSubUrl,
    sampleDurationMinutes: 2,
    timeoutSeconds: 2,
    tool: 'auto'
  });

  assert(alignResult.srtContent.includes('Candidate subtitle line'), 'Fallback must deliver candidate subtitle');
  assert.strictEqual(alignResult.fromCache, false, 'Result should not be from cache on first run');
  assert.strictEqual(alignResult.isOriginalFallback, true, 'isOriginalFallback must be true when tools or stream fail');
  assert(alignResult.metrics.fallbackReason, 'A fallbackReason must be provided');
  assert(alignResult.metrics.initialMemoryMb > 0, 'initialMemoryMb must be reported');
  assert(alignResult.metrics.peakMemoryMb > 0, 'peakMemoryMb must be reported');
  console.log(`Fallback reason: ${alignResult.metrics.fallbackReason}`);
  console.log('✅ Test 3 Passed: Safe fallback delivered candidate subtitle smoothly.\n');

  // 4. HTTP /sub/aligned Endpoint Integration Test
  console.log('--- Test 4: HTTP /sub/aligned Endpoint ---');
  const mainApp = createServer();
  const mainServer = http.createServer(mainApp);
  await new Promise<void>((resolve) => mainServer.listen(0, '127.0.0.1', () => resolve()));
  const mainPort = (mainServer.address() as any).port;

  // 4a. Missing query parameters -> 400
  try {
    await axios.get(`http://127.0.0.1:${mainPort}/sub/aligned`);
    assert.fail('Should have returned 400 on missing params');
  } catch (err: any) {
    assert.strictEqual(err.response?.status, 400, 'Expected status 400');
  }

  // 4b. Valid request -> 200 with fallback headers
  const resp1 = await axios.get(`http://127.0.0.1:${mainPort}/sub/aligned`, {
    params: {
      videoUrl: 'http://127.0.0.1:9999/dummy.mp4',
      subUrl: mockSubUrl
    }
  });

  assert.strictEqual(resp1.status, 200);
  assert(resp1.data.includes('Candidate subtitle line'));
  assert.strictEqual(resp1.headers['x-alignment-status'], 'fallback');
  assert.strictEqual(resp1.headers['x-alignment-cache'], 'MISS');
  assert(resp1.headers['x-alignment-time-ms'], 'Time ms header present');
  assert(resp1.headers['x-alignment-ram-before-mb'], 'RAM before header present');

  // 4c. Tool status endpoint
  const statusResp = await axios.get(`http://127.0.0.1:${mainPort}/api/alignment/status`);
  assert.strictEqual(statusResp.status, 200);
  assert(typeof statusResp.data.ffmpegAvailable === 'boolean');

  console.log('✅ Test 4 Passed: /sub/aligned endpoint handles validation, metrics headers, and delivery.\n');

  // 5. Config Persistence with autoAlignment
  console.log('--- Test 5: UserConfig autoAlignment Serialization & Persistence ---');
  const testConfig: UserConfig = {
    instanceName: 'TestAIOSubs',
    instanceDesc: 'Testing config',
    instanceLogo: '',
    instanceVersion: 'v1.0.0',
    providers: {},
    customAddons: [],
    addonFetchingStrategy: 'default',
    providerPriority: [],
    languages: ['pob', 'eng'],
    allowUnknownLanguages: false,
    languageRemap: {},
    providerTimeoutMs: 5000,
    deduplication: true,
    deduplicationStrategy: 'both',
    cacheTtlMinutes: 30,
    formatter: {
      preset: 'clean',
      nameTemplate: '{sub.lang}',
      descriptionTemplate: ''
    },
    autoAlignment: {
      enabled: true,
      sampleDurationMinutes: 5,
      timeoutSeconds: 6,
      tool: 'alass'
    }
  };

  const encoded = encodeUserConfig(testConfig);
  const decoded = decodeUserConfig(encoded);
  assert.strictEqual(decoded.autoAlignment?.enabled, true);
  assert.strictEqual(decoded.autoAlignment?.sampleDurationMinutes, 5);
  assert.strictEqual(decoded.autoAlignment?.timeoutSeconds, 6);
  assert.strictEqual(decoded.autoAlignment?.tool, 'alass');

  // Test storage
  const testUuid = '11111111-2222-3333-4444-555555555555';
  const saveResult = await configStorage.saveConfigAsync(testUuid, 'SecretPassword123!', testConfig);
  assert(saveResult.success, 'Saving config with autoAlignment must succeed');

  const authResult = await configStorage.authenticateAndGetConfigAsync(testUuid, 'SecretPassword123!');
  assert(authResult.success, 'Auth must succeed');
  assert.strictEqual(authResult.config?.autoAlignment?.enabled, true);
  assert.strictEqual(authResult.config?.autoAlignment?.sampleDurationMinutes, 5);
  assert.strictEqual(authResult.config?.autoAlignment?.timeoutSeconds, 6);
  assert.strictEqual(authResult.config?.autoAlignment?.tool, 'alass');

  console.log('✅ Test 5 Passed: Configuration autoAlignment values persist and round-trip successfully.\n');

  // Cleanup servers
  await new Promise<void>((resolve) => mockServer.close(() => resolve()));
  await new Promise<void>((resolve) => mainServer.close(() => resolve()));

  console.log('🎉 ALL ALIGNMENT & AUTO-SYNC TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
