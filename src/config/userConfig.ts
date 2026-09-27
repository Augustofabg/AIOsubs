import { UserConfig, PartialUserConfig, CustomAddonConfig } from '../types/config';
import { isUuid, configStorage } from '../storage/configStore';

export const DEFAULT_USER_CONFIG: UserConfig = {
  instanceName: 'AIOSubs',
  instanceDesc: 'Subtitle aggregator and organizer',
  instanceLogo: '/assets/AIOsubs_logo_wordmark.png',
  instanceVersion: 'v1.0.0',
  providers: {
    'opensubtitles': { enabled: false, apiKey: '' },
    'subdl': { enabled: false, apiKey: '' },
    'subsource': { enabled: false, apiKey: '' }
  },
  customAddons: [],
  addonFetchingStrategy: 'default',
  providerPriority: [
    'opensubtitles',
    'subdl',
    'subsource'
  ],
  languages: ['pob', 'por', 'eng'],
  allowUnknownLanguages: false,
  languageRemap: {
    'por': 'pob',
    'pt-br': 'pob',
    'pt': 'pob',
    'pt-pt': 'pob'
  },
  language_remapping: {
    'por': 'pob',
    'pt-br': 'pob',
    'pt': 'pob',
    'pt-pt': 'pob'
  },
  providerTimeoutMs: 6000,
  deduplication: true,
  deduplicationStrategy: 'both',
  cacheTtlMinutes: 30
};

export function encodeUserConfig(config: UserConfig): string {
  const json = JSON.stringify(config);
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeUserConfig(encodedStr?: string | null): UserConfig {
  if (!encodedStr || encodedStr.trim() === '' || encodedStr === 'default') {
    return { ...DEFAULT_USER_CONFIG };
  }

  if (isUuid(encodedStr)) {
    const stored = configStorage.getConfigByUuid(encodedStr);
    if (stored) {
      return mergeWithDefaults(stored);
    }
  }

  try {
    let jsonStr = '';
    let base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    try {
      jsonStr = Buffer.from(base64, 'base64').toString('utf8');
      JSON.parse(jsonStr);
    } catch {
      try {
        jsonStr = decodeURIComponent(encodedStr);
        JSON.parse(jsonStr);
      } catch {
        jsonStr = encodedStr;
      }
    }

    const parsed: PartialUserConfig = JSON.parse(jsonStr);
    return mergeWithDefaults(parsed);
  } catch {
    return { ...DEFAULT_USER_CONFIG };
  }
}

export async function decodeUserConfigAsync(encodedStr?: string | null): Promise<UserConfig> {
  if (!encodedStr || encodedStr.trim() === '' || encodedStr === 'default') {
    return { ...DEFAULT_USER_CONFIG };
  }

  if (isUuid(encodedStr)) {
    const stored = await configStorage.getConfigByUuidAsync(encodedStr);
    if (stored) {
      return mergeWithDefaults(stored);
    }
  }

  return decodeUserConfig(encodedStr);
}

export function mergeWithDefaults(partial: PartialUserConfig): UserConfig {
  const customAddons: CustomAddonConfig[] = Array.isArray(partial.customAddons)
    ? partial.customAddons
        .filter((a): a is CustomAddonConfig => Boolean(a && typeof a === 'object' && typeof a.manifestUrl === 'string'))
        .map(item => {
          let timeoutVal = 20000;
          if (typeof item.timeout === 'number' && !isNaN(item.timeout)) {
            timeoutVal = Math.max(1000, Math.min(60000, Math.round(item.timeout)));
          } else if (typeof item.timeout === 'string' && !isNaN(parseInt(item.timeout, 10))) {
            timeoutVal = Math.max(1000, Math.min(60000, parseInt(item.timeout, 10)));
          }

          return {
            id: (item.id && String(item.id).trim()) || `addon-${Math.random().toString(36).substring(2, 8)}`,
            name: (item.name && String(item.name).trim()) || 'External Addon',
            manifestUrl: String(item.manifestUrl).trim(),
            enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
            logo: typeof item.logo === 'string' ? item.logo.trim() : undefined,
            description: typeof item.description === 'string' ? item.description.trim() : undefined,
            resources: Array.isArray(item.resources) ? item.resources : undefined,
            selectedResources: Array.isArray(item.selectedResources) ? item.selectedResources : undefined,
            configurable: typeof item.configurable === 'boolean' ? item.configurable : undefined,
            configurationURL: typeof item.configurationURL === 'string' ? item.configurationURL : undefined,
            timeout: timeoutVal
          };
        })
    : [];

  // Migration for legacy provider ids: map opensubtitles-rest / opensubtitles-v3 -> opensubtitles, drop deprecated addic7ed
  let rawPriority: string[] = [];
  if (Array.isArray(partial.providerPriority) && partial.providerPriority.length > 0) {
    for (const item of partial.providerPriority) {
      let mapped = item;
      if (item === 'opensubtitles-rest' || item === 'opensubtitles-v3') {
        mapped = 'opensubtitles';
      }
      if (mapped === 'addic7ed') {
        continue;
      }
      if (!rawPriority.includes(mapped)) {
        rawPriority.push(mapped);
      }
    }
  }
  if (rawPriority.length === 0) {
    rawPriority = [...DEFAULT_USER_CONFIG.providerPriority];
  }

  const result: UserConfig = {
    instanceName: typeof partial.instanceName === 'string' && partial.instanceName.trim() !== ''
      ? partial.instanceName.trim()
      : DEFAULT_USER_CONFIG.instanceName,
    instanceDesc: typeof partial.instanceDesc === 'string' && partial.instanceDesc.trim() !== ''
      ? partial.instanceDesc.trim()
      : DEFAULT_USER_CONFIG.instanceDesc,
    instanceLogo: typeof partial.instanceLogo === 'string' && partial.instanceLogo.trim() !== ''
      ? partial.instanceLogo.trim()
      : DEFAULT_USER_CONFIG.instanceLogo,
    instanceVersion: typeof partial.instanceVersion === 'string' && partial.instanceVersion.trim() !== ''
      ? partial.instanceVersion.trim()
      : DEFAULT_USER_CONFIG.instanceVersion,
    providers: {
      'opensubtitles': { enabled: false, apiKey: '' },
      'subdl': { enabled: false, apiKey: '' },
      'subsource': { enabled: false, apiKey: '' }
    },
    customAddons,
    addonFetchingStrategy: partial.addonFetchingStrategy === 'fastest' ? 'fastest' : 'default',
    providerPriority: rawPriority,
    languages: Array.isArray(partial.languages) && partial.languages.length > 0
      ? partial.languages.map(l => l.trim().toLowerCase())
      : [...DEFAULT_USER_CONFIG.languages],
    allowUnknownLanguages: typeof partial.allowUnknownLanguages === 'boolean'
      ? partial.allowUnknownLanguages
      : DEFAULT_USER_CONFIG.allowUnknownLanguages,
    ...(() => {
      const rawRemap = (partial.language_remapping && typeof partial.language_remapping === 'object')
        ? partial.language_remapping
        : ((partial.languageRemap && typeof partial.languageRemap === 'object')
          ? partial.languageRemap
          : DEFAULT_USER_CONFIG.languageRemap);

      const cleanRemap: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawRemap)) {
        if (typeof k === 'string' && typeof v === 'string' && k.trim() && v.trim()) {
          cleanRemap[k.trim().toLowerCase()] = v.trim().toLowerCase();
        }
      }
      return {
        languageRemap: cleanRemap,
        language_remapping: cleanRemap
      };
    })(),
    providerTimeoutMs: typeof partial.providerTimeoutMs === 'number'
      ? Math.max(2000, Math.min(15000, partial.providerTimeoutMs))
      : DEFAULT_USER_CONFIG.providerTimeoutMs,
    deduplication: typeof partial.deduplication === 'boolean'
      ? partial.deduplication
      : DEFAULT_USER_CONFIG.deduplication,
    deduplicationStrategy: (partial.deduplicationStrategy === 'hash' || partial.deduplicationStrategy === 'fuzzy')
      ? partial.deduplicationStrategy
      : 'both',
    cacheTtlMinutes: typeof partial.cacheTtlMinutes === 'number'
      ? Math.max(1, Math.min(1440, partial.cacheTtlMinutes))
      : DEFAULT_USER_CONFIG.cacheTtlMinutes
  };

  if (partial.providers && typeof partial.providers === 'object') {
    for (const [key, val] of Object.entries(partial.providers)) {
      if (!val || typeof val !== 'object') continue;

      let targetKey = key;
      if (key === 'opensubtitles-rest' || key === 'opensubtitles-v3') {
        targetKey = 'opensubtitles';
      } else if (key === 'addic7ed') {
        continue;
      }

      if (result.providers[targetKey]) {
        const apiKey = typeof val.apiKey === 'string' ? val.apiKey.trim() : (result.providers[targetKey]?.apiKey || '');
        const hasApiKey = Boolean(apiKey && apiKey.trim() !== '');
        const enabled = hasApiKey ? (typeof val.enabled === 'boolean' ? val.enabled : false) : false;

        result.providers[targetKey] = {
          enabled,
          apiKey,
          username: typeof val.username === 'string' ? val.username.trim() : undefined,
          password: typeof val.password === 'string' ? val.password : undefined,
          customEndpoint: typeof val.customEndpoint === 'string' ? val.customEndpoint.trim() : undefined
        };
      }
    }
  }

  return result;
}
