import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Automatically augment process.env.PATH with container virtual environment and local bin if present
const pathsToAugment = [
  path.join(process.cwd(), 'bin'),
  process.env.HOME ? path.join(process.env.HOME, '.local', 'bin') : '',
  '/opt/venv/bin',
  path.join(process.cwd(), '.venv', process.platform === 'win32' ? 'Scripts' : 'bin')
].filter(Boolean) as string[];

const currentPath = process.env.PATH || '';
const existingPaths = currentPath.split(path.delimiter);
for (const p of pathsToAugment) {
  if (fs.existsSync(p) && !existingPaths.includes(p)) {
    process.env.PATH = `${p}${path.delimiter}${process.env.PATH || ''}`;
  }
}

let resolvedFfmpegPath: string | null = null;
let resolvedFfsubsyncPath: string | null = null;
let resolvedAlassPath: string | null = null;

export function testBinaryExecution(bin: string, args: string[], timeoutMs: number = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    let proc: ReturnType<typeof spawn>;
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          proc?.kill('SIGKILL');
        } catch {}
        resolve(false);
      }
    }, timeoutMs);

    try {
      proc = spawn(bin, args, {
        windowsHide: true,
        stdio: ['ignore', 'ignore', 'ignore'],
        env: process.env
      });

      proc.on('error', () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(false);
        }
      });

      proc.on('close', (code) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(code === 0);
        }
      });
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    }
  });
}

export function getFfmpegCandidates(): string[] {
  const isWin = process.platform === 'win32';
  const list: string[] = [];

  // 1. Prioritize explicit environment variable
  if (process.env.FFMPEG_PATH && process.env.FFMPEG_PATH.trim() !== '') {
    list.push(process.env.FFMPEG_PATH.trim());
  }

  // 2. npm package ffmpeg-static
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && typeof ffmpegStatic === 'string' && fs.existsSync(ffmpegStatic)) {
      list.push(ffmpegStatic);
    }
  } catch {}

  // 3. Local project bin directory
  list.push(path.join(process.cwd(), 'bin', isWin ? 'ffmpeg.exe' : 'ffmpeg'));

  // 4. User local bin directory ($HOME/.local/bin)
  if (process.env.HOME) {
    list.push(path.join(process.env.HOME, '.local', 'bin', 'ffmpeg'));
  }

  // 5. Virtual environment (Docker / Render / Local)
  list.push('/opt/venv/bin/ffmpeg');
  list.push(path.join(process.cwd(), '.venv', isWin ? 'Scripts' : 'bin', isWin ? 'ffmpeg.exe' : 'ffmpeg'));
  list.push(path.join(process.cwd(), 'venv', isWin ? 'Scripts' : 'bin', isWin ? 'ffmpeg.exe' : 'ffmpeg'));

  // 6. Standard Linux / Unix paths
  list.push('/usr/local/bin/ffmpeg');
  list.push('/usr/bin/ffmpeg');
  list.push('/bin/ffmpeg');

  // 7. System PATH fallback
  list.push('ffmpeg');

  return list;
}

export function getFfsubsyncCandidates(): string[] {
  const isWin = process.platform === 'win32';
  const list: string[] = [];

  // 1. Prioritize explicit environment variable
  if (process.env.FFSUBSYNC_PATH && process.env.FFSUBSYNC_PATH.trim() !== '') {
    list.push(process.env.FFSUBSYNC_PATH.trim());
  }

  // 2. Local project bin directory
  list.push(path.join(process.cwd(), 'bin', isWin ? 'ffsubsync.exe' : 'ffsubsync'));

  // 3. User local bin directory ($HOME/.local/bin)
  if (process.env.HOME) {
    list.push(path.join(process.env.HOME, '.local', 'bin', 'ffsubsync'));
  }

  // 4. Virtual environment (Docker / Render / Local)
  list.push('/opt/venv/bin/ffsubsync');
  list.push(path.join(process.cwd(), '.venv', isWin ? 'Scripts' : 'bin', isWin ? 'ffsubsync.exe' : 'ffsubsync'));
  list.push(path.join(process.cwd(), 'venv', isWin ? 'Scripts' : 'bin', isWin ? 'ffsubsync.exe' : 'ffsubsync'));

  // 5. Standard Linux / Unix paths
  list.push('/usr/local/bin/ffsubsync');
  list.push('/usr/bin/ffsubsync');

  // 6. System PATH fallback
  list.push('ffsubsync');

  return list;
}

export function getAlassCandidates(): string[] {
  const isWin = process.platform === 'win32';
  const list: string[] = [];

  // 1. Prioritize explicit environment variable
  if (process.env.ALASS_PATH && process.env.ALASS_PATH.trim() !== '') {
    list.push(process.env.ALASS_PATH.trim());
  }

  // 2. Local project bin directory
  if (isWin) {
    list.push(path.join(process.cwd(), 'bin', 'alass.exe'));
    list.push(path.join(process.cwd(), 'bin', 'alass-cli.exe'));
    list.push(path.join(process.cwd(), 'bin', 'alass.bat'));
  } else {
    list.push(path.join(process.cwd(), 'bin', 'alass'));
    list.push(path.join(process.cwd(), 'bin', 'alass-cli'));
  }

  // 3. User local bin directory ($HOME/.local/bin)
  if (process.env.HOME) {
    list.push(path.join(process.env.HOME, '.local', 'bin', 'alass'));
  }

  // 4. Virtual environment (Docker / Render)
  list.push('/opt/venv/bin/alass');

  // 5. Standard Linux / Unix paths
  list.push('/usr/local/bin/alass');
  list.push('/usr/bin/alass');
  list.push('/usr/local/bin/alass-cli');
  list.push('/usr/bin/alass-cli');

  // 6. System PATH fallback
  list.push('alass');
  list.push('alass-cli');

  return list;
}

async function resolveCandidate(
  candidates: string[],
  versionArgs: string[],
  timeoutMs: number = 3000
): Promise<{ available: boolean; resolvedPath: string }> {
  for (const candidate of candidates) {
    // If it's a file path, check if it exists on disk before testing spawn
    if (candidate.includes(path.sep) || candidate.includes('/') || candidate.includes('\\')) {
      if (!fs.existsSync(candidate)) {
        continue;
      }
    }
    const ok = await testBinaryExecution(candidate, versionArgs, timeoutMs);
    if (ok) {
      return { available: true, resolvedPath: candidate };
    }
  }

  const existingFallback = candidates.find(c => (c.includes('/') || c.includes('\\')) && fs.existsSync(c));
  return { available: false, resolvedPath: existingFallback || candidates[0] };
}

export function getFfmpegPath(): string {
  if (resolvedFfmpegPath) return resolvedFfmpegPath;
  if (process.env.FFMPEG_PATH && process.env.FFMPEG_PATH.trim() !== '') {
    return process.env.FFMPEG_PATH.trim();
  }
  for (const c of getFfmpegCandidates()) {
    if ((c.includes('/') || c.includes('\\')) && fs.existsSync(c)) return c;
  }
  return 'ffmpeg';
}

export function getFfsubsyncPath(): string {
  if (resolvedFfsubsyncPath) return resolvedFfsubsyncPath;
  if (process.env.FFSUBSYNC_PATH && process.env.FFSUBSYNC_PATH.trim() !== '') {
    return process.env.FFSUBSYNC_PATH.trim();
  }
  for (const c of getFfsubsyncCandidates()) {
    if ((c.includes('/') || c.includes('\\')) && fs.existsSync(c)) return c;
  }
  return 'ffsubsync';
}

export function getAlassPath(): string {
  if (resolvedAlassPath) return resolvedAlassPath;
  if (process.env.ALASS_PATH && process.env.ALASS_PATH.trim() !== '') {
    return process.env.ALASS_PATH.trim();
  }
  for (const c of getAlassCandidates()) {
    if ((c.includes('/') || c.includes('\\')) && fs.existsSync(c)) return c;
  }
  return 'alass';
}

export async function isFfmpegAvailable(): Promise<boolean> {
  const result = await resolveCandidate(getFfmpegCandidates(), ['-version'], 3000);
  if (result.available) {
    resolvedFfmpegPath = result.resolvedPath;
  }
  return result.available;
}

export async function isFfsubsyncAvailable(): Promise<boolean> {
  const result = await resolveCandidate(getFfsubsyncCandidates(), ['--version'], 3000);
  if (result.available) {
    resolvedFfsubsyncPath = result.resolvedPath;
  }
  return result.available;
}

export async function isAlassAvailable(): Promise<boolean> {
  // First try --version
  let result = await resolveCandidate(getAlassCandidates(), ['--version'], 3000);
  if (!result.available) {
    // Secondary fallback with --help for alass variants
    result = await resolveCandidate(getAlassCandidates(), ['--help'], 3000);
  }
  if (result.available) {
    resolvedAlassPath = result.resolvedPath;
  }
  return result.available;
}
