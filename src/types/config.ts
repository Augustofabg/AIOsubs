export interface ProviderConfigItem {
  enabled: boolean;
  apiKey?: string;
  username?: string;
  password?: string;
  customEndpoint?: string;
}

export interface CustomAddonConfig {
  id: string;
  name: string;
  manifestUrl: string;
  enabled: boolean;
  logo?: string;
  description?: string;
  timeout?: number;
  resources?: string[];
  selectedResources?: string[];
  configurable?: boolean;
  configurationURL?: string;
}

export interface FormatterConfig {
  preset: 'clean' | 'detailed' | 'custom';
  nameTemplate: string;
  descriptionTemplate: string;
}

export interface AutoAlignmentConfig {
  enabled: boolean;
  sampleDurationMinutes: number;
  timeoutSeconds: number;
  tool?: 'alass' | 'ffsubsync' | 'auto';
}

export interface UserConfig {
  instanceName?: string;
  instanceDesc?: string;
  instanceLogo?: string;
  instanceVersion?: string;

  providers: Record<string, ProviderConfigItem>;
  customAddons: CustomAddonConfig[];
  addonFetchingStrategy?: 'default' | 'fastest';

  providerPriority: string[];
  languages: string[];
  allowUnknownLanguages: boolean;
  languageRemap: Record<string, string>;
  language_remapping?: Record<string, string>;
  providerTimeoutMs: number;
  deduplication: boolean;
  deduplicationStrategy?: 'both' | 'hash' | 'fuzzy';

  cacheTtlMinutes: number;
  formatter?: FormatterConfig;
  autoAlignment?: AutoAlignmentConfig;
}

export type PartialUserConfig = Partial<Omit<UserConfig, 'providers' | 'languageRemap' | 'language_remapping'>> & {
  providers?: Record<string, Partial<ProviderConfigItem>>;
  languageRemap?: Record<string, string>;
  language_remapping?: Record<string, string>;
};
