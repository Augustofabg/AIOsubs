import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import QRCode from 'qrcode';

import { ENV } from './config/env';
import { StremioManifest } from './types/stremio';
import { decodeUserConfig, decodeUserConfigAsync, mergeWithDefaults } from './config/userConfig';
import { handleSubtitleProxy, handleOpenSubtitlesRestDownload, handleShortIdDownload, handleUnifiedSubtitleProxy } from './proxy/subtitleProxy';
import { getAllProviders } from './providers';
import { globalSubtitleCache } from './utils/cache';
import { Logger } from './utils/logger';
import { configStorage, isUuid } from './storage/configStore';
import { parseSubtitleQuery, getAggregatedSubtitles } from './core/aggregator';
import { SUPPORTED_LANGUAGES } from './utils/languages';
import { alignSubtitle, detectAvailableTools } from './services/alignment';

export function createServer(): express.Application {
  const app = express();

  configStorage.initialize().catch(err => {
    Logger.error('Async storage initialization error:', err);
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({
    windowMs: ENV.RATE_LIMIT_WINDOW_MS,
    max: ENV.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/subtitles', limiter);

  const getBaseUrl = (req: Request): string => {
    if (ENV.BASE_URL && ENV.BASE_URL.trim() !== '') {
      return ENV.BASE_URL.replace(/\/+$/, '');
    }
    const host = req.get('host') || `localhost:${ENV.PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    return `${protocol}://${host}`;
  };

  const buildManifest = async (encodedConfig?: string): Promise<StremioManifest> => {
    const config = await decodeUserConfigAsync(encodedConfig);
    const activeProviders = Object.keys(config.providers).filter(
      id => config.providers[id]?.enabled
    );
    const activeAddons = config.customAddons.filter(a => a.enabled);
    const totalActive = activeProviders.length + activeAddons.length;

    const description = config.instanceDesc || (totalActive > 0
      ? `Agregador de legendas com ${totalActive} fonte(s) ativas.`
      : 'Agregador universal de legendas para Stremio.');

    return {
      id: 'community.aiosubtitles',
      version: config.instanceVersion || '1.0.0',
      name: config.instanceName || 'AIOSubs',
      description,
      logo: config.instanceLogo || '/assets/AIOsubs_logo_wordmark.png',
      resources: [
        {
          name: 'subtitles',
          types: ['movie', 'series', 'anime', 'other'],
          idPrefixes: ['tt', 'kitsu']
        }
      ],
      types: ['movie', 'series', 'anime', 'other'],
      catalogs: [],
      behaviorHints: {
        configurable: true,
        configurationRequired: false
      }
    };
  };

  const distPublic = path.join(__dirname, 'web', 'public');
  const srcPublic = path.join(__dirname, '..', 'src', 'web', 'public');
  const publicDir = fs.existsSync(distPublic) ? distPublic : srcPublic;
  app.use(express.static(publicDir));

  const healthHandler = (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      addon: 'AIOSubtitles',
      version: '1.0.0',
      uptime: process.uptime(),
      cacheSize: globalSubtitleCache.size,
      nodeVersion: process.version
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  app.use('/:config', (req: Request, res: Response, next: NextFunction) => {
    if (['manifest.json', 'subtitles', 'api', 'sub', 'proxy', 'download', 'health', 'assets'].includes(req.params.config)) {
      return next();
    }
    return express.static(publicDir, { index: false })(req, res, next);
  });

  app.get('/api/languages', (_req: Request, res: Response) => {
    res.json({ languages: SUPPORTED_LANGUAGES });
  });

  app.get('/api/providers', (_req: Request, res: Response) => {
    const list = getAllProviders().map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      requiresApiKey: p.requiresApiKey,
      defaultEnabled: p.defaultEnabled
    }));
    res.json({ providers: list });
  });

  app.get('/api/alignment/status', async (_req: Request, res: Response): Promise<void> => {
    try {
      const status = await detectAvailableTools();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to detect alignment tools', message: err?.message || String(err) });
    }
  });

  app.post('/api/manifest/validate', async (req: Request, res: Response): Promise<void> => {
    let inputUrl = (req.body?.url as string) || '';
    if (!inputUrl || inputUrl.trim() === '') {
      res.status(400).json({ valid: false, error: 'URL do manifest não pode estar vazia.' });
      return;
    }

    inputUrl = inputUrl.trim();
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      inputUrl = `https://${inputUrl}`;
    }

    if (!inputUrl.toLowerCase().endsWith('/manifest.json')) {
      inputUrl = inputUrl.replace(/\/+$/, '') + '/manifest.json';
    }

    try {
      const response = await axios.get(inputUrl, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIOSubtitles/1.0.0',
          'Accept': 'application/json'
        }
      });

      if (response.status !== 200 || !response.data || typeof response.data !== 'object') {
        res.status(400).json({
          valid: false,
          error: `Resposta inválida do manifest (HTTP ${response.status}). Verifique se a URL está acessível.`
        });
        return;
      }

      const manifest = response.data;
      const declaredResources = Array.isArray(manifest.resources)
        ? manifest.resources.map((r: any) => typeof r === 'string' ? r : r.name)
        : [];

      const providesSubtitles = declaredResources.includes('subtitles');

      if (!providesSubtitles) {
        res.status(400).json({
          valid: false,
          error: `O addon "${manifest.name || manifest.id || 'desconhecido'}" não declara o recurso "subtitles" em seu manifest. Recursos declarados: [${declaredResources.join(', ')}]`
        });
        return;
      }

      const addonName = manifest.name || manifest.id || 'Custom Subtitle Addon';
      const isConfigurable = Boolean(manifest.behaviorHints?.configurable || manifest.configurationURL);
      const configurationURL = manifest.configurationURL || (manifest.behaviorHints?.configurable ? inputUrl.replace(/\/manifest\.json$/i, '/configure') : '');

      res.json({
        valid: true,
        id: manifest.id || `custom-${Math.random().toString(36).substring(2, 9)}`,
        name: addonName,
        description: manifest.description || '',
        logo: manifest.logo || '',
        manifestUrl: inputUrl,
        resources: declaredResources,
        configurable: isConfigurable,
        configurationURL
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({
        valid: false,
        error: `Não foi possível acessar o manifest em "${inputUrl}": ${msg}`
      });
    }
  });

  app.get('/api/qrcode', async (req: Request, res: Response): Promise<void> => {
    const text = String(req.query.text || '').trim();
    if (!text) {
      res.status(400).json({ error: 'Texto não fornecido para geração do QR Code.' });
      return;
    }
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 220,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      res.json({ dataUrl });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Erro ao gerar QR Code: ${msg}` });
    }
  });

  const handleValidateKey = async (req: Request, res: Response): Promise<void> => {
    const service = (req.params.service || '').toLowerCase();
    const apiKey = ((req.body?.apiKey || req.query?.apiKey || '') as string).trim();

    if (!apiKey) {
      res.json({ valid: false, error: 'Chave não informada.' });
      return;
    }

    if (service === 'opensubtitles') {
      try {
        if (!apiKey || apiKey.length < 16) {
          res.json({ valid: false, error: 'Chave do OpenSubtitles inválida ou incompleta.' });
          return;
        }

        const response = await axios.get('https://api.opensubtitles.com/api/v1/subtitles', {
          params: {
            imdb_id: '0133093',
            _t: Date.now()
          },
          headers: {
            'Api-Key': apiKey,
            'User-Agent': 'AIOSubs v1.0.0',
            'Content-Type': 'application/json'
          },
          timeout: 6000
        });

        if (response.status === 200) {
          res.json({ valid: true });
          return;
        }

        res.json({ valid: false, error: 'Resposta inesperada do OpenSubtitles' });
      } catch (err: any) {
        console.error('OpenSubtitles validation error:', err.response?.status, err.response?.data || err.message);
        const errMsg = err.response?.status === 403 || err.response?.status === 401
          ? 'Chave não autorizada ou inexistente no OpenSubtitles. Verifique se ativou "Under development" no OpenSubtitles.com.'
          : 'Falha na comunicação com o OpenSubtitles.';
        res.json({ valid: false, error: errMsg });
      }
      return;
    }

    if (service === 'subdl') {
      try {
        const response = await axios.get('https://api.subdl.com/api/v1/subtitles', {
          params: {
            api_key: apiKey,
            imdb_id: 'tt0111161'
          },
          timeout: 6000
        });
        if (response.status === 200 && response.data?.status !== false) {
          res.json({ valid: true });
          return;
        }
        res.json({ valid: false, error: response.data?.error || 'Chave inválida no SubDL' });
      } catch {
        res.json({ valid: false, error: 'Chave inválida ou erro na conexão com SubDL' });
      }
      return;
    }

    if (service === 'subsource') {
      try {
        if (apiKey.length < 6) {
          res.json({ valid: false, error: 'Chave de API inválida' });
          return;
        }
        const response = await axios.get('https://api.subsource.net/api/v1/subtitles/search?imdb=tt0111161', {
          headers: {
            'X-API-Key': apiKey,
            'Referer': 'https://subsource.net/'
          },
          timeout: 6000
        });
        if (response.status === 200) {
          res.json({ valid: true });
          return;
        }
        res.json({ valid: false, error: 'Chave inválida no Subsource' });
      } catch {
        if (apiKey.length >= 8) {
          res.json({ valid: true });
          return;
        }
        res.json({ valid: false, error: 'Chave inválida' });
      }
      return;
    }

    res.status(400).json({ valid: false, error: 'Serviço desconhecido' });
  };

  app.post('/api/validate-key/:service', handleValidateKey);
  app.get('/api/validate-key/:service', handleValidateKey);

  const handleConfigSave = async (req: Request, res: Response): Promise<void> => {
    const rawUuid = req.params?.uuid || req.body?.uuid || '';
    const uuid = String(rawUuid).trim();
    const password = String(req.body?.password || '').trim();
    const config = req.body?.config;

    console.log(`[HTTP] Recebida requisição de gravação para UUID: ${uuid || '(não informado)'}`);

    if (!uuid || !isUuid(uuid)) {
      res.status(400).json({ success: false, error: 'UUID inválido.' });
      return;
    }

    if (!password) {
      res.status(400).json({ success: false, error: 'A senha é obrigatória para salvar a configuração.' });
      return;
    }

    if (!config || typeof config !== 'object') {
      res.status(400).json({ success: false, error: 'Configuração inválida.' });
      return;
    }

    const mergedConfig = mergeWithDefaults(config);
    const saveResult = await configStorage.saveConfigAsync(uuid, password, mergedConfig);
    if (!saveResult.success) {
      const isDbError = saveResult.error?.includes('Database write failed');
      const statusCode = isDbError ? 500 : 401;
      res.status(statusCode).json({ success: false, error: saveResult.error || 'Não foi possível salvar a configuração.' });
      return;
    }

    const baseUrl = getBaseUrl(req);
    const manifestUrl = `${baseUrl}/${uuid}/manifest.json`;
    const cleanHost = manifestUrl.replace(/^https?:\/\//i, '');
    const stremioUrl = `stremio://${cleanHost}`;
    const stremioWebUrl = `https://web.stremio.com/#/addons?addon=${encodeURIComponent(manifestUrl)}`;

    res.status(200).json({
      success: true,
      uuid,
      manifestUrl,
      stremioUrl,
      stremioWebUrl
    });
  };

  app.post('/api/config/save', handleConfigSave);
  app.post('/api/config/create', handleConfigSave);
  app.post('/api/save', handleConfigSave);
  app.post('/api/create', handleConfigSave);
  app.post('/save', handleConfigSave);
  app.post('/create', handleConfigSave);
  app.put('/api/config/:uuid', handleConfigSave);
  app.put('/api/save/:uuid', handleConfigSave);
  app.put('/api/config', handleConfigSave);

  const handleConfigLoad = async (req: Request, res: Response): Promise<void> => {
    const rawUuid = req.params?.uuid || req.body?.uuid || '';
    const uuid = String(rawUuid).trim();
    const password = String(req.body?.password || '').trim();

    if (!uuid || !isUuid(uuid) || !password) {
      res.status(401).json({ success: false, error: 'UUID ou senha inválidos.' });
      return;
    }

    const authResult = await configStorage.authenticateAndGetConfigAsync(uuid, password);
    if (!authResult.success || !authResult.config) {
      res.status(401).json({ success: false, error: 'UUID ou senha inválidos.' });
      return;
    }

    res.status(200).json({
      success: true,
      uuid,
      config: authResult.config
    });
  };

  app.post('/api/config/load', handleConfigLoad);
  app.post('/api/config/login', handleConfigLoad);
  app.post('/api/load', handleConfigLoad);
  app.post('/api/login', handleConfigLoad);
  app.post('/login', handleConfigLoad);
  app.post('/load', handleConfigLoad);

  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  app.get('/configure', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  app.get('/dashboard', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  app.get('/:config/configure', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  app.get('/manifest.json', async (_req: Request, res: Response) => {
    res.json(await buildManifest());
  });

  app.get('/:config/manifest.json', async (req: Request, res: Response) => {
    res.json(await buildManifest(req.params.config));
  });

  const handleSubtitles = async (req: Request, res: Response): Promise<void> => {
    try {
      const configParam = req.params.config;
      const userConfig = await decodeUserConfigAsync(configParam);
      const { type, id } = req.params;
      const baseUrl = getBaseUrl(req);

      const query = parseSubtitleQuery(type, id, req.query as Record<string, string>);
      const response = await getAggregatedSubtitles(query, userConfig, baseUrl);

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.json(response);
    } catch (err: unknown) {
      Logger.error('Failed to handle subtitles request', err);
      res.json({ subtitles: [] });
    }
  };

  app.get('/:config/subtitles/:type/:id.json', handleSubtitles);
  app.get('/:config/subtitles/:type/:id/:extra.json', handleSubtitles);
  app.get('/subtitles/:type/:id.json', handleSubtitles);
  app.get('/subtitles/:type/:id/:extra.json', handleSubtitles);

  // Intermediate auto-sync subtitle alignment endpoint
  app.get('/sub/aligned', async (req: Request, res: Response): Promise<void> => {
    const videoUrl = String(req.query.videoUrl || '').trim();
    const subUrl = String(req.query.subUrl || '').trim();
    const uuid = String(req.query.uuid || '').trim();

    if (!videoUrl || !subUrl) {
      res.status(400).json({ error: 'Missing required query parameters: videoUrl and subUrl' });
      return;
    }

    let sampleDurationMinutes = req.query.sampleDuration ? Number(req.query.sampleDuration) : undefined;
    let timeoutSeconds = req.query.timeout ? Number(req.query.timeout) : undefined;
    let preferredTool = (req.query.tool as 'alass' | 'ffsubsync' | 'auto') || undefined;

    if (uuid) {
      try {
        const userCfg = await decodeUserConfigAsync(uuid);
        if (userCfg?.autoAlignment) {
          if (sampleDurationMinutes === undefined && userCfg.autoAlignment.sampleDurationMinutes) {
            sampleDurationMinutes = userCfg.autoAlignment.sampleDurationMinutes;
          }
          if (timeoutSeconds === undefined && userCfg.autoAlignment.timeoutSeconds) {
            timeoutSeconds = userCfg.autoAlignment.timeoutSeconds;
          }
          if (!preferredTool && userCfg.autoAlignment.tool) {
            preferredTool = userCfg.autoAlignment.tool;
          }
        }
      } catch {
        // Fall back to defaults
      }
    }

    try {
      const result = await alignSubtitle({
        videoUrl,
        subUrl,
        sampleDurationMinutes,
        timeoutSeconds,
        tool: preferredTool,
        uuid
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Alignment-Status', result.fromCache ? 'cached' : (result.isOriginalFallback ? 'fallback' : 'aligned'));
      res.setHeader('X-Alignment-Cache', result.fromCache ? 'HIT' : 'MISS');
      res.setHeader('X-Alignment-Time-Ms', String(result.metrics.totalDurationMs));
      if (result.metrics.toolUsed) {
        res.setHeader('X-Alignment-Tool', result.metrics.toolUsed);
      }
      if (result.metrics.fallbackReason) {
        res.setHeader('X-Alignment-Fallback-Reason', result.metrics.fallbackReason);
      }
      res.setHeader('X-Alignment-RAM-Before-Mb', String(result.metrics.initialMemoryMb));
      res.setHeader('X-Alignment-RAM-Peak-Mb', String(result.metrics.peakMemoryMb));

      res.status(200).send(result.srtContent);
    } catch (err: any) {
      Logger.error('[Alignment Endpoint] Fatal error:', err);
      res.status(502).json({
        error: 'Subtitle alignment failed and could not retrieve fallback subtitle',
        details: err?.message || String(err)
      });
    }
  });

  // Unified and legacy subtitle proxy delivery endpoints
  app.get('/sub/proxy', handleUnifiedSubtitleProxy);
  app.get('/sub/proxy/:data', handleSubtitleProxy);
  app.get('/sub/download', handleUnifiedSubtitleProxy);
  app.get('/proxy/download', handleUnifiedSubtitleProxy);
  app.get('/proxy/download/subdl', handleUnifiedSubtitleProxy);
  app.get('/proxy/download/subsource', handleUnifiedSubtitleProxy);
  app.get('/proxy/subtitle/:data', handleSubtitleProxy);
  app.get('/proxy/download/os-rest/:fileId', handleOpenSubtitlesRestDownload);

  // Direct subtitle download endpoints
  app.get('/download/:id', handleShortIdDownload);
  app.get('/download/:id/:filename', handleShortIdDownload);
  app.get('/sub/:id', handleShortIdDownload);
  app.get('/sub/:id/:filename', handleShortIdDownload);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    Logger.error('Unhandled server exception', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
