import { getAllProviders } from '../src/providers';
import { GenericStremioAddonProvider } from '../src/providers/genericStremioAddon';
import { validateAndNormalizeLanguage } from '../src/utils/normalizer';
import { RawSubtitleItem } from '../src/types/provider';
import { getAggregatedSubtitles } from '../src/core/aggregator';
import { DEFAULT_USER_CONFIG, mergeWithDefaults, decodeUserConfig } from '../src/config/userConfig';
import { UserConfig } from '../src/types/config';
import { globalSubtitleCache } from '../src/utils/cache';
import { configStorage, isUuid } from '../src/storage/configStore';

console.log('🧪 Iniciando suíte de testes de validação do AIO Subtitles...\n');

// 1. Validate exactly 3 registered built-in providers: OpenSubtitles, SubDL, Subsource
console.log('--- Teste 1: Validação de Provedores Nativos Definitivos ---');
const providers = getAllProviders();
const expectedIds = ['opensubtitles', 'subdl', 'subsource'];

if (providers.length !== 3) {
  console.error(`❌ Esperava exatamente 3 provedores nativos, encontrou ${providers.length}!`);
  process.exit(1);
}

for (const p of providers) {
  if (!expectedIds.includes(p.id)) {
    console.error(`❌ Provedor não autorizado encontrado: [${p.id}] -> "${p.name}"`);
    process.exit(1);
  }
  if (!p.name || p.name.trim() === '' || p.name.toLowerCase() === 'desconhecido') {
    console.error(`❌ Provedor ${p.id} tem name inválido ou "Desconhecido": "${p.name}"`);
    process.exit(1);
  }
  if (p.requiresApiKey !== true) {
    console.error(`❌ Provedor ${p.id} deve ter requiresApiKey === true!`);
    process.exit(1);
  }
  console.log(`  ✅ Provedor nativo verificado: [${p.id}] -> "${p.name}" (requiresApiKey: true)`);
}

// 2. Validate GenericStremioAddonProvider with custom imported manifests
console.log('\n--- Teste 2: Provedores Genéricos Importados por Manifest URL ---');
const testCustomAddons = [
  { id: 'community-subtitles', name: 'Legendas Brasil VIP', url: 'https://subs.example.com/manifest.json' },
  { id: 'titlovi-stremio', name: 'Titlovi Official', url: 'stremio://titlovi.com/manifest.json' },
  { id: 'auto-fallback-test', name: '', url: 'https://fallback.example.com/manifest.json' }
];

for (const custom of testCustomAddons) {
  const genericProv = new GenericStremioAddonProvider(custom.id, custom.name, custom.url);

  if (!genericProv.id) {
    console.error(`❌ GenericStremioAddonProvider gerou ID vazio!`);
    process.exit(1);
  }

  if (!genericProv.name || genericProv.name.trim() === '' || genericProv.name.toLowerCase() === 'desconhecido') {
    console.error(`❌ GenericStremioAddonProvider gerou name inválido ou "Desconhecido": "${genericProv.name}"`);
    process.exit(1);
  }

  console.log(`  ✅ Provedor genérico importado verificado: [${genericProv.id}] -> "${genericProv.name}"`);
}

// 3. Test Provider ID & Subtitle Item Integrity
console.log('\n--- Teste 3: Integridade de Provedores e Itens de Legenda ---');
const mockItems: RawSubtitleItem[] = [
  {
    id: 'test-1',
    provider: 'opensubtitles',
    providerName: 'OpenSubtitles',
    url: 'https://api.opensubtitles.com/download/sub1.srt',
    lang: 'pob',
    release: '1080p.BluRay-SPARKS'
  },
  {
    id: 'test-2',
    provider: 'custom-sub-addon',
    providerName: 'Custom Community Subs',
    url: 'https://example.com/sub2.srt',
    lang: 'eng',
    release: 'WEBRip-AMZN'
  }
];

for (const item of mockItems) {
  if (!item.provider || !item.url || !item.lang) {
    console.error(`❌ Item inválido:`, item);
    process.exit(1);
  }
  console.log(`  ✅ Item de legenda íntegro: [${item.provider}] lang=${item.lang} url=${item.url}`);
}

// 4. Test Language Normalization & Desconhecido category prevention
console.log('\n--- Teste 4: Normalização de Idiomas & Prevenção de Categoria "Desconhecido" ---');
const validLanguagesTest = ['pt-br', 'por', 'en', 'english', 'spa', 'pob', 'fre'];
for (const raw of validLanguagesTest) {
  const result = validateAndNormalizeLanguage(raw, false);
  if (!result.valid || !result.normalizedLang) {
    console.error(`❌ Falha: Idioma válido "${raw}" não foi reconhecido!`);
    process.exit(1);
  }
  console.log(`  ✅ Idioma "${raw}" normalizado para ISO 639-2: "${result.normalizedLang}"`);
}

// Invalid languages must be discarded when allowUnknown is false
const invalidLanguagesTest = ['xxx-broken', '', 'invalid_code_123', 'desconhecido', 'unknown'];
for (const raw of invalidLanguagesTest) {
  const result = validateAndNormalizeLanguage(raw, false);
  if (result.valid) {
    console.error(`❌ Falha crítica: Idioma inválido "${raw}" não foi descartado!`);
    process.exit(1);
  }
  console.log(`  ✅ Idioma inválido "${raw}" descartado com sucesso: motivo "${result.discardedReason}"`);
}

// When allowUnknown is true, must map to standard 'und' (undetermined)
const resultUnknown = validateAndNormalizeLanguage('xxx-broken', true);
if (!resultUnknown.valid || resultUnknown.normalizedLang !== 'und') {
  console.error(`❌ Falha: Idioma não identificado com allowUnknown não mapeou para 'und':`, resultUnknown);
  process.exit(1);
}
console.log(`  ✅ Idioma não identificado com allowUnknown=true mapeado para "und"`);

// 5. Integration Test: Pipeline returns direct original id, normalized lang, and direct url
console.log('\n--- Teste 5: Validação do Pipeline Direto (sem templates/proxies) ---');

async function runPipelineIntegrationTest(): Promise<void> {
  const mockRawExternalSubtitles: RawSubtitleItem[] = [
    {
      id: 'sub-ext-101',
      provider: 'external-addon',
      providerName: 'External Subs Addon',
      url: 'https://subs5.strem.io/en/download/file/1952160592.srt',
      lang: 'pt-BR', // BCP-47 requiring normalization to pob
      release: 'Breaking.Bad.S01E01.720p.HDTV.x264'
    }
  ];

  const testQuery = {
    type: 'series',
    id: 'tt0903747:1:1',
    imdbId: 'tt0903747',
    season: 1,
    episode: 1
  };

  const testUserConfig: UserConfig = {
    ...DEFAULT_USER_CONFIG,
    languages: ['pob', 'eng'], // Whitelist pob
    languageRemap: { 'pt-br': 'pob', 'por': 'pob' },
    allowUnknownLanguages: false,
    deduplication: true
  };

  // Seed the cache with raw subtitle to simulate connector execution
  const enabledIds = Object.keys(testUserConfig.providers).filter(
    id => testUserConfig.providers[id]?.enabled !== false
  );
  const testCacheKey = globalSubtitleCache.generateKey(
    testQuery.id,
    testUserConfig.languages,
    enabledIds,
    testQuery.season,
    testQuery.episode
  );
  globalSubtitleCache.set(testCacheKey, mockRawExternalSubtitles);

  // Execute pipeline
  const testBaseUrl = 'http://localhost:7000';
  const finalResponse = await getAggregatedSubtitles(testQuery, testUserConfig, testBaseUrl);

  if (!finalResponse.subtitles || finalResponse.subtitles.length !== 1) {
    console.error(`❌ Falha: Esperava 1 legenda na resposta final, recebeu ${finalResponse.subtitles?.length}`);
    process.exit(1);
  }

  const finalSub = finalResponse.subtitles[0];

  // (a) lang normalizado para pob
  if (finalSub.lang !== 'pob') {
    console.error(`❌ Falha no critério (a): lang esperado "pob", recebeu "${finalSub.lang}"`);
    process.exit(1);
  }
  console.log(`  ✅ (a) lang normalizado com sucesso para: "${finalSub.lang}"`);

  // (b) id original preservado diretamente
  if (finalSub.id !== 'sub-ext-101') {
    console.error(`❌ Falha no critério (b): id esperado "sub-ext-101", recebeu "${finalSub.id}"`);
    process.exit(1);
  }
  console.log(`  ✅ (b) id original preservado: "${finalSub.id}"`);

  // (c) url original preservada diretamente
  if (finalSub.url !== 'https://subs5.strem.io/en/download/file/1952160592.srt') {
    console.error(`❌ Falha no critério (c): url esperada original, recebeu "${finalSub.url}"`);
    process.exit(1);
  }
  console.log(`  ✅ (c) url original preservada diretamente: "${finalSub.url}"`);
}

async function runAllTests(): Promise<void> {
  await runPipelineIntegrationTest();

  // 6. Test Services Default State (enabled: false) and Rules
  console.log('\n--- Teste 6: Estado Inicial dos Serviços (Todos OFF) & Regras de API Key ---');
  for (const pId of ['opensubtitles', 'subdl', 'subsource']) {
    const pCfg = DEFAULT_USER_CONFIG.providers[pId];
    if (!pCfg || pCfg.enabled !== false) {
      console.error(`❌ Provedor ${pId} não começou desativado (enabled: false) no DEFAULT_USER_CONFIG!`);
      process.exit(1);
    }
    console.log(`  ✅ Provedor ${pId} inicia com enabled: false`);
  }

  // Test mergeWithDefaults enforces enabled: false if apiKey is empty
  const mergedNoKey = mergeWithDefaults({
    providers: {
      opensubtitles: { enabled: true, apiKey: '' },
      subdl: { enabled: true, apiKey: '   ' }
    }
  });
  if (mergedNoKey.providers.opensubtitles?.enabled !== false || mergedNoKey.providers.subdl?.enabled !== false) {
    console.error(`❌ Falha: mergeWithDefaults permitiu serviço ON sem API Key válida!`);
    process.exit(1);
  }
  console.log(`  ✅ mergeWithDefaults bloqueia ativação sem apiKey (força enabled: false)`);

  const mergedWithKey = mergeWithDefaults({
    providers: {
      opensubtitles: { enabled: true, apiKey: 'valid-test-key-123' }
    }
  });
  if (mergedWithKey.providers.opensubtitles?.enabled !== true) {
    console.error(`❌ Falha: mergeWithDefaults não ativou serviço com apiKey informada!`);
    process.exit(1);
  }
  console.log(`  ✅ mergeWithDefaults permite ativação quando apiKey é fornecida`);

  // 7. Test UUID & Bcrypt Password Storage
  console.log('\n--- Teste 7: Sistema de Persistência UUID + Senha (bcrypt) ---');
  const testUuid = '51c97db4-03b7-4ec2-875d-e3a755c564b9';
  const testPassword = 'SuperSecretPassword!@#123';

  if (!isUuid(testUuid)) {
    console.error(`❌ isUuid falhou ao reconhecer UUID válido: ${testUuid}`);
    process.exit(1);
  }

  // Save config
  const saveRes = configStorage.saveConfig(testUuid, testPassword, {
    ...DEFAULT_USER_CONFIG,
    instanceName: 'Test Instance With UUID'
  });

  if (!saveRes.success) {
    console.error(`❌ configStorage.saveConfig falhou:`, saveRes.error);
    process.exit(1);
  }
  console.log(`  ✅ Configuração salva com sucesso associada ao UUID ${testUuid}`);

  // Verify getConfigByUuid resolves stored config
  const retrievedByUuid = configStorage.getConfigByUuid(testUuid);
  if (!retrievedByUuid || retrievedByUuid.instanceName !== 'Test Instance With UUID') {
    console.error(`❌ configStorage.getConfigByUuid falhou ao carregar a configuração.`);
    process.exit(1);
  }
  console.log(`  ✅ configStorage.getConfigByUuid recuperou com sucesso a configuração`);

  // Verify decodeUserConfig(uuid) resolves stored config
  const decodedFromUuid = decodeUserConfig(testUuid);
  if (decodedFromUuid.instanceName !== 'Test Instance With UUID') {
    console.error(`❌ decodeUserConfig(uuid) não recuperou a configuração salva no store!`);
    process.exit(1);
  }
  console.log(`  ✅ decodeUserConfig(uuid) resolveu perfeitamente a configuração armazenada`);

  // Test correct password authentication
  const authSuccess = configStorage.authenticateAndGetConfig(testUuid, testPassword);
  if (!authSuccess.success || !authSuccess.config) {
    console.error(`❌ configStorage.authenticateAndGetConfig falhou com senha correta!`);
    process.exit(1);
  }
  console.log(`  ✅ Autenticação com senha correta funcionou com sucesso`);

  // Test incorrect password authentication
  const authFail = configStorage.authenticateAndGetConfig(testUuid, 'WrongPassword123');
  if (authFail.success || authFail.error !== 'UUID ou senha inválidos.') {
    console.error(`❌ configStorage.authenticateAndGetConfig não rejeitou senha incorreta com mensagem padrão!`, authFail);
    process.exit(1);
  }
  console.log(`  ✅ Autenticação com senha incorreta retornou erro seguro: "${authFail.error}"`);

  // 8. Test Language Remapping on Native Services (OpenSubtitles, SubDL) & Addons + Joint Deduplication
  console.log('\n--- Teste 8: Validação do Remapeamento Global de Idiomas em Services (OpenSubtitles, SubDL) e Addons + Deduplicação Conjunta ---');
  
  // 8.1 Consistency of provider language codes normalization & remapping
  const providerLanguagesTest = [
    { raw: 'pt-pt', expected: 'pob' },
    { raw: 'pt-br', expected: 'pob' },
    { raw: 'Portuguese (Brazil)', expected: 'pob' },
    { raw: 'Portuguese (Portugal)', expected: 'pob' },
    { raw: 'Portuguese (BR)', expected: 'pob' },
    { raw: 'Portuguese (PT)', expected: 'pob' },
    { raw: 'PT-BR', expected: 'pob' },
    { raw: 'PT-PT', expected: 'pob' },
    { raw: 'por', expected: 'pob' },
    { raw: 'pob', expected: 'pob' }
  ];

  const testRemapRules = { 'por': 'pob', 'pt-pt': 'pob', 'pt-br': 'pob' };

  for (const { raw, expected } of providerLanguagesTest) {
    const res = validateAndNormalizeLanguage(raw, false, testRemapRules);
    if (!res.valid || res.normalizedLang !== expected) {
      console.error(`❌ Falha no Teste 8.1: Idioma "${raw}" deveria ser remapeado para "${expected}", recebeu "${res.normalizedLang}"`);
      process.exit(1);
    }
  }
  console.log('  ✅ Todos os códigos de provedores (OpenSubtitles, SubDL, Addons) foram padronizados e remapeados para "pob" com sucesso');

  // 8.2 End-to-end pipeline test with multi-provider results and joint deduplication
  const multiProviderRawSubtitles: RawSubtitleItem[] = [
    {
      id: 'os-sub-1',
      provider: 'opensubtitles',
      providerName: 'OpenSubtitles',
      url: 'https://api.opensubtitles.com/download/sub1.srt',
      lang: 'pt-pt', // OpenSubtitles returns pt-pt
      release: 'Stranger.Things.S01E01.720p.WEBRip.x264'
    },
    {
      id: 'subdl-sub-2',
      provider: 'subdl',
      providerName: 'SubDL',
      url: 'https://dl.subdl.com/sub2.srt',
      lang: 'Portuguese (Portugal)', // SubDL returns Portuguese (Portugal)
      release: 'Stranger Things S01E01 720p WEBRip x264' // Duplicate release of os-sub-1
    },
    {
      id: 'subdl-sub-3',
      provider: 'subdl',
      providerName: 'SubDL',
      url: 'https://dl.subdl.com/sub3.srt',
      lang: 'Portuguese (BR)', // SubDL returns Portuguese (BR)
      release: 'Stranger Things S01E01 1080p NF WEBRip'
    },
    {
      id: 'addon-sub-4',
      provider: 'community-addon',
      providerName: 'Community Addon',
      url: 'https://example.com/sub4.srt',
      lang: 'por', // Addon returns por
      release: 'Stranger Things S01E01 480p HDTV'
    }
  ];

  const remapTestQuery = {
    type: 'series',
    id: 'tt4574334:1:1',
    imdbId: 'tt4574334',
    season: 1,
    episode: 1
  };

  const remapUserConfig: UserConfig = {
    ...DEFAULT_USER_CONFIG,
    providers: {
      'opensubtitles': { enabled: true, apiKey: 'test-os-key' },
      'subdl': { enabled: true, apiKey: 'test-subdl-key' },
      'subsource': { enabled: false, apiKey: '' }
    },
    languages: ['pob'], // Strict whitelist: pob only
    languageRemap: { 'por': 'pob', 'pt-pt': 'pob', 'pt-br': 'pob' },
    deduplication: true,
    providerPriority: ['opensubtitles', 'subdl', 'community-addon']
  };

  // Seed cache to simulate provider responses
  const enabledProviderIds = Object.keys(remapUserConfig.providers).filter(
    id => remapUserConfig.providers[id]?.enabled !== false
  );
  const remapCacheKey = globalSubtitleCache.generateKey(
    remapTestQuery.id,
    remapUserConfig.languages,
    enabledProviderIds,
    remapTestQuery.season,
    remapTestQuery.episode
  );
  globalSubtitleCache.set(remapCacheKey, multiProviderRawSubtitles);

  const remapResponse = await getAggregatedSubtitles(remapTestQuery, remapUserConfig, 'http://localhost:7000');

  // Verify all returned subtitles have lang === 'pob'
  for (const s of remapResponse.subtitles) {
    if (s.lang !== 'pob') {
      console.error(`❌ Falha no Teste 8.2: Subtitle id "${s.id}" vazou lang "${s.lang}" em vez de "pob"!`);
      process.exit(1);
    }
  }
  console.log(`  ✅ 100% das legendas finais (${remapResponse.subtitles.length} itens) possuem lang: "pob"`);

  // Verify deduplication merged the duplicate between OpenSubtitles and SubDL
  if (remapResponse.subtitles.length !== 3) {
    console.error(`❌ Falha no Teste 8.2: Deduplicação conjunta falhou. Esperava 3 legendas, recebeu ${remapResponse.subtitles.length}`);
    process.exit(1);
  }
  console.log('  ✅ Deduplicação conjunta funcionou perfeitamente entre OpenSubtitles e SubDL sob a mesma linguagem remapeada');

  // Verify higher priority provider was kept for the duplicated release (opensubtitles)
  const remainingIds = remapResponse.subtitles.map(s => s.id);
  if (!remainingIds.includes('os-sub-1') || remainingIds.includes('subdl-sub-2')) {
    console.error('❌ Falha no Teste 8.2: Prioridade de provedores na deduplicação conjunta falhou!', remainingIds);
    process.exit(1);
  }
  console.log('  ✅ Prioridade de provedores respeitada na deduplicação (OpenSubtitles prevaleceu sobre SubDL duplicado)');

  console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('❌ Erro inesperado no teste de integração:', err);
  process.exit(1);
});

