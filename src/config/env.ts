import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '7000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  BASE_URL: process.env.BASE_URL || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DATA_DIR: process.env.DATA_DIR || '',
  DEFAULT_OPENSUBTITLES_API_KEY: process.env.OPENSUBTITLES_API_KEY || '',
  DEFAULT_SUBDL_API_KEY: process.env.SUBDL_API_KEY || '',
  DEFAULT_SUBSOURCE_API_KEY: process.env.SUBSOURCE_API_KEY || '',
  CACHE_TTL_MINUTES: parseInt(process.env.CACHE_TTL_MINUTES || '30', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '150', 10),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FFSUBSYNC_PATH: process.env.FFSUBSYNC_PATH || '',
  ALASS_PATH: process.env.ALASS_PATH || '',
  FFMPEG_PATH: process.env.FFMPEG_PATH || ''
};
