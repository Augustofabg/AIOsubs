/**
 * AIOSubtitles — Frontend Application SPA
 * Following AIOStreams Visual and Logical Standards
 */

const MDI_ICONS = {
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>',
  check16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>',
  plus16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>',
  close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>',
  close16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>',
  closeSm: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/></svg>',
  pencil: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg>',
  copySm: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg>',
  drag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z"/></svg>',
  arrowUp: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"/></svg>',
  arrowDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"/></svg>',
  arrowRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/></svg>',
  puzzle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5,11H19V7C19,5.89 18.1,5 17,5H13V3.5A2.5,2.5 0 0,0 10.5,1A2.5,2.5 0 0,0 8,3.5V5H4A2,2 0 0,0 2,7V10.8H3.5C5,10.8 6.2,12 6.2,13.5C6.2,15 5,16.2 3.5,16.2H2V20A2,2 0 0,0 4,22H7.8V20.5C7.8,19 9,17.8 10.5,17.8C12,17.8 13.2,19 13.2,20.5V22H17A2,2 0 0,0 19,20V16H20.5A2.5,2.5 0 0,0 23,13.5A2.5,2.5 0 0,0 20.5,11Z"/></svg>'
};

const DEFAULT_CONFIG = {
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
  cacheTtlMinutes: 30,
  formatter: {
    preset: 'clean',
    nameTemplate: '{sub.lang}',
    descriptionTemplate: ''
  },
  autoAlignment: {
    enabled: false,
    sampleDurationMinutes: 2,
    timeoutSeconds: 5,
    tool: 'auto'
  }
};

const SERVICES_META = {
  opensubtitles: {
    id: 'opensubtitles',
    name: 'OpenSubtitles',
    helpText: 'Don\'t have a key? <a href="https://www.opensubtitles.com/users/sign_up" target="_blank" rel="noopener noreferrer">Create a free account on OpenSubtitles.com</a> to get your key.'
  },
  subdl: {
    id: 'subdl',
    name: 'SubDL',
    helpText: 'Don\'t have a key? <a href="https://subdl.com" target="_blank" rel="noopener noreferrer">Create a free account on SubDL</a> to get your key.'
  },
  subsource: {
    id: 'subsource',
    name: 'Subsource',
    helpText: 'Don\'t have a key? <a href="https://subsource.net" target="_blank" rel="noopener noreferrer">Create a free account on Subsource</a> to get your key.'
  }
};

const FALLBACK_LANGUAGES = [
  { code: 'pob', name: 'Portuguese (Brazil)' },
  { code: 'por', name: 'Portuguese (Portugal)' },
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'zho', name: 'Chinese' },
  { code: 'rus', name: 'Russian' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' },
  { code: 'tur', name: 'Turkish' },
  { code: 'pol', name: 'Polish' },
  { code: 'nld', name: 'Dutch' },
  { code: 'swe', name: 'Swedish' },
  { code: 'nor', name: 'Norwegian' },
  { code: 'dan', name: 'Danish' },
  { code: 'fin', name: 'Finnish' },
  { code: 'ell', name: 'Greek' },
  { code: 'heb', name: 'Hebrew' }
];

const PAGES_ORDER = ['home', 'services', 'addons', 'filters', 'formatter', 'install'];

const state = {
  activeView: 'landing', // 'landing' | 'wizard'
  isConfigCreated: false,
  activePage: 'home',
  activeFilterTab: 'whitelist',
  uuid: '',
  password: '',
  config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
  lastSavedConfigJson: '',
  languagesList: FALLBACK_LANGUAGES,
  remapFromSelection: { code: '', name: '', flag: '' },
  remapToSelection: { code: '', name: '', flag: '' },
  validatedKeys: {}, // { [serviceId]: boolean }
  validationDebounceTimer: null
};

function showLandingView() {
  state.activeView = 'landing';
  const landing = document.getElementById('view-landing');
  const appLayout = document.getElementById('app-layout');
  if (landing) landing.style.display = 'flex';
  if (appLayout) appLayout.style.display = 'none';
}

function showWizardView() {
  state.activeView = 'wizard';
  const landing = document.getElementById('view-landing');
  const appLayout = document.getElementById('app-layout');
  if (landing) landing.style.display = 'none';
  if (appLayout) appLayout.style.display = 'flex';
}

function getNoDraftsSetting() {
  return localStorage.getItem('aiosubtitles_no_drafts') === 'true';
}

function notifyConfigChanged() {
  const isDirty = Boolean(state.lastSavedConfigJson && JSON.stringify(state.config) !== state.lastSavedConfigJson);

  if (isDirty) {
    if (!getNoDraftsSetting() && state.uuid) {
      localStorage.setItem(`aiosubtitles_draft_${state.uuid}`, JSON.stringify(state.config));
    }
  } else {
    if (state.uuid) {
      localStorage.removeItem(`aiosubtitles_draft_${state.uuid}`);
    }
  }
}

function setupDynamicPasswordInput(inputId, wrapId, toggleBtnId, showEyeId, hideEyeId, onInputCallback) {
  const input = document.getElementById(inputId);
  const wrap = document.getElementById(wrapId);
  const btn = document.getElementById(toggleBtnId);
  const showEye = document.getElementById(showEyeId);
  const hideEye = document.getElementById(hideEyeId);
  if (!input || !wrap || !btn) return;

  const updateVisibility = () => {
    const hasText = input.value.length > 0;
    wrap.classList.toggle('has-value', hasText);
    btn.style.display = hasText ? 'flex' : 'none';
  };

  input.addEventListener('input', () => {
    updateVisibility();
    if (onInputCallback) onInputCallback(input.value);
  });

  btn.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      if (showEye) showEye.style.display = 'none';
      if (hideEye) hideEye.style.display = 'block';
    } else {
      input.type = 'password';
      if (showEye) showEye.style.display = 'block';
      if (hideEye) hideEye.style.display = 'none';
    }
  });

  updateVisibility();
}

function generateUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateSecurePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  let pass = '';
  for (let i = 0; i < 16; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(str) {
  return typeof str === 'string' && UUID_REGEX.test(str.trim());
}

document.addEventListener('DOMContentLoaded', async () => {
  setupLandingActions();
  setupNavigation();
  setupTopbarActions();
  setupHomeActions();
  setupServicesActions();
  setupAddonsActions();
  setupFiltersActions();
  setupFormatterActions();
  setupAlignmentActions();
  setupInstallPageActions();
  setupModals();
  setupDashboardLoginModal();
  setupSignOutModal();

  await loadInitialConfiguration();

  try {
    const res = await fetch('/api/languages');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.languages) && data.languages.length > 0) {
        state.languagesList = data.languages;
      }
    }
  } catch {
      }

  renderAll();
});

async function loadInitialConfiguration() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const firstPart = pathParts.length > 0 ? pathParts[0].toLowerCase() : '';

  if (firstPart === 'dashboard') {
    showLandingView();
    setTimeout(() => {
      openDashboardLoginModal();
    }, 150);
    return;
  }

  if (firstPart && isUuid(firstPart)) {
    state.uuid = firstPart;
    localStorage.setItem('aiosubtitles_current_uuid', state.uuid);
    const storedPass = localStorage.getItem(`aiosubtitles_pass_${state.uuid}`) || '';
    if (storedPass) {
      state.password = storedPass;
      try {
        const res = await fetch('/api/config/load', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid: state.uuid, password: storedPass })
        });
        const data = await res.json();
        if (res.ok && data.success && data.config) {
          state.isConfigCreated = true;
          applyConfigWithMigration(data.config);
          state.lastSavedConfigJson = JSON.stringify(state.config);
          showWizardView();
          navigateToPage('home');
          checkSavedDraft();
          return;
        }
      } catch (err) {
        console.error('[Session] Error loading config from URL UUID:', err);
      }
    }
    // UUID present but password missing or invalid: show landing & open dashboard login modal
    showLandingView();
    setTimeout(() => {
      openDashboardLoginModal(state.uuid);
    }, 150);
    return;
  }

  if (firstPart === 'configure') {
    state.isConfigCreated = false;
    state.uuid = '';
    state.password = '';
    applyConfigWithMigration(DEFAULT_CONFIG);
    state.lastSavedConfigJson = '';
    showWizardView();
    navigateToPage('home');
    return;
  }

  state.isConfigCreated = false;
  state.uuid = '';
  state.password = '';
  applyConfigWithMigration(DEFAULT_CONFIG);
  state.lastSavedConfigJson = '';
  showLandingView();
}

function checkSavedDraft() {
  if (!getNoDraftsSetting() && state.uuid) {
    const draft = localStorage.getItem(`aiosubtitles_draft_${state.uuid}`);
    if (draft && draft !== state.lastSavedConfigJson) {
      notifyConfigChanged();
    }
  }
}

function applyConfigWithMigration(parsed) {
  const merged = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  if (!parsed || typeof parsed !== 'object') {
    state.config = merged;
    return;
  }

  if (parsed.instanceName) merged.instanceName = parsed.instanceName;
  if (parsed.instanceDesc) merged.instanceDesc = parsed.instanceDesc;
  if (parsed.instanceLogo) merged.instanceLogo = parsed.instanceLogo;
  if (parsed.instanceVersion) merged.instanceVersion = parsed.instanceVersion;

  if (parsed.providers && typeof parsed.providers === 'object') {
    for (const [key, val] of Object.entries(parsed.providers)) {
      if (!val || typeof val !== 'object') continue;
      let targetKey = key;
      if (key === 'opensubtitles-rest' || key === 'opensubtitles-v3') {
        targetKey = 'opensubtitles';
      } else if (key === 'addic7ed') {
        continue;
      }
      if (merged.providers[targetKey]) {
        const apiKey = typeof val.apiKey === 'string' ? val.apiKey.trim() : '';
        const hasApiKey = Boolean(apiKey && apiKey.trim() !== '');
        // Rule: service can only be enabled if apiKey exists
        merged.providers[targetKey].enabled = hasApiKey ? (typeof val.enabled === 'boolean' ? val.enabled : false) : false;
        merged.providers[targetKey].apiKey = apiKey;
        if (hasApiKey) {
          state.validatedKeys[targetKey] = true;
        }
      }
    }
  }

  if (Array.isArray(parsed.customAddons)) {
    merged.customAddons = parsed.customAddons.filter(a => a && a.manifestUrl).map(a => ({
      id: a.id || `custom-${Math.random().toString(36).substring(2, 8)}`,
      name: a.name || 'Addon Importado',
      manifestUrl: a.manifestUrl,
      logo: a.logo || '',
      enabled: typeof a.enabled === 'boolean' ? a.enabled : true,
      timeout: typeof a.timeout === 'number' && !isNaN(a.timeout) ? Math.max(1000, Math.min(60000, Math.round(a.timeout))) : 20000,
      resources: Array.isArray(a.resources) ? a.resources : ['subtitles'],
      selectedResources: Array.isArray(a.selectedResources) ? a.selectedResources : ['subtitles'],
      configurable: Boolean(a.configurable),
      configurationURL: a.configurationURL || ''
    }));
  }

  if (Array.isArray(parsed.providerPriority) && parsed.providerPriority.length > 0) {
    const rawPriority = [];
    for (const item of parsed.providerPriority) {
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
    if (rawPriority.length > 0) {
      merged.providerPriority = rawPriority;
    }
  }

  if (Array.isArray(parsed.languages)) {
    merged.languages = parsed.languages.map(l => String(l).trim().toLowerCase());
  }

  if (typeof parsed.allowUnknownLanguages === 'boolean') {
    merged.allowUnknownLanguages = parsed.allowUnknownLanguages;
  }

  const remapData = (parsed.language_remapping && typeof parsed.language_remapping === 'object')
    ? parsed.language_remapping
    : ((parsed.languageRemap && typeof parsed.languageRemap === 'object') ? parsed.languageRemap : null);
  if (remapData) {
    merged.language_remapping = { ...remapData };
    merged.languageRemap = { ...remapData };
  }

  if (typeof parsed.providerTimeoutMs === 'number') {
    merged.providerTimeoutMs = parsed.providerTimeoutMs;
  }

  if (typeof parsed.deduplication === 'boolean') {
    merged.deduplication = parsed.deduplication;
  }

  if (parsed.deduplicationStrategy) {
    merged.deduplicationStrategy = parsed.deduplicationStrategy;
  }

  if (typeof parsed.cacheTtlMinutes === 'number') {
    merged.cacheTtlMinutes = parsed.cacheTtlMinutes;
  }

  if (parsed.addonFetchingStrategy) {
    merged.addonFetchingStrategy = parsed.addonFetchingStrategy;
  }

  if (parsed.formatter && typeof parsed.formatter === 'object') {
    merged.formatter = {
      preset: parsed.formatter.preset || 'clean',
      nameTemplate: typeof parsed.formatter.nameTemplate === 'string' ? parsed.formatter.nameTemplate : '{sub.lang}',
      descriptionTemplate: typeof parsed.formatter.descriptionTemplate === 'string' ? parsed.formatter.descriptionTemplate : ''
    };
  }

  if (parsed.autoAlignment && typeof parsed.autoAlignment === 'object') {
    merged.autoAlignment = {
      enabled: Boolean(parsed.autoAlignment.enabled),
      sampleDurationMinutes: Number(parsed.autoAlignment.sampleDurationMinutes) || 2,
      timeoutSeconds: Number(parsed.autoAlignment.timeoutSeconds) || 5,
      tool: parsed.autoAlignment.tool || 'auto'
    };
  } else {
    merged.autoAlignment = {
      enabled: false,
      sampleDurationMinutes: 2,
      timeoutSeconds: 5,
      tool: 'auto'
    };
  }

  state.config = merged;
}

function startNewConfiguration() {
  state.uuid = '';
  state.password = '';
  state.isConfigCreated = false;
  state.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  state.lastSavedConfigJson = '';
  state.validatedKeys = {};
  localStorage.removeItem('aiosubtitles_current_uuid');

  const passInput = document.getElementById('create-input-password');
  const confirmInput = document.getElementById('create-input-confirm-password');
  const errBox = document.getElementById('create-config-error');
  if (passInput) {
    passInput.value = '';
    passInput.dispatchEvent(new Event('input'));
  }
  if (confirmInput) {
    confirmInput.value = '';
    confirmInput.dispatchEvent(new Event('input'));
  }
  if (errBox) errBox.style.display = 'none';

  window.history.pushState(null, '', '/configure');
  showWizardView();
  navigateToPage('home');
  renderAll();
  showToast('Started new configuration! Set your password in the Install tab to save.');
}

function renderLandingActions() {
  const btnConfig = document.getElementById('btn-landing-configure');
  if (btnConfig) {
    btnConfig.textContent = 'Configure';
    btnConfig.title = 'Create a new configuration';
  }
}

function setupLandingActions() {
  renderLandingActions();

  document.getElementById('btn-landing-configure')?.addEventListener('click', () => {
    startNewConfiguration();
  });

  document.getElementById('btn-landing-dashboard')?.addEventListener('click', () => {
    openDashboardLoginModal();
  });
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.getAttribute('data-page');
      if (targetPage) {
        navigateToPage(targetPage);
      }
    });
  });

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  btnPrev?.addEventListener('click', () => {
    const curIdx = PAGES_ORDER.indexOf(state.activePage);
    if (curIdx > 0) {
      navigateToPage(PAGES_ORDER[curIdx - 1]);
    }
  });

  btnNext?.addEventListener('click', () => {
    const curIdx = PAGES_ORDER.indexOf(state.activePage);
    if (curIdx < PAGES_ORDER.length - 1) {
      navigateToPage(PAGES_ORDER[curIdx + 1]);
    }
  });

  document.getElementById('btn-continue-setup')?.addEventListener('click', () => {
    navigateToPage('services');
  });
}

function activatePageView(targetView, pageId) {
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
    view.style.opacity = '';
    view.style.transition = '';
  });

  if (targetView) {
    targetView.classList.remove('active');
    void targetView.offsetWidth;
    targetView.classList.add('active');
  }

  if (pageId === 'filters') {
    switchFilterTab(state.activeFilterTab || 'whitelist');
  } else if (pageId === 'formatter') {
    renderFormatterState();
  } else if (pageId === 'install') {
    renderInstallPageDetails();
  }
}

function navigateToPage(pageId) {
  if (!PAGES_ORDER.includes(pageId) || state.activePage === pageId) return;

  const currentView = document.getElementById(`page-${state.activePage}`);
  const targetView = document.getElementById(`page-${pageId}`);

  state.activePage = pageId;

  if (pageId !== 'services') {
    hideMissingCredentialsBanner();
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-page') === pageId);
  });

  const newIdx = PAGES_ORDER.indexOf(pageId);
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  if (btnPrev) btnPrev.disabled = newIdx === 0;
  if (btnNext) btnNext.disabled = newIdx === PAGES_ORDER.length - 1;

  if (currentView && currentView !== targetView && currentView.classList.contains('active')) {
    currentView.style.opacity = '0';
    currentView.style.transition = 'opacity 60ms ease-out';
    setTimeout(() => activatePageView(targetView, pageId), 60);
  } else {
    activatePageView(targetView, pageId);
  }
}

function setupTopbarActions() {
  document.getElementById('btn-trigger-load-config')?.addEventListener('click', () => {
    openLoadConfigModal();
  });

  document.getElementById('btn-close-missing-cred')?.addEventListener('click', () => {
    hideMissingCredentialsBanner();
  });
}

function showMissingCredentialsBanner(servicesList) {
  const banner = document.getElementById('missing-credentials-banner');
  const listEl = document.getElementById('missing-cred-list');
  if (!banner || !listEl) return;

  banner.classList.remove('banner-fade-out');
  listEl.innerHTML = '';
  servicesList.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    listEl.appendChild(li);
  });

  banner.style.display = 'flex';
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMissingCredentialsBanner() {
  const banner = document.getElementById('missing-credentials-banner');
  if (!banner || banner.style.display === 'none') return;
  banner.classList.add('banner-fade-out');
  setTimeout(() => {
    banner.style.display = 'none';
    banner.classList.remove('banner-fade-out');
  }, 160);
}

// Generic modal open/close helpers with smooth fade-in & fade-out
function openModal(modalId) {
  const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
  if (!modal) return;
  modal.classList.remove('closing');
  modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
  if (!modal || !modal.classList.contains('active')) return;
  modal.classList.add('closing');
  setTimeout(() => {
    modal.classList.remove('active', 'closing');
  }, 120);
}

function setupHomeActions() {
  document.getElementById('btn-edit-instance-name')?.addEventListener('click', openBrandingModal);
  document.getElementById('btn-edit-instance-desc')?.addEventListener('click', openBrandingModal);
  document.getElementById('btn-change-logo')?.addEventListener('click', openBrandingModal);

  document.getElementById('btn-save-branding')?.addEventListener('click', () => {
    const name = document.getElementById('modal-input-name').value.trim();
    const desc = document.getElementById('modal-input-desc').value.trim();
    const logo = document.getElementById('modal-input-logo').value.trim();
    const ver = document.getElementById('modal-input-version').value.trim();

    if (name) state.config.instanceName = name;
    if (desc) state.config.instanceDesc = desc;
    if (logo) state.config.instanceLogo = logo;
    if (ver) state.config.instanceVersion = ver;

    renderHomeBranding();
    closeBrandingModal();
    notifyConfigChanged();
    showToast('Instance branding updated.');
  });

  document.getElementById('btn-cancel-branding')?.addEventListener('click', closeBrandingModal);
  document.getElementById('btn-close-branding-modal')?.addEventListener('click', closeBrandingModal);

    document.getElementById('btn-home-signout')?.addEventListener('click', () => {
    openModal('modal-signout-confirm');
  });
}

function setupSignOutModal() {
  document.getElementById('btn-close-signout-modal')?.addEventListener('click', () => {
    closeModal('modal-signout-confirm');
  });

  document.getElementById('btn-cancel-signout')?.addEventListener('click', () => {
    closeModal('modal-signout-confirm');
  });

  document.getElementById('btn-confirm-signout')?.addEventListener('click', () => {
    const allDevices = document.getElementById('check-signout-all-devices')?.checked;

    if (state.uuid) {
      localStorage.removeItem(`aiosubtitles_pass_${state.uuid}`);
      localStorage.removeItem(`aiosubtitles_draft_${state.uuid}`);
    }
    localStorage.removeItem('aiosubtitles_current_uuid');

    if (allDevices) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('aiosubtitles_')) {
          localStorage.removeItem(key);
        }
      });
    }

    state.uuid = '';
    state.password = '';
    state.isConfigCreated = false;
    state.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    state.lastSavedConfigJson = '';

    closeModal('modal-signout-confirm');
    window.history.pushState(null, '', '/');
    showLandingView();
    renderAll();
    showToast('Signed out successfully.');
  });
}

function openBrandingModal() {
  document.getElementById('modal-input-name').value = state.config.instanceName || '';
  document.getElementById('modal-input-desc').value = state.config.instanceDesc || '';
  document.getElementById('modal-input-logo').value = state.config.instanceLogo || '';
  document.getElementById('modal-input-version').value = state.config.instanceVersion || '';
  openModal('modal-branding');
}

function closeBrandingModal() {
  closeModal('modal-branding');
}

function renderHomeBranding() {
  const nameEl = document.getElementById('home-instance-name');
  const descEl = document.getElementById('home-instance-desc');
  const verEl = document.getElementById('home-instance-version');
  const imgEl = document.getElementById('home-logo-img');
  const sidebarImgEl = document.getElementById('sidebar-brand-img');
  const defaultLogo = '/assets/AIOsubs_logo_wordmark.png';

  if (nameEl) nameEl.textContent = state.config.instanceName || 'AIOSubs';
  if (descEl) descEl.textContent = state.config.instanceDesc || 'Subtitle aggregator and organizer';
  if (verEl) verEl.textContent = state.config.instanceVersion || 'v1.0.0';

  const logoSrc = state.config.instanceLogo && state.config.instanceLogo.trim() !== ''
    ? state.config.instanceLogo.trim()
    : defaultLogo;

  if (imgEl) {
    imgEl.src = logoSrc;
    imgEl.onerror = () => {
      imgEl.src = defaultLogo;
    };
  }

  if (sidebarImgEl) {
    sidebarImgEl.src = logoSrc;
    sidebarImgEl.onerror = () => {
      sidebarImgEl.src = defaultLogo;
    };
  }
}

function setupServicesActions() {
  const serviceIds = ['opensubtitles', 'subdl', 'subsource'];

  serviceIds.forEach(id => {
    const toggle = document.getElementById(`svc-toggle-${id}`);
    if (toggle) {
      toggle.addEventListener('click', async (e) => {
                const isTurningOn = toggle.checked;

        if (isTurningOn) {
          // Rule: cannot be turned ON without valid API key
          const prov = state.config.providers[id];
          const apiKey = prov?.apiKey?.trim() || '';

          if (!apiKey) {
                        e.preventDefault();
            toggle.checked = false;
            prov.enabled = false;
            showMissingCredentialsBanner([SERVICES_META[id]?.name || id]);
            return;
          }

          // If key exists, verify if valid
          if (!state.validatedKeys[id]) {
            e.preventDefault();
            toggle.disabled = true;
            try {
              const res = await fetch(`/api/validate-key/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
              });
              const data = await res.json();
              toggle.disabled = false;
              if (data.valid) {
                state.validatedKeys[id] = true;
                toggle.checked = true;
                prov.enabled = true;
                hideMissingCredentialsBanner();
                renderFiltersPriority();
                updateStats();
                notifyConfigChanged();
                showToast(`${SERVICES_META[id]?.name} enabled successfully.`);
              } else {
                toggle.checked = false;
                prov.enabled = false;
                showMissingCredentialsBanner([SERVICES_META[id]?.name || id]);
              }
            } catch {
              toggle.disabled = false;
              toggle.checked = false;
              prov.enabled = false;
              showMissingCredentialsBanner([SERVICES_META[id]?.name || id]);
            }
            return;
          }

          // Validated already
          prov.enabled = true;
          hideMissingCredentialsBanner();
          renderFiltersPriority();
          updateStats();
          notifyConfigChanged();
        } else {
          // Turning OFF is always allowed and does not trigger error
          if (!state.config.providers[id]) {
            state.config.providers[id] = { enabled: false, apiKey: '' };
          }
          state.config.providers[id].enabled = false;
          hideMissingCredentialsBanner();
          renderFiltersPriority();
          updateStats();
          notifyConfigChanged();
        }
      });
    }

        const btnGear = document.getElementById(`btn-config-${id}`);
    if (btnGear) {
      btnGear.addEventListener('click', () => {
        openServiceConfigModal(id);
      });
    }
  });

    const searchInput = document.getElementById('search-services');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      let matchIdx = 0;
      document.querySelectorAll('#services-list-container .service-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        const matches = text.includes(q);
        if (matches) {
          row.style.display = 'flex';
          row.classList.remove('search-stagger-item');
          void row.offsetWidth; // trigger reflow
          row.classList.add('search-stagger-item');
          row.style.animationDelay = `${Math.min(matchIdx * 15, 120)}ms`;
          matchIdx++;
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Modal API Key Input with automatic background validation
  const keyInput = document.getElementById('modal-service-key-input');
  if (keyInput) {
    keyInput.addEventListener('input', () => {
      const serviceId = document.getElementById('modal-service-id').value;
      triggerAutoValidation(serviceId, keyInput.value);
    });
  }

    const btnEye = document.getElementById('btn-modal-toggle-eye');
  const eyeShow = document.getElementById('eye-icon-show');
  const eyeHide = document.getElementById('eye-icon-hide');
  if (btnEye && keyInput) {
    btnEye.addEventListener('click', () => {
      if (keyInput.type === 'password') {
        keyInput.type = 'text';
        eyeShow.style.display = 'none';
        eyeHide.style.display = 'block';
      } else {
        keyInput.type = 'password';
        eyeShow.style.display = 'block';
        eyeHide.style.display = 'none';
      }
    });
  }

    document.getElementById('btn-save-service-modal')?.addEventListener('click', () => {
    const serviceId = document.getElementById('modal-service-id').value;
    const newKey = keyInput ? keyInput.value.trim() : '';

    if (!state.config.providers[serviceId]) {
      state.config.providers[serviceId] = { enabled: false, apiKey: '' };
    }
    state.config.providers[serviceId].apiKey = newKey;

    // If key is empty, ensure disabled
    if (!newKey) {
      state.config.providers[serviceId].enabled = false;
      state.validatedKeys[serviceId] = false;
      const toggle = document.getElementById(`svc-toggle-${serviceId}`);
      if (toggle) toggle.checked = false;
    }

    renderFiltersPriority();
    updateStats();
    notifyConfigChanged();
    closeServiceConfigModal();
    showToast(`Settings saved for ${SERVICES_META[serviceId]?.name || serviceId}.`);
  });

  document.getElementById('btn-cancel-service-modal')?.addEventListener('click', closeServiceConfigModal);
  document.getElementById('btn-close-service-modal')?.addEventListener('click', closeServiceConfigModal);
}

function openServiceConfigModal(serviceId) {
  const meta = SERVICES_META[serviceId];
  if (!meta) return;

  document.getElementById('modal-service-id').value = serviceId;
  document.getElementById('modal-service-title').textContent = `Configure ${meta.name}`;
  document.getElementById('modal-service-hint').innerHTML = meta.helpText;

  const keyInput = document.getElementById('modal-service-key-input');
  const existingKey = state.config.providers[serviceId]?.apiKey || '';
  keyInput.value = existingKey;
  keyInput.type = 'password';

  document.getElementById('eye-icon-show').style.display = 'block';
  document.getElementById('eye-icon-hide').style.display = 'none';

  // Automatically validate existing key if present
  triggerAutoValidation(serviceId, existingKey);

  openModal('modal-service-config');
}

function closeServiceConfigModal() {
  clearTimeout(state.validationDebounceTimer);
  closeModal('modal-service-config');
}

function triggerAutoValidation(serviceId, apiKey) {
  const statusEl = document.getElementById('modal-key-status');
  if (!statusEl) return;

  const trimmed = (apiKey || '').trim();
  if (!trimmed) {
    statusEl.className = 'api-key-validation-indicator';
    statusEl.innerHTML = '';
    statusEl.title = '';
    state.validatedKeys[serviceId] = false;
    return;
  }

    statusEl.className = 'api-key-validation-indicator loading';
  statusEl.innerHTML = '';
  statusEl.title = 'Validating key...';

  clearTimeout(state.validationDebounceTimer);
  state.validationDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/validate-key/${serviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed })
      });
      const data = await res.json();
      if (data.valid) {
        statusEl.className = 'api-key-validation-indicator valid';
        statusEl.innerHTML = MDI_ICONS.check16;
        statusEl.title = 'Valid API Key';
        state.validatedKeys[serviceId] = true;
      } else {
        statusEl.className = 'api-key-validation-indicator invalid';
        statusEl.innerHTML = MDI_ICONS.close16;
        statusEl.title = data.error || 'Invalid API Key';
        state.validatedKeys[serviceId] = false;
      }
    } catch {
      statusEl.className = 'api-key-validation-indicator invalid';
      statusEl.innerHTML = MDI_ICONS.close16;
      statusEl.title = 'Validation connection error';
      state.validatedKeys[serviceId] = false;
    }
  }, 450);
}

function renderServicesState() {
  const serviceIds = ['opensubtitles', 'subdl', 'subsource'];
  serviceIds.forEach(id => {
    const toggle = document.getElementById(`svc-toggle-${id}`);
    if (toggle) {
      const prov = state.config.providers[id];
      toggle.checked = prov ? prov.enabled === true : false;
    }
  });
}

function setupAddonsActions() {
  const btnImport = document.getElementById('btn-import-manifest');
  const inputUrl = document.getElementById('input-manifest-url');
  const feedbackMsg = document.getElementById('import-validation-msg');

  if (btnImport && inputUrl) {
    btnImport.addEventListener('click', async () => {
      const rawUrl = inputUrl.value.trim();
      if (!rawUrl) {
        showImportFeedback('Please enter the manifest.json URL of an addon.', false);
        return;
      }

      btnImport.disabled = true;
      btnImport.textContent = 'Importando...';
      feedbackMsg.textContent = '';

      try {
        const res = await fetch('/api/manifest/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: rawUrl })
        });
        const data = await res.json();

        if (!res.ok || !data.valid) {
          showImportFeedback(data.error || 'This addon does not provide subtitles.', false);
          return;
        }

        const exists = state.config.customAddons.some(a => a.manifestUrl === data.manifestUrl || a.id === data.id);
        if (exists) {
          showImportFeedback('This addon has already been imported.', false);
          return;
        }

        const newAddon = {
          id: data.id,
          name: data.name,
          manifestUrl: data.manifestUrl,
          logo: data.logo || '',
          description: data.description || '',
          enabled: true,
          timeout: 20000,
          resources: Array.isArray(data.resources) && data.resources.length > 0 ? data.resources : ['subtitles'],
          selectedResources: ['subtitles'],
          configurable: Boolean(data.configurable),
          configurationURL: data.configurationURL || ''
        };

        state.config.customAddons.push(newAddon);
        if (!state.config.providerPriority.includes(newAddon.id)) {
          state.config.providerPriority.push(newAddon.id);
        }

        inputUrl.value = '';
        showImportFeedback(`Addon "${newAddon.name}" imported successfully!`, true);
        renderInstalledAddons();
        renderFiltersPriority();
        updateStats();
        notifyConfigChanged();
      } catch {
        showImportFeedback('Could not connect to the manifest endpoint.', false);
      } finally {
        btnImport.disabled = false;
        btnImport.innerHTML = `${MDI_ICONS.plus16} Import`;
      }
    });
  }

  const searchInput = document.getElementById('search-installed-addons');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderInstalledAddons(searchInput.value.toLowerCase().trim());
    });
  }

    document.getElementById('btn-edit-timeout-up')?.addEventListener('click', () => {
    const input = document.getElementById('edit-addon-timeout');
    if (input) {
      let val = parseInt(input.value, 10) || 20000;
      val = Math.min(60000, val + 500);
      input.value = val;
    }
  });

  document.getElementById('btn-edit-timeout-down')?.addEventListener('click', () => {
    const input = document.getElementById('edit-addon-timeout');
    if (input) {
      let val = parseInt(input.value, 10) || 20000;
      val = Math.max(1000, val - 500);
      input.value = val;
    }
  });

    const selectFetching = document.getElementById('select-fetching-strategy');
  if (selectFetching) {
    selectFetching.value = state.config.addonFetchingStrategy || 'default';
    setupCustomSelect('wrap-fetching-strategy', 'select-fetching-strategy', (val) => {
      state.config.addonFetchingStrategy = val;
      notifyConfigChanged();
      showToast(`Strategy changed to: ${val === 'sequential' ? 'Sequential (Priority)' : 'Default (Parallel)'}`);
    });
  }

  document.getElementById('btn-save-edit-addon')?.addEventListener('click', () => {
    const id = document.getElementById('edit-addon-id').value;
    const name = document.getElementById('edit-addon-name').value.trim();
    const url = document.getElementById('edit-addon-url').value.trim();
    if (!name || !url) {
      alert('Please fill in both Name and Manifest URL (required fields).');
      return;
    }

    const timeoutInput = document.getElementById('edit-addon-timeout');
    let timeoutVal = 20000;
    if (timeoutInput) {
      const parsed = parseInt(timeoutInput.value, 10);
      if (!isNaN(parsed)) {
        timeoutVal = Math.max(1000, Math.min(60000, parsed));
      }
    }

    const addon = state.config.customAddons.find(a => a.id === id);
    if (addon) {
      addon.name = name;
      addon.manifestUrl = url;
      addon.timeout = timeoutVal;
      const chipsContainer = document.getElementById('edit-addon-resources-chips');
      if (chipsContainer && typeof chipsContainer._getSelected === 'function') {
        addon.selectedResources = chipsContainer._getSelected();
      }
      renderInstalledAddons();
      renderFiltersPriority();
      notifyConfigChanged();
      showToast('Addon atualizado.');
    }
    closeEditAddonModal();
  });

  document.getElementById('btn-cancel-edit-addon')?.addEventListener('click', closeEditAddonModal);
  document.getElementById('btn-close-edit-addon-modal')?.addEventListener('click', closeEditAddonModal);
}

function showImportFeedback(msg, isSuccess) {
  const el = document.getElementById('import-validation-msg');
  if (!el) return;
  el.className = `validation-feedback ${isSuccess ? 'success' : 'error'}`;
  el.textContent = msg;
}

function renderInstalledAddons(query = '') {
  const container = document.getElementById('installed-addons-list');
  if (!container) return;

  let list = state.config.customAddons || [];
  if (query) {
    list = list.filter(a => (a.name || '').toLowerCase().includes(query) || (a.manifestUrl || '').toLowerCase().includes(query));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-addons-box">
        No addons imported yet. Paste a manifest.json URL above to add external subtitle addons.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  list.forEach((addon, idx) => {
    const row = document.createElement('div');
    row.className = 'addon-row search-stagger-item';
    row.style.animationDelay = `${Math.min(idx * 15, 120)}ms`;
    row.dataset.id = addon.id;

    const logoHtml = addon.logo
      ? `<img src="${escapeHtml(addon.logo)}" alt="${escapeHtml(addon.name)}" onerror="this.src='https://raw.githubusercontent.com/stremio/stremio-addon-sdk/master/images/stremio.png'">`
      : MDI_ICONS.puzzle;

    row.innerHTML = `
      <div class="addon-left">
        <div class="addon-logo">${logoHtml}</div>
        <div class="addon-info">
          <span class="addon-name">${escapeHtml(addon.name)}</span>
          <div class="addon-url-row">
            <span class="addon-url" title="${escapeHtml(addon.manifestUrl)}">${escapeHtml(addon.manifestUrl)}</span>
            <button class="btn-copy-sm" data-url="${escapeHtml(addon.manifestUrl)}" title="Copiar Manifest URL">
              ${MDI_ICONS.copySm}
            </button>
          </div>
        </div>
      </div>
      <div class="addon-right">
        <label class="compact-switch" title="Ativar ou desativar este addon">
          <input type="checkbox" class="toggle-addon" data-id="${addon.id}" ${addon.enabled !== false ? 'checked' : ''}>
          <span class="compact-slider"></span>
        </label>
        <button class="btn-addon-action btn-edit-addon" data-id="${addon.id}" title="Edit addon settings">${MDI_ICONS.pencil}</button>
        <button class="btn-addon-action delete btn-delete-addon" data-id="${addon.id}" title="Delete addon">${MDI_ICONS.trash}</button>
      </div>
    `;

    row.querySelector('.toggle-addon').addEventListener('change', (e) => {
      addon.enabled = e.target.checked;
      renderFiltersPriority();
      updateStats();
      notifyConfigChanged();
    });

    row.querySelector('.btn-copy-sm').addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(addon.manifestUrl);
      showToast('Manifest URL copied!');
    });

    row.querySelector('.btn-edit-addon').addEventListener('click', () => {
      openEditAddonModal(addon);
    });

    row.querySelector('.btn-delete-addon').addEventListener('click', () => {
      if (confirm(`Deseja remover o addon "${addon.name}"?`)) {
        row.classList.add('row-fade-out');
        setTimeout(() => {
          state.config.customAddons = state.config.customAddons.filter(a => a.id !== addon.id);
          state.config.providerPriority = state.config.providerPriority.filter(id => id !== addon.id);
          renderInstalledAddons();
          renderFiltersPriority();
          updateStats();
          notifyConfigChanged();
          showToast('Addon removido.');
        }, 180);
      }
    });

    container.appendChild(row);
  });
}

function openEditAddonModal(addon) {
  document.getElementById('edit-addon-id').value = addon.id;
  document.getElementById('edit-addon-name').value = addon.name || '';
  document.getElementById('edit-addon-url').value = addon.manifestUrl || '';
  const timeoutInput = document.getElementById('edit-addon-timeout');
  if (timeoutInput) {
    timeoutInput.value = addon.timeout || 20000;
  }

  // Resources multi-select chips
  const chipsContainer = document.getElementById('edit-addon-resources-chips');
  if (chipsContainer) {
    chipsContainer.innerHTML = '';
    const availableResources = (addon.resources && addon.resources.length > 0) ? addon.resources : ['subtitles'];
    const selected = new Set(addon.selectedResources || ['subtitles']);
    availableResources.forEach(resName => {
      const chip = document.createElement('button');
      chip.type = 'button';
      const isSel = selected.has(resName);
      chip.className = `btn btn-sm ${isSel ? 'btn-primary' : 'btn-outline'}`;
      chip.style.cssText = 'border-radius: 9999px; padding: 4px 12px; font-size: 11.5px; cursor: pointer; transition: all 150ms ease;';
      chip.textContent = resName.charAt(0).toUpperCase() + resName.slice(1);
      chip.addEventListener('click', () => {
        if (selected.has(resName)) {
          selected.delete(resName);
          chip.className = 'btn btn-sm btn-outline';
        } else {
          selected.add(resName);
          chip.className = 'btn btn-sm btn-primary';
        }
      });
      chipsContainer.appendChild(chip);
    });
    chipsContainer._getSelected = () => Array.from(selected);
  }

  // Addon external configuration page link
  const configRow = document.getElementById('edit-addon-config-link-row');
  const configBtn = document.getElementById('btn-addon-external-config');
  const isConfigurable = Boolean(addon.configurable || addon.configurationURL);
  if (configRow) {
    configRow.style.display = isConfigurable ? 'flex' : 'none';
    if (isConfigurable && configBtn) {
      configBtn.href = addon.configurationURL || (addon.manifestUrl ? addon.manifestUrl.replace(/\/manifest\.json$/i, '/configure') : '#');
    }
  }

  openModal('modal-edit-addon');
}

function closeEditAddonModal() {
  closeModal('modal-edit-addon');
}

function setupFiltersActions() {
    const tabButtons = document.querySelectorAll('.filters-nav-item');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-filter-tab');
      if (tabId) {
        switchFilterTab(tabId);
      }
    });
  });

    document.getElementById('btn-quick-pt-en')?.addEventListener('click', () => {
    state.config.languages = ['pob', 'por', 'eng'];
    renderWhitelistTags();
    renderLanguageChips(document.getElementById('search-languages')?.value || '');
    updateStats();
    notifyConfigChanged();
  });

  document.getElementById('btn-clear-langs')?.addEventListener('click', () => {
    state.config.languages = [];
    renderWhitelistTags();
    renderLanguageChips(document.getElementById('search-languages')?.value || '');
    updateStats();
    notifyConfigChanged();
  });

    const searchLangInput = document.getElementById('search-languages');
  if (searchLangInput) {
    searchLangInput.addEventListener('input', () => {
      renderLanguageChips(searchLangInput.value.toLowerCase().trim());
    });
  }

  setupLanguageRemappingUI();

    const toggleDedup = document.getElementById('toggle-deduplication');
  const dedupStrategyRow = document.getElementById('dedup-strategy-row');

  if (toggleDedup) {
    toggleDedup.checked = state.config.deduplication !== false;
    if (dedupStrategyRow) {
      dedupStrategyRow.style.opacity = toggleDedup.checked ? '1' : '0.4';
      dedupStrategyRow.style.pointerEvents = toggleDedup.checked ? 'auto' : 'none';
    }

    toggleDedup.addEventListener('change', () => {
      state.config.deduplication = toggleDedup.checked;
      if (dedupStrategyRow) {
        dedupStrategyRow.style.opacity = toggleDedup.checked ? '1' : '0.4';
        dedupStrategyRow.style.pointerEvents = toggleDedup.checked ? 'auto' : 'none';
      }
      updateStats();
      notifyConfigChanged();
    });
  }

  const selectDedupStrategy = document.getElementById('select-dedup-strategy');
  if (selectDedupStrategy) {
    setupCustomSelect('wrap-dedup-strategy', 'select-dedup-strategy', (val) => {
      state.config.deduplicationStrategy = val;
      updateStats();
      notifyConfigChanged();
    });
  }

}

function setupCustomSelect(wrapId, hiddenInputId, onChange) {
  const wrap = document.getElementById(wrapId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!wrap || !hiddenInput) return;

  const trigger = wrap.querySelector('.custom-select-trigger');
  const labelEl = wrap.querySelector('.custom-select-value');
  const options = wrap.querySelectorAll('.custom-select-option');

  const currentVal = hiddenInput.value || 'both';
  options.forEach(opt => {
    const isSelected = opt.dataset.value === currentVal;
    opt.classList.toggle('selected', isSelected);
    const checkSpan = opt.querySelector('.option-check');
    if (checkSpan) checkSpan.innerHTML = isSelected ? MDI_ICONS.check : '';
    if (isSelected && labelEl) {
      labelEl.textContent = opt.querySelector('.option-text')?.textContent || '';
    }
  });

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains('open');
    document.querySelectorAll('.custom-select-wrap.open').forEach(w => {
      if (w !== wrap) w.classList.remove('open');
    });
    wrap.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
  });

  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.dataset.value;
      hiddenInput.value = val;

      options.forEach(o => {
        const isSel = o === opt;
        o.classList.toggle('selected', isSel);
        const check = o.querySelector('.option-check');
        if (check) check.innerHTML = isSel ? MDI_ICONS.check : '';
      });

      if (labelEl) {
        labelEl.textContent = opt.querySelector('.option-text')?.textContent || '';
      }

      wrap.classList.remove('open');
      trigger?.setAttribute('aria-expanded', 'false');

      if (typeof onChange === 'function') {
        onChange(val);
      }
      hiddenInput.dispatchEvent(new Event('change'));
    });
  });
}

// Global click handler to close open custom selects and remap dropdowns
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select-wrap.open').forEach(w => {
    w.classList.remove('open');
    w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.remap-searchable-select.open').forEach(w => {
    w.classList.remove('open');
    w.querySelector('.remap-select-trigger')?.setAttribute('aria-expanded', 'false');
  });
});

function switchFilterTab(tabId) {
  if (state.activeFilterTab === tabId && document.getElementById(`pane-filter-${tabId}`)?.classList.contains('active')) {
    return;
  }
  const currentTab = state.activeFilterTab;
  state.activeFilterTab = tabId;

  document.querySelectorAll('.filters-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter-tab') === tabId);
  });

  const currentPane = document.getElementById(`pane-filter-${currentTab}`);
  const targetPane = document.getElementById(`pane-filter-${tabId}`);

  if (currentPane && currentPane !== targetPane && currentPane.classList.contains('active')) {
    currentPane.classList.add('pane-fade-out');
    setTimeout(() => {
      document.querySelectorAll('.filters-tab-pane').forEach(pane => {
        pane.classList.remove('pane-fade-out');
        if (pane.id === `pane-filter-${tabId}`) {
          pane.classList.remove('active');
          void pane.offsetWidth; // Trigger reflow for smooth lateral animation replay
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
      triggerTabRender(tabId);
    }, 85);
  } else {
    document.querySelectorAll('.filters-tab-pane').forEach(pane => {
      pane.classList.remove('pane-fade-out');
      if (pane.id === `pane-filter-${tabId}`) {
        pane.classList.remove('active');
        void pane.offsetWidth;
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
    triggerTabRender(tabId);
  }
}

function triggerTabRender(tabId) {
  if (tabId === 'whitelist') {
    renderWhitelistTags();
    renderLanguageChips(document.getElementById('search-languages')?.value || '');
  } else if (tabId === 'remap-dedup') {
    renderRemapList();
  } else if (tabId === 'priority') {
    renderFiltersPriority();
  } else if (tabId === 'alignment') {
    renderAlignmentState();
    checkAlignmentToolsStatus();
  }
}

function renderWhitelistTags() {
  const container = document.getElementById('selected-languages-tags');
  if (!container) return;

  const currentLangs = state.config.languages || [];

  if (currentLangs.length === 0) {
    container.innerHTML = `
      <div class="whitelist-empty-notice">
        <span class="empty-badge">All languages allowed</span>
        <span class="empty-text">No whitelist filter active. All subtitles with valid languages will be displayed.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  currentLangs.forEach(code => {
    const cleanCode = code.toLowerCase();
    const found = (state.languagesList || FALLBACK_LANGUAGES).find(l => l.code.toLowerCase() === cleanCode);
    const label = found ? found.name : cleanCode.toUpperCase();

    const tag = document.createElement('div');
    tag.className = 'selected-lang-tag';
    tag.dataset.code = cleanCode;
    tag.innerHTML = `
      <span class="tag-label">${escapeHtml(label)}</span>
      <span class="tag-code">${escapeHtml(cleanCode.toUpperCase())}</span>
      <button class="btn-remove-tag" data-code="${escapeHtml(cleanCode)}" title="Remover ${escapeHtml(label)}" type="button">${MDI_ICONS.closeSm}</button>
    `;

    tag.querySelector('.btn-remove-tag').addEventListener('click', (e) => {
      e.stopPropagation();
      tag.classList.add('removing');
      setTimeout(() => {
        state.config.languages = state.config.languages.filter(c => c.toLowerCase() !== cleanCode);
        renderWhitelistTags();
        renderLanguageChips(document.getElementById('search-languages')?.value || '');
        updateStats();
        notifyConfigChanged();
      }, 140);
    });

    container.appendChild(tag);
  });
}

function renderLanguageChips(filterQuery = '') {
  const container = document.getElementById('language-chips-container');
  if (!container) return;

  const currentLangs = new Set((state.config.languages || []).map(l => l.toLowerCase()));
  let list = state.languagesList || FALLBACK_LANGUAGES;

  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    list = list.filter(l => l.code.toLowerCase().includes(q) || (l.name || '').toLowerCase().includes(q));
  }

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-chips-msg" style="padding: 12px; color: var(--text-muted); font-size: 12px; text-align: center;">No languages found matching "${escapeHtml(filterQuery)}".</div>`;
    return;
  }

  container.innerHTML = '';
  list.forEach((l, idx) => {
    const isSelected = currentLangs.has(l.code.toLowerCase());
    const item = document.createElement('div');
    item.className = `multiselect-item search-stagger-item ${isSelected ? 'selected' : ''}`;
    item.style.animationDelay = `${Math.min(idx * 15, 120)}ms`;
    item.innerHTML = `
      <span class="item-check">${isSelected ? MDI_ICONS.check16 : ''}</span>
      <span class="item-name">${escapeHtml(l.name || l.code)}</span>
      <span class="item-code">${l.code.toUpperCase()}</span>
    `;

    item.addEventListener('click', () => {
      if (isSelected) {
        const tag = document.querySelector(`.selected-lang-tag[data-code="${l.code.toLowerCase()}"]`);
        if (tag) {
          tag.classList.add('removing');
          setTimeout(() => {
            state.config.languages = state.config.languages.filter(code => code.toLowerCase() !== l.code.toLowerCase());
            renderWhitelistTags();
            renderLanguageChips(filterQuery);
            updateStats();
            notifyConfigChanged();
          }, 140);
          return;
        }
        state.config.languages = state.config.languages.filter(code => code.toLowerCase() !== l.code.toLowerCase());
      } else {
        state.config.languages.push(l.code.toLowerCase());
      }
      renderWhitelistTags();
      renderLanguageChips(filterQuery);
      updateStats();
      notifyConfigChanged();
    });

    container.appendChild(item);
  });
}

function getLanguageInfo(code) {
  if (!code) return null;
  const clean = code.trim().toLowerCase();
  const list = state.languagesList || FALLBACK_LANGUAGES;

  const direct = list.find(l => l.code && l.code.toLowerCase() === clean);
  if (direct) {
    return {
      code: clean,
      name: direct.name || clean.toUpperCase(),
      flag: direct.flag || '🌐'
    };
  }

  const aliasMatch = list.find(l => {
    if (l.aliases && Array.isArray(l.aliases)) {
      return l.aliases.some(a => a.toLowerCase() === clean);
    }
    return false;
  });
  if (aliasMatch) {
    return {
      code: clean,
      name: aliasMatch.name,
      flag: aliasMatch.flag || '🌐'
    };
  }

  return {
    code: clean,
    name: clean.toUpperCase(),
    flag: '🌐'
  };
}

function resetRemapDropdown(type) {
  if (type === 'from') {
    state.remapFromSelection = { code: '', name: '', flag: '' };
    const valEl = document.getElementById('val-remap-from');
    if (valEl) {
      valEl.innerHTML = '<span class="remap-placeholder">Select source language...</span>';
    }
  } else {
    state.remapToSelection = { code: '', name: '', flag: '' };
    const valEl = document.getElementById('val-remap-to');
    if (valEl) {
      valEl.innerHTML = '<span class="remap-placeholder">Select target language...</span>';
    }
  }
  const searchInput = document.getElementById(`search-remap-${type}`);
  if (searchInput) searchInput.value = '';
}

function setRemapSelection(type, lang) {
  if (!lang || !lang.code) return;
  const cleanCode = lang.code.trim().toLowerCase();
  const info = getLanguageInfo(cleanCode) || lang;

  if (type === 'from') {
    state.remapFromSelection = {
      code: cleanCode,
      name: info.name || cleanCode,
      flag: info.flag || '🌐'
    };
    const valEl = document.getElementById('val-remap-from');
    if (valEl) {
      valEl.innerHTML = `
        <span class="remap-option-flag">${info.flag || '🌐'}</span>
        <span class="remap-option-name">${escapeHtml(info.name || cleanCode)}</span>
        <span class="remap-option-code">(${escapeHtml(cleanCode)})</span>
      `;
    }
  } else {
    state.remapToSelection = {
      code: cleanCode,
      name: info.name || cleanCode,
      flag: info.flag || '🌐'
    };
    const valEl = document.getElementById('val-remap-to');
    if (valEl) {
      valEl.innerHTML = `
        <span class="remap-option-flag">${info.flag || '🌐'}</span>
        <span class="remap-option-name">${escapeHtml(info.name || cleanCode)}</span>
        <span class="remap-option-code">(${escapeHtml(cleanCode)})</span>
      `;
    }
  }

  const wrap = document.getElementById(`wrap-remap-${type}`);
  if (wrap) wrap.classList.remove('open');
  const trigger = document.getElementById(`trigger-remap-${type}`);
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function renderRemapDropdownOptions(type, query = '') {
  const container = document.getElementById(`options-remap-${type}`);
  if (!container) return;

  const currentSelection = (type === 'from' ? state.remapFromSelection?.code : state.remapToSelection?.code) || '';
  const q = (query || '').toLowerCase().trim();
  const list = state.languagesList || FALLBACK_LANGUAGES;

  let filtered = list;
  if (q) {
    filtered = list.filter(l => {
      const codeMatch = l.code && l.code.toLowerCase().includes(q);
      const nameMatch = l.name && l.name.toLowerCase().includes(q);
      const nativeMatch = l.nativeName && l.nativeName.toLowerCase().includes(q);
      const aliasMatch = Array.isArray(l.aliases) && l.aliases.some(a => a.toLowerCase().includes(q));
      return codeMatch || nameMatch || nativeMatch || aliasMatch;
    });
  }

  container.innerHTML = '';

  if (q && !list.some(l => l.code && l.code.toLowerCase() === q)) {
    const customItem = document.createElement('div');
    customItem.className = 'remap-option-item remap-option-custom';
    customItem.innerHTML = `
      <div class="remap-option-left">
        <span class="remap-option-flag remap-custom-plus-icon">+</span>
        <span class="remap-option-name">Use custom code: <strong>"${escapeHtml(q)}"</strong></span>
      </div>
      <span class="remap-option-code">${escapeHtml(q)}</span>
    `;
    customItem.addEventListener('click', (e) => {
      e.stopPropagation();
      setRemapSelection(type, { code: q, name: q.toUpperCase(), flag: '🌐' });
    });
    container.appendChild(customItem);
  }

  if (filtered.length === 0 && !q) {
    container.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 11.5px; text-align: center;">No languages available.</div>';
    return;
  }

  filtered.forEach(l => {
    const isSelected = l.code.toLowerCase() === currentSelection.toLowerCase();
    const item = document.createElement('div');
    item.className = `remap-option-item ${isSelected ? 'selected' : ''}`;
    item.innerHTML = `
      <div class="remap-option-left">
        <span class="remap-option-flag">${l.flag || '🌐'}</span>
        <span class="remap-option-name">${escapeHtml(l.name || l.code)}</span>
      </div>
      <span class="remap-option-code">(${escapeHtml(l.code.toLowerCase())})</span>
    `;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      setRemapSelection(type, l);
    });
    container.appendChild(item);
  });
}

function setupRemapDropdown(type) {
  const wrap = document.getElementById(`wrap-remap-${type}`);
  const trigger = document.getElementById(`trigger-remap-${type}`);
  const searchInput = document.getElementById(`search-remap-${type}`);
  if (!wrap || !trigger) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains('open');

    document.querySelectorAll('.remap-searchable-select.open, .custom-select-wrap.open').forEach(w => {
      if (w !== wrap) {
        w.classList.remove('open');
        w.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
      }
    });

    wrap.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');

    if (!isOpen) {
      renderRemapDropdownOptions(type, searchInput?.value || '');
      setTimeout(() => {
        searchInput?.focus();
      }, 50);
    }
  });

  if (searchInput) {
    searchInput.addEventListener('click', (e) => e.stopPropagation());
    searchInput.addEventListener('input', () => {
      renderRemapDropdownOptions(type, searchInput.value);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstOption = wrap.querySelector('.remap-option-item');
        if (firstOption) {
          firstOption.click();
        } else if (searchInput.value.trim()) {
          const val = searchInput.value.trim().toLowerCase();
          setRemapSelection(type, { code: val, name: val.toUpperCase(), flag: '🌐' });
        }
      } else if (e.key === 'Escape') {
        wrap.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function setupLanguageRemappingUI() {
  setupRemapDropdown('from');
  setupRemapDropdown('to');

  const addBtn = document.getElementById('btn-add-remap');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const from = state.remapFromSelection?.code?.trim().toLowerCase();
      const to = state.remapToSelection?.code?.trim().toLowerCase();

      if (!from || !to) {
        showToast('Please select both From and To languages for remapping.');
        return;
      }

      if (from === to) {
        showToast('Source and target languages cannot be the same.');
        return;
      }

      if (!state.config.language_remapping) {
        state.config.language_remapping = {};
      }
      if (!state.config.languageRemap) {
        state.config.languageRemap = {};
      }

      state.config.language_remapping[from] = to;
      state.config.languageRemap[from] = to;

      renderRemapList();
      notifyConfigChanged();
      showToast(`Rule "${from} ➔ ${to}" added.`);

      resetRemapDropdown('from');
    });
  }
}

function renderRemapList() {
  const container = document.getElementById('remap-rules-list');
  const countEl = document.getElementById('remap-rules-count');
  if (!container) return;

  const remap = state.config.language_remapping || state.config.languageRemap || {};
  const entries = Object.entries(remap);

  if (countEl) {
    countEl.textContent = `${entries.length} ${entries.length === 1 ? 'rule' : 'rules'}`;
  }

  if (entries.length === 0) {
    container.innerHTML = '<div class="remap-empty-state">No active mapping rules. Select From and To languages above to add a rule.</div>';
    return;
  }

  container.innerHTML = '';
  entries.forEach(([from, to]) => {
    const fromInfo = getLanguageInfo(from);
    const toInfo = getLanguageInfo(to);

    const fromFlag = fromInfo?.flag || '🌐';
    const fromName = fromInfo?.name || from.toUpperCase();
    const toFlag = toInfo?.flag || '🌐';
    const toName = toInfo?.name || to.toUpperCase();

    const pill = document.createElement('div');
    pill.className = 'remap-rule-pill';
    pill.dataset.from = from;
    pill.innerHTML = `
      <div class="remap-rule-content">
        <span class="remap-rule-lang from">
          <span class="remap-rule-flag">${fromFlag}</span>
          <span class="remap-rule-name">${escapeHtml(fromName)}</span>
          <span class="remap-rule-code">(${escapeHtml(from)})</span>
        </span>
        <span class="remap-rule-arrow">➔</span>
        <span class="remap-rule-lang to">
          <span class="remap-rule-flag">${toFlag}</span>
          <span class="remap-rule-name">${escapeHtml(toName)}</span>
          <span class="remap-rule-code">(${escapeHtml(to)})</span>
        </span>
      </div>
      <button type="button" class="btn-remove-rule" title="Remove rule" aria-label="Remove rule">✕</button>
    `;

    const removeBtn = pill.querySelector('.btn-remove-rule');
    removeBtn.addEventListener('click', () => {
      pill.classList.add('row-fade-out');
      setTimeout(() => {
        if (state.config.language_remapping) {
          delete state.config.language_remapping[from];
        }
        if (state.config.languageRemap) {
          delete state.config.languageRemap[from];
        }
        renderRemapList();
        notifyConfigChanged();
        showToast(`Rule "${from} ➔ ${to}" removed.`);
      }, 160);
    });

    container.appendChild(pill);
  });
}

function renderFiltersPriority() {
  const container = document.getElementById('priority-list-container');
  if (!container) return;

  const activeItemsMap = new Map();

  const nativeKeys = ['opensubtitles', 'subdl', 'subsource'];
  for (const id of nativeKeys) {
    const prov = state.config.providers[id];
    // ONLY show native services that are enabled AND have an API key
    if (prov && prov.enabled === true && prov.apiKey && prov.apiKey.trim() !== '') {
      activeItemsMap.set(id, {
        id,
        name: SERVICES_META[id]?.name || id,
        type: 'Native Service'
      });
    }
  }

  if (Array.isArray(state.config.customAddons)) {
    for (const addon of state.config.customAddons) {
      if (addon && addon.enabled !== false) {
        activeItemsMap.set(addon.id, {
          id: addon.id,
          name: addon.name || 'Subtitle Addon',
          type: 'Addon Importado'
        });
      }
    }
  }

  const orderedList = [];
  const currentPriority = Array.isArray(state.config.providerPriority) ? state.config.providerPriority : [];

  for (const id of currentPriority) {
    if (activeItemsMap.has(id)) {
      orderedList.push(activeItemsMap.get(id));
      activeItemsMap.delete(id);
    }
  }

  for (const item of activeItemsMap.values()) {
    orderedList.push(item);
  }

  state.config.providerPriority = orderedList.map(item => item.id);

  if (orderedList.length === 0) {
    container.innerHTML = `
      <div class="empty-priority-box">
        No active providers or addons at the moment.<br>
        <span style="font-size: 11.5px; color: #6b7280;">Enable services with a valid API Key in <b>Services</b> or import addons in <b>Addons</b>.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  orderedList.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'priority-item';
    row.draggable = true;
    row.dataset.id = item.id;
    row.dataset.index = String(index);

    row.innerHTML = `
      <div class="priority-left">
        <span class="drag-handle" title="Drag to reorder">${MDI_ICONS.drag}</span>
        <span class="priority-name">${escapeHtml(item.name)}</span>
        <span class="priority-type-badge">${item.type}</span>
      </div>
      <div class="priority-right">
        <button class="btn-priority-move" data-action="up" data-index="${index}" title="Move up" ${index === 0 ? 'disabled style="opacity:0.3;cursor:default"' : ''}>${MDI_ICONS.arrowUp}</button>
        <button class="btn-priority-move" data-action="down" data-index="${index}" title="Move down" ${index === orderedList.length - 1 ? 'disabled style="opacity:0.3;cursor:default"' : ''}>${MDI_ICONS.arrowDown}</button>
      </div>
    `;

    row.addEventListener('dragstart', (e) => {
      row.classList.add('dragging');
      e.dataTransfer.setData('text/plain', String(index));
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIndex = index;
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        const movedItem = state.config.providerPriority.splice(fromIndex, 1)[0];
        state.config.providerPriority.splice(toIndex, 0, movedItem);
        renderFiltersPriority();
        notifyConfigChanged();
      }
    });

    container.appendChild(row);
  });

  container.querySelectorAll('.btn-priority-move').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      const action = btn.dataset.action;
      if (action === 'up' && idx > 0) {
        const temp = state.config.providerPriority[idx - 1];
        state.config.providerPriority[idx - 1] = state.config.providerPriority[idx];
        state.config.providerPriority[idx] = temp;
        renderFiltersPriority();
        notifyConfigChanged();
      } else if (action === 'down' && idx < state.config.providerPriority.length - 1) {
        const temp = state.config.providerPriority[idx + 1];
        state.config.providerPriority[idx + 1] = state.config.providerPriority[idx];
        state.config.providerPriority[idx] = temp;
        renderFiltersPriority();
        notifyConfigChanged();
      }
    });
  });
}

function syncConnectorTimeout(newVal) {
  let val = parseInt(newVal, 10);
  if (isNaN(val) || val < 2000) val = 2000;
  if (val > 15000) val = 15000;
  state.config.providerTimeoutMs = val;
  const el1 = document.getElementById('install-addon-timeout');
  if (el1) el1.value = val;
  notifyConfigChanged();
}

let lastFocusedTemplateInput = null;

function interpolatePreview(template, vars) {
  if (!template || typeof template !== 'string') return '';
  let output = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key.replace('.', '\\.')}\\}`, 'gi');
    output = output.replace(regex, value);
  }
  output = output.replace(/\{[a-zA-Z0-9_.]+\}/g, '');
  output = output
    .replace(/\s+([•|\-–/])\s+([•|\-–/])/g, ' $1')
    .replace(/^[\s•|\-–/]+|[\s•|\-–/]+$/g, '')
    .trim();
  return output;
}

function updateFormatterPreview() {
  const sampleVars = {
    'addon.name': 'AIOSubs',
    'sub.lang': 'Português (Brasil)',
    'sub.filename': 'Inception.2010.1080p.BluRay.x264.srt',
    'sub.fps': '23.976 fps',
    'sub.format': 'SRT',
    'sub.delay': '0ms'
  };

  const nameInput = document.getElementById('formatter-name-template');
  const descInput = document.getElementById('formatter-desc-template');
  const nameTpl = nameInput ? nameInput.value : (state.config.formatter?.nameTemplate || '{sub.lang}');
  const descTpl = descInput ? descInput.value : (state.config.formatter?.descriptionTemplate || '');

  const renderedTitle = interpolatePreview(nameTpl, sampleVars) || 'Português (Brasil)';
  const renderedDesc = interpolatePreview(descTpl, sampleVars);

  const titleEl = document.getElementById('preview-sim-title');
  const descEl = document.getElementById('preview-sim-desc');
  const badgeEl = document.getElementById('preview-sim-badge');

  if (titleEl) titleEl.textContent = renderedTitle;

  if (descEl) {
    if (renderedDesc && renderedDesc.trim() !== '') {
      descEl.textContent = renderedDesc.trim();
      descEl.style.display = 'block';
      if (badgeEl) {
        badgeEl.textContent = 'Detailed / Formatted';
        badgeEl.className = 'sim-detailed-badge';
      }
    } else {
      descEl.textContent = '';
      descEl.style.display = 'none';
      if (badgeEl) {
        badgeEl.textContent = 'Clean (No Technical IDs)';
        badgeEl.className = 'sim-clean-badge';
      }
    }
  }
}

function renderFormatterState() {
  if (!state.config.formatter) {
    state.config.formatter = {
      preset: 'clean',
      nameTemplate: '{sub.lang}',
      descriptionTemplate: ''
    };
  }

  const nameInput = document.getElementById('formatter-name-template');
  const descInput = document.getElementById('formatter-desc-template');

  if (nameInput && document.activeElement !== nameInput) {
    nameInput.value = state.config.formatter.nameTemplate ?? '{sub.lang}';
  }

  if (descInput && document.activeElement !== descInput) {
    descInput.value = state.config.formatter.descriptionTemplate ?? '';
  }

  const preset = state.config.formatter.preset || 'clean';
  ['clean', 'detailed', 'custom'].forEach(p => {
    const btn = document.getElementById(`btn-preset-${p}`);
    if (btn) btn.classList.toggle('active', p === preset);
  });

  updateFormatterPreview();
}

function setupFormatterActions() {
  const nameInput = document.getElementById('formatter-name-template');
  const descInput = document.getElementById('formatter-desc-template');

  lastFocusedTemplateInput = descInput || nameInput;

  nameInput?.addEventListener('focus', () => { lastFocusedTemplateInput = nameInput; });
  descInput?.addEventListener('focus', () => { lastFocusedTemplateInput = descInput; });

  const onTemplateInput = () => {
    if (!state.config.formatter) state.config.formatter = { preset: 'custom', nameTemplate: '', descriptionTemplate: '' };
    state.config.formatter.nameTemplate = nameInput ? nameInput.value : '{sub.lang}';
    state.config.formatter.descriptionTemplate = descInput ? descInput.value : '';

    if (state.config.formatter.nameTemplate === '{sub.lang}' && state.config.formatter.descriptionTemplate === '') {
      state.config.formatter.preset = 'clean';
    } else if (state.config.formatter.nameTemplate === '{sub.lang}' && state.config.formatter.descriptionTemplate === '{addon.name} • {sub.format}') {
      state.config.formatter.preset = 'detailed';
    } else {
      state.config.formatter.preset = 'custom';
    }

    ['clean', 'detailed', 'custom'].forEach(p => {
      const btn = document.getElementById(`btn-preset-${p}`);
      if (btn) btn.classList.toggle('active', p === state.config.formatter.preset);
    });

    updateFormatterPreview();
    notifyConfigChanged();
  };

  nameInput?.addEventListener('input', onTemplateInput);
  descInput?.addEventListener('input', onTemplateInput);

  // Preset buttons
  document.getElementById('btn-preset-clean')?.addEventListener('click', () => {
    if (!state.config.formatter) state.config.formatter = { preset: 'clean', nameTemplate: '', descriptionTemplate: '' };
    state.config.formatter.preset = 'clean';
    state.config.formatter.nameTemplate = '{sub.lang}';
    state.config.formatter.descriptionTemplate = '';

    if (nameInput) nameInput.value = '{sub.lang}';
    if (descInput) descInput.value = '';

    ['clean', 'detailed', 'custom'].forEach(p => {
      const btn = document.getElementById(`btn-preset-${p}`);
      if (btn) btn.classList.toggle('active', p === 'clean');
    });

    updateFormatterPreview();
    notifyConfigChanged();
    showToast('Clean preset: technical IDs removed.');
  });

  document.getElementById('btn-preset-detailed')?.addEventListener('click', () => {
    if (!state.config.formatter) state.config.formatter = { preset: 'detailed', nameTemplate: '', descriptionTemplate: '' };
    state.config.formatter.preset = 'detailed';
    state.config.formatter.nameTemplate = '{sub.lang}';
    state.config.formatter.descriptionTemplate = '{addon.name} • {sub.format}';

    if (nameInput) nameInput.value = '{sub.lang}';
    if (descInput) descInput.value = '{addon.name} • {sub.format}';

    ['clean', 'detailed', 'custom'].forEach(p => {
      const btn = document.getElementById(`btn-preset-${p}`);
      if (btn) btn.classList.toggle('active', p === 'detailed');
    });

    updateFormatterPreview();
    notifyConfigChanged();
    showToast('Detailed preset selected.');
  });

  document.getElementById('btn-preset-custom')?.addEventListener('click', () => {
    if (!state.config.formatter) state.config.formatter = { preset: 'custom', nameTemplate: '{sub.lang}', descriptionTemplate: '' };
    state.config.formatter.preset = 'custom';

    ['clean', 'detailed', 'custom'].forEach(p => {
      const btn = document.getElementById(`btn-preset-${p}`);
      if (btn) btn.classList.toggle('active', p === 'custom');
    });

    notifyConfigChanged();
    if (descInput) descInput.focus();
  });

  // Snippets Drawer toggle
  const toggleBtn = document.getElementById('btn-toggle-snippets');
  const drawer = document.getElementById('snippets-popover');

  toggleBtn?.addEventListener('click', () => {
    if (!drawer) return;
    const isHidden = drawer.style.display === 'none' || !drawer.style.display;
    drawer.style.display = isHidden ? 'block' : 'none';
    toggleBtn.classList.toggle('active', isHidden);
    toggleBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  });

  // Snippet chips click to insert
  document.querySelectorAll('.snippet-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const snippet = chip.getAttribute('data-snippet');
      if (!snippet) return;

      const target = lastFocusedTemplateInput || descInput || nameInput;
      if (!target) return;

      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const val = target.value;

      target.value = val.substring(0, start) + snippet + val.substring(end);
      target.selectionStart = target.selectionEnd = start + snippet.length;
      target.focus();
      target.dispatchEvent(new Event('input'));

      showToast(`Inserted ${snippet}`);
    });
  });

  document.getElementById('btn-save-formatter')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-formatter');
    const nameInput = document.getElementById('formatter-name-template');
    const descInput = document.getElementById('formatter-desc-template');

    if (!state.config.formatter) {
      state.config.formatter = { preset: 'clean', nameTemplate: '{sub.lang}', descriptionTemplate: '' };
    }
    if (nameInput) state.config.formatter.nameTemplate = nameInput.value;
    if (descInput) state.config.formatter.descriptionTemplate = descInput.value;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving...';
    }
    try {
      const ok = await saveCurrentConfiguration(false);
      if (ok) {
        showToast('Formatter settings saved and applied!');
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving formatter settings.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Save Changes';
      }
    }
  });
}

function renderAlignmentState() {
  if (!state.config.autoAlignment) {
    state.config.autoAlignment = {
      enabled: false,
      sampleDurationMinutes: 2,
      timeoutSeconds: 5,
      tool: 'auto'
    };
  }

  const toggle = document.getElementById('toggle-auto-alignment');
  const panel = document.getElementById('alignment-options-panel');
  const durationSelect = document.getElementById('align-sample-duration');
  const timeoutSelect = document.getElementById('align-timeout-seconds');
  const toolSelect = document.getElementById('align-tool-preference');

  const isEnabled = Boolean(state.config.autoAlignment.enabled);

  if (toggle) {
    toggle.checked = isEnabled;
  }
  if (panel) {
    panel.style.display = isEnabled ? 'block' : 'none';
  }
  if (durationSelect) {
    durationSelect.value = String(state.config.autoAlignment.sampleDurationMinutes || 2);
  }
  if (timeoutSelect) {
    timeoutSelect.value = String(state.config.autoAlignment.timeoutSeconds || 5);
  }
  if (toolSelect) {
    toolSelect.value = state.config.autoAlignment.tool || 'auto';
  }
}

async function checkAlignmentToolsStatus() {
  const badge = document.getElementById('align-tool-status-badge');
  if (!badge) return;
  try {
    const res = await fetch('/api/alignment/status');
    if (res.ok) {
      const data = await res.json();
      const detected = Array.isArray(data.activeEngines) && data.activeEngines.length > 0
        ? data.activeEngines
        : [
            (data.ffmpeg ?? data.ffmpegAvailable) ? 'ffmpeg' : null,
            (data.alass ?? data.alassAvailable) ? 'alass' : null,
            (data.ffsubsync ?? data.ffsubsyncAvailable) ? 'ffsubsync' : null
          ].filter(Boolean);

      if (detected.length > 0) {
        badge.textContent = `Active engines: ${detected.join(', ')}`;
        badge.style.color = '#34d399';
      } else {
        badge.textContent = 'Binaries not detected in PATH. Safe fallback mode enabled (original subtitles delivered without errors).';
        badge.style.color = '#94a3b8';
      }
    }
  } catch {
    badge.textContent = 'Could not query alignment daemon status';
    badge.style.color = '#94a3b8';
  }
}

function setupAlignmentActions() {
  const toggle = document.getElementById('toggle-auto-alignment');
  const panel = document.getElementById('alignment-options-panel');
  const durationSelect = document.getElementById('align-sample-duration');
  const timeoutSelect = document.getElementById('align-timeout-seconds');
  const toolSelect = document.getElementById('align-tool-preference');

  toggle?.addEventListener('change', () => {
    if (!state.config.autoAlignment) {
      state.config.autoAlignment = { enabled: false, sampleDurationMinutes: 2, timeoutSeconds: 5, tool: 'auto' };
    }
    state.config.autoAlignment.enabled = toggle.checked;
    if (panel) {
      panel.style.display = toggle.checked ? 'block' : 'none';
    }
    notifyConfigChanged();
    if (toggle.checked) {
      showToast('Auto Subtitle Alignment enabled (Experimental)');
      checkAlignmentToolsStatus();
    } else {
      showToast('Auto Subtitle Alignment disabled');
    }
  });

  durationSelect?.addEventListener('change', () => {
    if (!state.config.autoAlignment) state.config.autoAlignment = { enabled: true, sampleDurationMinutes: 2, timeoutSeconds: 5, tool: 'auto' };
    state.config.autoAlignment.sampleDurationMinutes = Number(durationSelect.value) || 2;
    notifyConfigChanged();
  });

  timeoutSelect?.addEventListener('change', () => {
    if (!state.config.autoAlignment) state.config.autoAlignment = { enabled: true, sampleDurationMinutes: 2, timeoutSeconds: 5, tool: 'auto' };
    state.config.autoAlignment.timeoutSeconds = Number(timeoutSelect.value) || 5;
    notifyConfigChanged();
  });

  toolSelect?.addEventListener('change', () => {
    if (!state.config.autoAlignment) state.config.autoAlignment = { enabled: true, sampleDurationMinutes: 2, timeoutSeconds: 5, tool: 'auto' };
    state.config.autoAlignment.tool = toolSelect.value || 'auto';
    notifyConfigChanged();
  });

  checkAlignmentToolsStatus();
}

function setupInstallPageActions() {
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      uuid: state.uuid,
      config: state.config
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiosubtitles-backup-${(state.uuid || 'config').slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Settings exported successfully!');
  });

    const fileImportInput = document.getElementById('file-import-backup');
  document.getElementById('btn-import-backup')?.addEventListener('click', () => {
    fileImportInput?.click();
  });
  fileImportInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const configToRestore = parsed.config || parsed;
        if (!configToRestore || typeof configToRestore !== 'object') {
          throw new Error('Invalid backup file.');
        }
        if (confirm('Do you really want to restore configuration from this backup file? Current settings will be replaced.')) {
          applyConfigWithMigration(configToRestore);
          renderAll();
          notifyConfigChanged();
          showToast('Configuration restored successfully!');
        }
      } catch (err) {
        alert('Error importing backup: ' + (err.message || 'Invalid JSON'));
      } finally {
        fileImportInput.value = '';
      }
    };
    reader.readAsText(file);
  });

    setupDynamicPasswordInput(
    'create-input-password',
    'create-password-wrap',
    'btn-toggle-create-eye',
    'create-eye-show',
    'create-eye-hide'
  );

  setupDynamicPasswordInput(
    'create-input-confirm-password',
    'create-confirm-password-wrap',
    'btn-toggle-create-confirm-eye',
    'create-confirm-eye-show',
    'create-confirm-eye-hide'
  );

    document.getElementById('btn-create-config')?.addEventListener('click', async () => {
    const passInput = document.getElementById('create-input-password');
    const confirmInput = document.getElementById('create-input-confirm-password');
    const errBox = document.getElementById('create-config-error');
    const pass = passInput ? passInput.value.trim() : '';
    const confirmPass = confirmInput ? confirmInput.value.trim() : '';
    const remember = document.getElementById('check-create-remember-me')?.checked;

    if (errBox) errBox.style.display = 'none';

    if (!pass) {
      if (errBox) {
        errBox.textContent = 'Please enter a password for your configuration.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (pass.length < 4) {
      if (errBox) {
        errBox.textContent = 'Password must be at least 4 characters.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (pass !== confirmPass) {
      if (errBox) {
        errBox.textContent = 'Passwords do not match.';
        errBox.style.display = 'block';
      }
      return;
    }

    // Check credentials on active services
    const missingCreds = [];
    const nativeIds = ['opensubtitles', 'subdl', 'subsource'];
    for (const id of nativeIds) {
      const prov = state.config.providers[id];
      if (prov && prov.enabled === true && (!prov.apiKey || prov.apiKey.trim() === '')) {
        missingCreds.push(SERVICES_META[id]?.name || id);
      }
    }

    if (missingCreds.length > 0) {
      showMissingCredentialsBanner(missingCreds);
      showToast('Some enabled services are missing credentials.');
      navigateToPage('services');
      return;
    }

    const btn = document.getElementById('btn-create-config');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating...'; }

    // Preserve existing UUID if already set and valid, never overwrite with random UUID
    const targetUuid = (state.uuid && isUuid(state.uuid)) ? state.uuid : generateUuid();

    try {
      const res = await fetch('/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: targetUuid,
          password: pass,
          config: state.config
        })
      });
      const data = await res.json().catch(() => ({}));
      if (btn) { btn.disabled = false; btn.textContent = 'Create'; }

      if (!res.ok || !data.success) {
        if (errBox) {
          errBox.textContent = data.error || `Server error (${res.status}): Failed to create configuration.`;
          errBox.style.display = 'block';
        }
        return;
      }

      state.uuid = targetUuid;
      state.password = pass;
      state.isConfigCreated = true;
      state.lastSavedConfigJson = JSON.stringify(state.config);

      localStorage.setItem('aiosubtitles_current_uuid', state.uuid);
      if (remember) {
        localStorage.setItem(`aiosubtitles_pass_${state.uuid}`, state.password);
      }

      window.history.replaceState(null, '', `/${state.uuid}/configure`);
      renderInstallPageDetails(true);
      showToast('Configuration created successfully!');
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Create'; }
      if (errBox) {
        errBox.textContent = 'Failed to connect to the server.';
        errBox.style.display = 'block';
      }
    }
  });

    document.getElementById('btn-copy-uuid')?.addEventListener('click', () => {
    if (state.uuid) {
      navigator.clipboard.writeText(state.uuid);
      showToast('UUID copied!');
    }
  });

    setupDynamicPasswordInput(
    'input-user-password',
    'user-password-wrap',
    'btn-toggle-pass-eye',
    'pass-eye-show',
    'pass-eye-hide',
    (val) => {
      state.password = val.trim();
      if (state.uuid && state.isConfigCreated) {
        localStorage.setItem(`aiosubtitles_pass_${state.uuid}`, state.password);
      }
    }
  );

    document.getElementById('btn-explicit-save')?.addEventListener('click', () => {
    saveCurrentConfiguration(false);
  });

  document.getElementById('btn-trigger-new-config')?.addEventListener('click', () => {
    if (confirm('Do you want to start a new configuration with a fresh UUID and password?')) {
      startNewConfiguration();
      navigateToPage('install');
    }
  });

    document.getElementById('btn-copy-manifest')?.addEventListener('click', () => {
    const input = document.getElementById('final-manifest-url');
    if (input && input.value && state.isConfigCreated && state.uuid) {
      navigator.clipboard.writeText(input.value);
      showToast('Manifest URL copied successfully!');
    }
  });

    document.getElementById('pill-open-stremio')?.addEventListener('click', () => {
    const link = document.getElementById('link-install-stremio');
    if (link && link.href && state.isConfigCreated && state.uuid) {
      window.location.href = link.href;
    }
  });

  document.getElementById('pill-open-nuvio')?.addEventListener('click', () => {
    if (state.isConfigCreated && state.uuid) {
      openNuvioModal();
    } else {
      showToast('Please create your configuration before installing to Nuvio.');
    }
  });

  document.getElementById('pill-open-web')?.addEventListener('click', () => {
    const link = document.getElementById('link-install-stremio-web');
    if (link && link.href && state.isConfigCreated && state.uuid) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    }
  });

    const timeoutInput = document.getElementById('install-addon-timeout');
  if (timeoutInput) {
    timeoutInput.value = state.config.providerTimeoutMs || 6000;
    timeoutInput.addEventListener('change', () => {
      syncConnectorTimeout(parseInt(timeoutInput.value, 10));
    });
    timeoutInput.addEventListener('input', () => {
      const val = parseInt(timeoutInput.value, 10);
      if (!isNaN(val) && val >= 2000 && val <= 15000) {
        state.config.providerTimeoutMs = val;
        notifyConfigChanged();
      }
    });
  }

  document.getElementById('btn-timeout-up')?.addEventListener('click', () => {
    syncConnectorTimeout((state.config.providerTimeoutMs || 6000) + 500);
  });

  document.getElementById('btn-timeout-down')?.addEventListener('click', () => {
    syncConnectorTimeout((state.config.providerTimeoutMs || 6000) - 500);
  });
}

async function saveCurrentConfiguration(andShowInstall = false) {
  const missingCreds = [];
  const nativeIds = ['opensubtitles', 'subdl', 'subsource'];
  for (const id of nativeIds) {
    const prov = state.config.providers[id];
    if (prov && prov.enabled === true) {
      if (!prov.apiKey || prov.apiKey.trim() === '') {
        missingCreds.push(SERVICES_META[id]?.name || id);
      }
    }
  }

  if (missingCreds.length > 0) {
    showMissingCredentialsBanner(missingCreds);
    showToast('Some enabled services are missing credentials.');
    navigateToPage('services');
    return false;
  }

  hideMissingCredentialsBanner();

  if (!state.isConfigCreated || !state.uuid || !isUuid(state.uuid)) {
    showToast('Set a password in the Install step to create and save your configuration.');
    navigateToPage('install');
    return false;
  }

  if (!state.password && state.uuid) {
    state.password = localStorage.getItem(`aiosubtitles_pass_${state.uuid}`) || '';
  }

  if (!state.password) {
    const passInput = document.getElementById('input-user-password');
    if (passInput && passInput.value) {
      state.password = passInput.value.trim();
    }
  }

  if (!state.password) {
    showToast('Please enter your password to save changes.');
    navigateToPage('install');
    const passInput = document.getElementById('input-user-password');
    if (passInput) passInput.focus();
    return false;
  }

  const saveBtn = document.getElementById('btn-explicit-save');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  try {
    const res = await fetch('/api/config/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: state.uuid,
        password: state.password,
        config: state.config
      })
    });
    const data = await res.json().catch(() => ({}));

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }

    if (!res.ok || !data.success) {
      const errMsg = data.error || `Server error (${res.status}): Could not save configuration.`;
      console.error('[Save Error]', res.status, errMsg);
      showToast(errMsg);
      return false;
    }

    state.isConfigCreated = true;
    state.lastSavedConfigJson = JSON.stringify(state.config);
    if (state.uuid) {
      localStorage.setItem('aiosubtitles_current_uuid', state.uuid);
      localStorage.setItem(`aiosubtitles_pass_${state.uuid}`, state.password);
      localStorage.removeItem(`aiosubtitles_draft_${state.uuid}`);
    }
    notifyConfigChanged();

    renderInstallPageDetails(false);
    if (andShowInstall) {
      navigateToPage('install');
    }
    showToast('Configuration saved successfully!');
    return true;
  } catch (err) {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
    console.error('[Save Network Error]', err);
    showToast('Connection error while saving configuration.');
    return false;
  }
}

function renderInstallPageDetails(animateTransition = false) {
  const cardCreate = document.getElementById('card-create-configuration');
  const cardSave = document.getElementById('card-save-configuration');
  const passRow = document.getElementById('save-password-row');
  const loadExistingBtn = document.getElementById('btn-trigger-load-config');

  if (state.uuid && !state.password) {
    state.password = localStorage.getItem(`aiosubtitles_pass_${state.uuid}`) || '';
  }
  const isAuthenticated = Boolean(state.isConfigCreated && state.uuid && state.password);

  if (!state.isConfigCreated || !state.uuid) {
    if (cardCreate) cardCreate.style.display = 'block';
    if (cardSave) cardSave.style.display = 'none';

    const inputEl = document.getElementById('final-manifest-url');
    if (inputEl) inputEl.value = 'Create your configuration above to generate installation links.';

    const linkStremio = document.getElementById('link-install-stremio');
    if (linkStremio) {
      linkStremio.removeAttribute('href');
      linkStremio.style.opacity = '0.5';
      linkStremio.style.pointerEvents = 'none';
    }

    const linkStremioWeb = document.getElementById('link-install-stremio-web');
    if (linkStremioWeb) {
      linkStremioWeb.removeAttribute('href');
      linkStremioWeb.style.opacity = '0.5';
      linkStremioWeb.style.pointerEvents = 'none';
    }

    const copyManifestBtn = document.getElementById('btn-copy-manifest');
    if (copyManifestBtn) {
      copyManifestBtn.disabled = true;
      copyManifestBtn.style.opacity = '0.5';
    }
  } else {
    if (cardCreate) cardCreate.style.display = 'none';
    if (cardSave) cardSave.style.display = 'block';

    const uuidDisplay = document.getElementById('display-user-uuid');
    if (uuidDisplay) uuidDisplay.textContent = state.uuid || '--------';

    if (isAuthenticated) {
      if (passRow) {
        if (animateTransition) {
          passRow.classList.add('collapsed');
          setTimeout(() => {
            if (state.password) {
              passRow.style.display = 'none';
            }
          }, 150);
        } else {
          passRow.classList.add('collapsed');
          passRow.style.display = 'none';
        }
      }
      if (loadExistingBtn) {
        loadExistingBtn.style.display = 'none';
      }
    } else {
      if (passRow) {
        passRow.style.display = 'block';
        passRow.classList.remove('collapsed');
        const passInput = document.getElementById('input-user-password');
        if (passInput) passInput.value = '';
      }
      if (loadExistingBtn) {
        loadExistingBtn.style.display = 'inline-flex';
      }
    }

    const baseUrl = window.location.origin;
    const manifestUrl = `${baseUrl}/${state.uuid}/manifest.json`;

    const inputEl = document.getElementById('final-manifest-url');
    if (inputEl) inputEl.value = manifestUrl;

    const linkStremio = document.getElementById('link-install-stremio');
    if (linkStremio) {
      const cleanHost = manifestUrl.replace(/^https?:\/\//i, '');
      linkStremio.href = `stremio://${cleanHost}`;
      linkStremio.style.opacity = '1';
      linkStremio.style.pointerEvents = 'auto';
    }

    const linkStremioWeb = document.getElementById('link-install-stremio-web');
    if (linkStremioWeb) {
      linkStremioWeb.href = `https://web.stremio.com/#/addons?addon=${encodeURIComponent(manifestUrl)}`;
      linkStremioWeb.style.opacity = '1';
      linkStremioWeb.style.pointerEvents = 'auto';
    }

    const copyManifestBtn = document.getElementById('btn-copy-manifest');
    if (copyManifestBtn) {
      copyManifestBtn.disabled = false;
      copyManifestBtn.style.opacity = '1';
    }
  }

  const timeoutInput = document.getElementById('install-addon-timeout');
  if (timeoutInput) {
    timeoutInput.value = state.config.providerTimeoutMs || 6000;
  }
}

function openDashboardLoginModal(prefillUuid = '') {
  const uuidInput = document.getElementById('dashboard-input-uuid');
  const passInput = document.getElementById('dashboard-input-password');
  const errBox = document.getElementById('dashboard-login-error');
  if (errBox) errBox.style.display = 'none';

  if (uuidInput) {
    uuidInput.value = prefillUuid || localStorage.getItem('aiosubtitles_current_uuid') || '';
  }
  if (passInput) {
    passInput.value = '';
    passInput.dispatchEvent(new Event('input'));
  }
  openModal('modal-dashboard-login');
}

function closeDashboardLoginModal() {
  closeModal('modal-dashboard-login');
}

function setupDashboardLoginModal() {
  setupDynamicPasswordInput(
    'dashboard-input-password',
    'dashboard-password-wrap',
    'btn-toggle-dashboard-eye',
    'dashboard-eye-show',
    'dashboard-eye-hide'
  );

  document.getElementById('btn-close-dashboard-modal')?.addEventListener('click', closeDashboardLoginModal);

  document.getElementById('btn-submit-dashboard-login')?.addEventListener('click', async () => {
    const uuidInput = document.getElementById('dashboard-input-uuid');
    const passInput = document.getElementById('dashboard-input-password');
    const errBox = document.getElementById('dashboard-login-error');
    const uuid = uuidInput ? uuidInput.value.trim().toLowerCase() : '';
    const pass = passInput ? passInput.value.trim() : '';

    if (!uuid || !pass) {
      if (errBox) {
        errBox.textContent = 'Please enter both UUID and password.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (!isUuid(uuid)) {
      if (errBox) {
        errBox.textContent = 'Invalid UUID format.';
        errBox.style.display = 'block';
      }
      return;
    }

    const btn = document.getElementById('btn-submit-dashboard-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }

    try {
      const res = await fetch('/api/config/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, password: pass })
      });
      const data = await res.json();
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }

      if (!res.ok || !data.success) {
        if (errBox) {
          errBox.textContent = data.error || 'Invalid UUID or password.';
          errBox.style.display = 'block';
        }
        return;
      }

      state.uuid = data.uuid;
      state.password = pass;
      state.isConfigCreated = true;
      localStorage.setItem('aiosubtitles_current_uuid', state.uuid);
      localStorage.setItem(`aiosubtitles_pass_${state.uuid}`, state.password);

      applyConfigWithMigration(data.config);
      state.lastSavedConfigJson = JSON.stringify(state.config);

      closeDashboardLoginModal();
      showWizardView();
      window.history.pushState(null, '', `/${state.uuid}/configure`);
      navigateToPage('home');
      renderAll();
      showToast('Configuration loaded successfully!');
    } catch {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
      if (errBox) {
        errBox.textContent = 'Failed to connect to the server.';
        errBox.style.display = 'block';
      }
    }
  });
}
function openLoadConfigModal() {
  const modal = document.getElementById('modal-load-config');
  const errBox = document.getElementById('load-config-error');
  if (errBox) errBox.style.display = 'none';

  const uuidInput = document.getElementById('load-input-uuid');
  if (uuidInput) uuidInput.value = state.uuid || '';

  const passInput = document.getElementById('load-input-password');
  if (passInput) {
    passInput.value = '';
    passInput.dispatchEvent(new Event('input'));
  }

  openModal('modal-load-config');
}

function closeLoadConfigModal() {
  closeModal('modal-load-config');
}

function setupModals() {
    setupDynamicPasswordInput('load-input-password', 'load-password-wrap', 'btn-toggle-load-eye', 'load-eye-show', 'load-eye-hide');

  document.getElementById('btn-close-load-modal')?.addEventListener('click', closeLoadConfigModal);
  document.getElementById('btn-cancel-load-modal')?.addEventListener('click', closeLoadConfigModal);

  document.getElementById('btn-submit-load-config')?.addEventListener('click', async () => {
    const uuid = document.getElementById('load-input-uuid').value.trim();
    const pass = document.getElementById('load-input-password').value.trim();
    const errBox = document.getElementById('load-config-error');

    if (!uuid || !pass) {
      if (errBox) {
        errBox.textContent = 'Invalid UUID or password.';
        errBox.style.display = 'block';
      }
      return;
    }

    try {
      const res = await fetch('/api/config/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, password: pass })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (errBox) {
          errBox.textContent = 'Invalid UUID or password.';
          errBox.style.display = 'block';
        }
        return;
      }

      state.uuid = data.uuid;
      state.password = pass;
      localStorage.setItem('aiosubtitles_current_uuid', state.uuid);
      localStorage.setItem(`aiosubtitles_pass_${state.uuid}`, state.password);

      applyConfigWithMigration(data.config);
      renderAll();
      closeLoadConfigModal();
      window.history.replaceState(null, '', `/${state.uuid}/configure`);
      showToast('Configuration loaded successfully!');
    } catch {
      if (errBox) {
        errBox.textContent = 'Invalid UUID or password.';
        errBox.style.display = 'block';
      }
    }
  });

    document.getElementById('btn-close-nuvio-modal')?.addEventListener('click', () => {
    closeModal('modal-nuvio');
  });

  document.getElementById('btn-done-nuvio')?.addEventListener('click', () => {
    closeModal('modal-nuvio');
  });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });
}

async function openNuvioModal() {
  const baseUrl = window.location.origin;
  const manifestUrl = `${baseUrl}/${state.uuid}/manifest.json`;

  const qrBox = document.getElementById('qr-code-box');
  if (qrBox) {
    qrBox.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:180px;color:var(--text-muted);font-size:12px;">Generating QR Code...</div>';
    try {
      const res = await fetch(`/api/qrcode?text=${encodeURIComponent(manifestUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.dataUrl) {
          qrBox.innerHTML = `<img src="${data.dataUrl}" alt="Installation QR Code" width="180" height="180" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: block; margin: 0 auto; background: #fff; padding: 4px;">`;
        } else {
          throw new Error('Sem dataUrl');
        }
      } else {
        throw new Error('HTTP error');
      }
    } catch {
      if (window.QRCode) {
        qrBox.innerHTML = '';
        const canvas = document.createElement('canvas');
        qrBox.appendChild(canvas);
        window.QRCode.toCanvas(canvas, manifestUrl, {
          width: 180,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } else {
        qrBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(manifestUrl)}" alt="QR Code" width="180" height="180" style="border-radius: 8px; display: block; margin: 0 auto; background: #fff; padding: 4px;">`;
      }
    }
  }

  openModal('modal-nuvio');
}

function updateStats() {
  const activeSvcCount = Object.keys(state.config.providers).filter(
    k => state.config.providers[k]?.enabled === true
  ).length;

  const activeAddonCount = (state.config.customAddons || []).filter(
    a => a.enabled !== false
  ).length;

  const statSvc = document.getElementById('stat-active-services');
  const statAddon = document.getElementById('stat-active-addons');
  const statLangs = document.getElementById('stat-active-langs');
  const statDedup = document.getElementById('stat-dedup-status');

  if (statSvc) statSvc.textContent = `${activeSvcCount} Active`;
  if (statAddon) statAddon.textContent = `${activeAddonCount} Installed`;
  if (statLangs) {
    const langs = state.config.languages || [];
    statLangs.textContent = langs.length > 0 ? langs.slice(0, 3).map(l => l.toUpperCase()).join(', ') : 'None';
  }
  if (statDedup) {
    if (state.config.deduplication === false) {
      statDedup.textContent = 'Disabled';
      statDedup.className = 'stat-value';
    } else {
      const strat = state.config.deduplicationStrategy === 'hash' ? 'Hash' : (state.config.deduplicationStrategy === 'fuzzy' ? 'Fuzzy' : 'Both');
      statDedup.textContent = `Enabled (${strat})`;
      statDedup.className = 'stat-value highlight';
    }
  }
}

function renderAll() {
  renderHomeBranding();
  renderServicesState();
  renderInstalledAddons();
  renderWhitelistTags();
  renderLanguageChips();
  renderRemapList();
  renderFiltersPriority();
  renderFormatterState();
  renderAlignmentState();
  renderInstallPageDetails();
  updateStats();
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
