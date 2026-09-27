import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createServer } from '../src/server';
import {
  detectAvailableTools,
  getFfmpegCandidates,
  getFfsubsyncCandidates,
  getAlassCandidates,
  getFfmpegPath,
  getFfsubsyncPath,
  getAlassPath,
  testBinaryExecution
} from '../src/services/alignment/binaryResolver';

async function runBinaryDetectionTests() {
  console.log('🧪 Starting Binary Detection & Resolution Tests...\n');

  // 1. Candidate lists include standard paths and virtual environment
  console.log('--- Test 1: Candidate Paths & Priority ---');
  const ffmpegCandidates = getFfmpegCandidates();
  const ffsubsyncCandidates = getFfsubsyncCandidates();
  const alassCandidates = getAlassCandidates();

  assert(ffmpegCandidates.includes('/opt/venv/bin/ffmpeg'), 'ffmpeg candidates must include /opt/venv/bin/ffmpeg');
  assert(ffsubsyncCandidates.includes('/opt/venv/bin/ffsubsync'), 'ffsubsync candidates must include /opt/venv/bin/ffsubsync');
  assert(alassCandidates.includes('/opt/venv/bin/alass'), 'alass candidates must include /opt/venv/bin/alass');

  assert(ffmpegCandidates.includes('ffmpeg'), 'ffmpeg candidates must include ffmpeg');
  assert(ffsubsyncCandidates.includes('ffsubsync'), 'ffsubsync candidates must include ffsubsync');
  assert(alassCandidates.includes('alass'), 'alass candidates must include alass');
  console.log('✅ Test 1 Passed: Candidates include /opt/venv/bin and system paths.\n');

  // 2. Custom environment variable priority
  console.log('--- Test 2: Custom Environment Variables ---');
  process.env.FFSUBSYNC_PATH = '/custom/path/to/ffsubsync';
  process.env.ALASS_PATH = '/custom/path/to/alass';
  process.env.FFMPEG_PATH = '/custom/path/to/ffmpeg';

  assert.strictEqual(getFfsubsyncCandidates()[0], '/custom/path/to/ffsubsync', 'FFSUBSYNC_PATH must be prioritized first');
  assert.strictEqual(getAlassCandidates()[0], '/custom/path/to/alass', 'ALASS_PATH must be prioritized first');
  assert.strictEqual(getFfmpegCandidates()[0], '/custom/path/to/ffmpeg', 'FFMPEG_PATH must be prioritized first');

  delete process.env.FFSUBSYNC_PATH;
  delete process.env.ALASS_PATH;
  delete process.env.FFMPEG_PATH;
  console.log('✅ Test 2 Passed: Custom env paths are prioritized when present.\n');

  // 3. Fast binary execution test with timeout
  console.log('--- Test 3: Binary Execution with 500ms Timeout ---');
  const tStart = Date.now();
  const execResult = await testBinaryExecution('non_existent_binary_xyz_123', ['--version'], 500);
  const elapsed = Date.now() - tStart;
  assert.strictEqual(execResult, false, 'Non-existent binary must return false safely');
  assert(elapsed <= 750, 'Timeout must complete within around 500ms');
  console.log(`✅ Test 3 Passed: Safe execution timeout returned false in ${elapsed}ms.\n`);

  // 4. API Endpoint GET /api/alignment/status JSON Response
  console.log('--- Test 4: Endpoint GET /api/alignment/status JSON format ---');
  const app = createServer();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as any).port;

  const res = await fetch(`http://127.0.0.1:${port}/api/alignment/status`);
  assert.strictEqual(res.status, 200, 'Status endpoint must return 200');
  const data = await res.json();

  assert(typeof data.ffmpeg === 'boolean', 'data.ffmpeg must be boolean');
  assert(typeof data.ffsubsync === 'boolean', 'data.ffsubsync must be boolean');
  assert(typeof data.alass === 'boolean', 'data.alass must be boolean');
  assert(Array.isArray(data.activeEngines), 'data.activeEngines must be an array');
  assert(typeof data.ffmpegAvailable === 'boolean', 'data.ffmpegAvailable must be boolean');
  assert(typeof data.ffsubsyncAvailable === 'boolean', 'data.ffsubsyncAvailable must be boolean');
  assert(typeof data.alassAvailable === 'boolean', 'data.alassAvailable must be boolean');

  console.log('Status endpoint output:', JSON.stringify(data, null, 2));
  server.close();
  console.log('✅ Test 4 Passed: GET /api/alignment/status returns exact required schema.\n');

  console.log('🎉 ALL BINARY DETECTION & RESOLUTION TESTS PASSED SUCCESSFULLY!\n');
}

runBinaryDetectionTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
