export interface AlignmentOptions {
  videoUrl: string;
  subUrl: string;
  sampleDurationMinutes?: number; // default: 2
  timeoutSeconds?: number; // default: 5
  tool?: 'alass' | 'ffsubsync' | 'auto';
  uuid?: string;
}

export interface AlignmentMetrics {
  audioExtractionMs: number;
  alignmentExecutionMs: number;
  totalDurationMs: number;
  initialMemoryMb: number;
  peakMemoryMb: number;
  success: boolean;
  fallbackReason?: string;
  toolUsed?: string;
  cacheHit: boolean;
}

export interface AlignmentResult {
  srtContent: string;
  metrics: AlignmentMetrics;
  fromCache: boolean;
  isOriginalFallback: boolean;
}

export interface AlignmentToolStatus {
  ffmpeg: boolean;
  ffsubsync: boolean;
  alass: boolean;
  activeEngines: string[];
  ffmpegAvailable: boolean;
  alassAvailable: boolean;
  ffsubsyncAvailable: boolean;
  ffmpegPath?: string;
  alassPath?: string;
  ffsubsyncPath?: string;
}
