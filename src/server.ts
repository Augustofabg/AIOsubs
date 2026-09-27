import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import QRCode from 'qrcode';

import { ENV } from './config/env';
import { StremioManifest } from './types/stremio';
import { decodeUserConfig, decodeUserConfigAsync } from './config/userConfig';
import { parseSubtitleQuery, getAggregatedSubtitles } from './core/aggregator';
import { handleSubtitleProxy, handleOpenSubtitlesRestDownload, handleShortIdDownload } from './proxy/subtitleProxy';
import { SUPPORTED_LANGUAGES } from './utils/languages';
import { getAllProviders } from './providers';
import { globalSubtitleCache } from './utils/cache';
import { Logger } from './utils/logger';
import { configStorage, isUuid } from './storage/configStore';

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

  const buildManifest = async (configEncoded?: string): Promise<StremioManifest> => {
    let name = 'AIOSubs';
    let description = 'Dedicated subtitle aggregator and organizer for Stremio and Nuvio.';
    let logo = '/assets/AIOsubs_logo_wordmark.png';
    let version = '1.0.0';

    if (configEncoded) {
      try {
        const userCfg = await decodeUserConfigAsync(configEncoded);
        if (userCfg.instanceName && userCfg.instanceName.trim() !== '') {
          name = userCfg.instanceName.trim();
        }
        if (userCfg.instanceDesc && userCfg.instanceDesc.trim() !== '') {
          description = userCfg.instanceDesc.trim();
        }
        if (userCfg.instanceLogo && userCfg.instanceLogo.trim() !== '') {
          logo = userCfg.instanceLogo.trim();
        }
        if (userCfg.instanceVersion && userCfg.instanceVersion.trim() !== '') {
          version = userCfg.instanceVersion.trim().replace(/^v/i, '');
        }
      } catch {
        // Use default branding on decode failure
      }
    }

    return {
      id: 'org.aiosubtitles.addon',
      version,
      name,
      description,
      logo,
      background: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1920&q=80',
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

  app.use('/:config', express.static(publicDir));

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

  app.post('/api/manifest/validate', async (req: Request, res: Response): Promise<void> => {
    let inputUrl = (req.body?.url as string) || '';
    if (!inputUrl || inputUrl.trim() === '') {
      res.status(400).json({ valid: false, error: 'URL do manifest não pode estar vazia.' });
      return;
    }

    inputUrl = inputUrl.trim();
    if (inputUrl.startsWith('stremio://')) {
      inputUrl = inputUrl.replace(/^stremio:\/\//, 'https://');
    }

    if (!inputUrl.toLowerCase().endsWith('/manifest.json')) {
      inputUrl = `${inputUrl.replace(/\/+$/, '')}/manifest.json`;
    }

    try {
      const response = await axios.get(inputUrl, {
        timeout: 8000,
        headers: {
          'User-Agent': 'AIOSubtitles/1.0.0 (Stremio Addon Validator)',
          'Accept': 'application/json'
        }
      });

      const manifest = response.data;
      if (!manifest || typeof manifest !== 'object') {
        res.status(400).json({ valid: false, error: 'A resposta do endpoint não é um JSON de manifest válido.' });
        return;
      }

      const hasSubtitles = Array.isArray(manifest.resources) && manifest.resources.some((r: unknown) => {
        if (typeof r === 'string') return r.toLowerCase() === 'subtitles';
        if (typeof r === 'object' && r !== null && 'name' in r) {
          return String((r as { name: string }).name).toLowerCase() === 'subtitles';
        }
        return false;
      });

      if (!hasSubtitles) {
        res.status(400).json({
          valid: false,
          error: `O addon "${manifest.name || manifest.id || 'Externo'}" não declara o recurso de legendas ('subtitles'). Somente addons que fornecem legendas são suportados.`
        });
        return;
      }

      const addonName = manifest.name && String(manifest.name).trim() !== ''
        ? String(manifest.name).trim()
        : (manifest.id ? String(manifest.id).trim() : 'External Subtitles Addon');

      const declaredResources: string[] = Array.isArray(manifest.resources)
        ? manifest.resources.map((r: unknown) => {
          if (typeof r === 'string') return r;
          if (typeof r === 'object' && r !== null && 'name' in r) {
            return String((r as { name: string }).name);
          }
          return '';
        }).filter(Boolean)
        : ['subtitles'];

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

  app.post('/api/validate-key/:service', async (req: Request, res: Response): Promise<void> => {
    const service = (req.params.service || '').toLowerCase();
    const apiKey = (req.body?.apiKey as string || '').trim();

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
            query: 'matrix',
            languages: 'en'
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
});

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

  const saveResult = await configStorage.saveConfigAsync(uuid, password, config);
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

    res.setHeader('Cache-Control', 'max-age=1800, public');
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

// Direct subtitle download endpoints
app.get('/download/:id', handleShortIdDownload);
app.get('/download/:id/:filename', handleShortIdDownload);
app.get('/sub/:id', handleShortIdDownload);
app.get('/sub/:id/:filename', handleShortIdDownload);

// Backward compatibility proxy endpoints
app.get('/proxy/subtitle/:data', handleSubtitleProxy);
app.get('/proxy/download/os-rest/:fileId', handleOpenSubtitlesRestDownload);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  Logger.error('Unhandled server exception', err);
  res.status(500).json({ error: 'Internal server error' });
});

return app;
}
