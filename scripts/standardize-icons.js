const fs = require('fs');
const path = require('path');
const mdi = require('@mdi/js');
const si = require('simple-icons');

function getMdiPath(name) {
  if (!mdi[name]) throw new Error(`Missing MDI icon: ${name}`);
  return mdi[name];
}

function getSiPath(name) {
  if (!si[name] || !si[name].path) throw new Error(`Missing Simple Icon: ${name}`);
  return si[name].path;
}

// =============================================================================
// 1. Process src/web/public/index.html
// =============================================================================
let html = fs.readFileSync('src/web/public/index.html', 'utf8');

// Replace brand-avatar icon
html = html.replace(
  /<div class="brand-avatar" id="sidebar-logo-preview" title="AIO Subtitles">[\s\S]*?<\/div>/,
  `<div class="brand-avatar" id="sidebar-logo-preview" title="AIO Subtitles">\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getMdiPath('mdiSubtitles')}"/>\n          </svg>\n        </div>`
);

// Replace sidebar nav icons
html = html.replace(
  /<button class="nav-item active" data-page="home" title="Home">[\s\S]*?<span class="nav-label">Home<\/span>\s*<\/button>/,
  `<button class="nav-item active" data-page="home" title="Home">\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getMdiPath('mdiHome')}"/>\n          </svg>\n          <span class="nav-label">Home</span>\n        </button>`
);

html = html.replace(
  /<button class="nav-item" data-page="services" title="Services">[\s\S]*?<span class="nav-label">Services<\/span>\s*<\/button>/,
  `<button class="nav-item" data-page="services" title="Services">\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getMdiPath('mdiServerNetwork')}"/>\n          </svg>\n          <span class="nav-label">Services</span>\n        </button>`
);

html = html.replace(
  /<button class="nav-item" data-page="addons" title="Addons">[\s\S]*?<span class="nav-label">Addons<\/span>\s*<\/button>/,
  `<button class="nav-item" data-page="addons" title="Addons">\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getMdiPath('mdiPuzzle')}"/>\n          </svg>\n          <span class="nav-label">Addons</span>\n        </button>`
);

html = html.replace(
  /<button class="nav-item" data-page="filters" title="Filters">[\s\S]*?<span class="nav-label">Filters<\/span>\s*<\/button>/,
  `<button class="nav-item" data-page="filters" title="Filters">\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getMdiPath('mdiTune')}"/>\n          </svg>\n          <span class="nav-label">Filters</span>\n        </button>`
);

html = html.replace(
  /<button class="nav-item" data-page="install" title="Install Addon">[\s\S]*?<span class="nav-label">Install<\/span>\s*<\/button>/,
  `<button class="nav-item" data-page="install" title="Install Addon">\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getMdiPath('mdiDownload')}"/>\n          </svg>\n          <span class="nav-label">Install</span>\n        </button>`
);

// Sidebar GitHub icon
html = html.replace(
  /<a href="https:\/\/github.com\/Augustofabg\/(?:aio-subtitles|AIOsubs)" target="_blank" class="nav-item"[^>]*>[\s\S]*?<\/a>/,
  `<a href="https://github.com/Augustofabg/AIOsubs" target="_blank" class="nav-item" title="Repositório GitHub">\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getSiPath('siGithub')}"/>\n          </svg>\n        </a>`
);

// Topbar Load Config
html = html.replace(
  /<button class="topbar-btn" id="btn-open-load-modal" title="Recuperar uma configuração existente por UUID e Senha">[\s\S]*?Load Config\s*<\/button>/,
  `<button class="topbar-btn" id="btn-open-load-modal" title="Recuperar uma configuração existente por UUID e Senha">\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n              <path d="${getMdiPath('mdiKeyVariant')}"/>\n            </svg>\n            Load Config\n          </button>`
);

// Topbar Previous
html = html.replace(
  /<button class="topbar-btn icon-btn" id="btn-prev" title="Página Anterior">[\s\S]*?<\/button>/,
  `<button class="topbar-btn icon-btn" id="btn-prev" title="Página Anterior">\n              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                <path d="${getMdiPath('mdiChevronLeft')}"/>\n              </svg>\n              <span>Previous</span>\n            </button>`
);

// Topbar Next
html = html.replace(
  /<button class="topbar-btn icon-btn" id="btn-next" title="Próxima Página">[\s\S]*?<\/button>/,
  `<button class="topbar-btn icon-btn" id="btn-next" title="Próxima Página">\n              <span>Next</span>\n              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                <path d="${getMdiPath('mdiChevronRight')}"/>\n              </svg>\n            </button>`
);

// Topbar Save & Install
html = html.replace(
  /<button class="btn btn-primary btn-save" id="btn-topbar-save" title="Salvar configuração e instalar">[\s\S]*?<\/button>/,
  `<button class="btn btn-primary btn-save" id="btn-topbar-save" title="Salvar configuração e instalar">\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n              <path d="${getMdiPath('mdiContentSave')}"/>\n            </svg>\n            <span>Save &amp; Install</span>\n          </button>`
);

// Missing credentials banner icon & close
html = html.replace(
  /<div class="missing-cred-icon">[\s\S]*?<\/div>/,
  `<div class="missing-cred-icon">\n            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">\n              <path d="${getMdiPath('mdiAlertCircleOutline')}"/>\n            </svg>\n          </div>`
);
html = html.replace(
  /<button class="missing-cred-close"[^>]*>[\s\S]*?<\/button>/,
  `<button class="missing-cred-close" id="btn-close-missing-cred" title="Fechar" type="button">\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n              <path d="${getMdiPath('mdiClose')}"/>\n            </svg>\n          </button>`
);

// Home Page: Avatar edit overlay
html = html.replace(
  /<button class="avatar-edit-overlay" id="btn-change-logo" title="Alterar logo">[\s\S]*?<\/button>/,
  `<button class="avatar-edit-overlay" id="btn-change-logo" title="Alterar logo">\n                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                    <path d="${getMdiPath('mdiCameraOutline')}"/>\n                  </svg>\n                </button>`
);

// Home Page: inline edit buttons
html = html.replace(
  /<button class="icon-inline-edit" id="btn-edit-instance-name" title="Editar nome">[\s\S]*?<\/button>/,
  `<button class="icon-inline-edit" id="btn-edit-instance-name" title="Editar nome">\n                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">\n                      <path d="${getMdiPath('mdiPencilOutline')}"/>\n                    </svg>\n                  </button>`
);

html = html.replace(
  /<button class="icon-inline-edit" id="btn-edit-instance-desc" title="Editar descrição">[\s\S]*?<\/button>/,
  `<button class="icon-inline-edit" id="btn-edit-instance-desc" title="Editar descrição">\n                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">\n                      <path d="${getMdiPath('mdiPencilOutline')}"/>\n                    </svg>\n                  </button>`
);

// Home Page: Your configuration header icon
html = html.replace(
  /<div class="card-header-icon">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<\/div>\s*<div>\s*<h2>Your configuration<\/h2>/,
  `<div class="card-header-icon">\n                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiFileDocumentOutline')}"/>\n                </svg>\n              </div>\n              <div>\n                <h2>Your configuration</h2>`
);

// Home Page: Continue setup button
html = html.replace(
  /<button class="btn btn-secondary" id="btn-continue-setup">[\s\S]*?<\/button>/,
  `<button class="btn btn-secondary" id="btn-continue-setup">\n                <span>Continue setup</span>\n                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiChevronRight')}"/>\n                </svg>\n              </button>`
);

// Home Page: Save & Install button
html = html.replace(
  /<button class="btn btn-primary" id="btn-home-save-install">[\s\S]*?<\/button>/,
  `<button class="btn btn-primary" id="btn-home-save-install">\n                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiContentSave')}"/>\n                </svg>\n                Save &amp; Install\n              </button>`
);

// Services Page: Search input icon
html = html.replace(
  /<div class="search-input-wrap">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<input type="text" id="search-services"/,
  `<div class="search-input-wrap">\n              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                <path d="${getMdiPath('mdiMagnify')}"/>\n              </svg>\n              <input type="text" id="search-services"`
);

// Services Page: Config gear buttons
['opensubtitles', 'subdl', 'subsource'].forEach(svc => {
  const re = new RegExp(`<button class="btn-config-gear" id="btn-config-${svc}" title="Configurar [^"]+">[\\s\\S]*?<\\/button>`);
  const titleName = svc === 'opensubtitles' ? 'OpenSubtitles' : (svc === 'subdl' ? 'SubDL' : 'Subsource');
  html = html.replace(
    re,
    `<button class="btn-config-gear" id="btn-config-${svc}" title="Configurar ${titleName}">\n                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                      <path d="${getMdiPath('mdiCog')}"/>\n                    </svg>\n                  </button>`
  );
});

// Addons Page: Import card icon
html = html.replace(
  /<div class="card-header-icon">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<\/div>\s*<div>\s*<h2>Adicionar addon por Manifest URL<\/h2>/,
  `<div class="card-header-icon">\n                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiPlus')}"/>\n                </svg>\n              </div>\n              <div>\n                <h2>Adicionar addon por Manifest URL</h2>`
);

// Addons Page: Import button
html = html.replace(
  /<button class="btn btn-primary" id="btn-import-manifest">[\s\S]*?<\/button>/,
  `<button class="btn btn-primary" id="btn-import-manifest">\n                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiPlus')}"/>\n                </svg>\n                Importar\n              </button>`
);

// Addons Page: Search addons
html = html.replace(
  /<div class="search-input-wrap">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<input type="text" id="search-installed-addons"/,
  `<div class="search-input-wrap">\n              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                <path d="${getMdiPath('mdiMagnify')}"/>\n              </svg>\n              <input type="text" id="search-installed-addons"`
);

// Filters Page: Subnav items
html = html.replace(
  /<button class="filters-nav-item active" data-filter-tab="whitelist" type="button">[\s\S]*?<span>Whitelist<\/span>\s*<\/button>/,
  `<button class="filters-nav-item active" data-filter-tab="whitelist" type="button">\n                <svg class="filters-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiFilter')}"/>\n                </svg>\n                <span>Whitelist</span>\n              </button>`
);

html = html.replace(
  /<button class="filters-nav-item" data-filter-tab="remap-dedup" type="button">[\s\S]*?<span>Remapeamento \+ Deduplicação<\/span>\s*<\/button>/,
  `<button class="filters-nav-item" data-filter-tab="remap-dedup" type="button">\n                <svg class="filters-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiSwapHorizontal')}"/>\n                </svg>\n                <span>Remapeamento + Deduplicação</span>\n              </button>`
);

html = html.replace(
  /<button class="filters-nav-item" data-filter-tab="priority" type="button">[\s\S]*?<span>Prioridade dos Provedores e Addons<\/span>\s*<\/button>/,
  `<button class="filters-nav-item" data-filter-tab="priority" type="button">\n                <svg class="filters-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiSort')}"/>\n                </svg>\n                <span>Prioridade dos Provedores e Addons</span>\n              </button>`
);

// Whitelist hint box icon
html = html.replace(
  /<div class="whitelist-hint-box">\s*<svg[^>]*>[\s\S]*?<\/svg>/,
  `<div class="whitelist-hint-box">\n                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#60a5fa">\n                      <path d="${getMdiPath('mdiInformationOutline')}"/>\n                    </svg>`
);

// Remap form arrow & add button
html = html.replace(
  /<span class="remap-arrow">[\s\S]*?<\/span>/,
  `<span class="remap-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiArrowRight')}"/></svg></span>`
);

html = html.replace(
  /<button class="btn btn-outline btn-sm" id="btn-add-remap" type="button">[\s\S]*?<span>Adicionar Regra<\/span>\s*<\/button>/,
  `<button class="btn btn-outline btn-sm" id="btn-add-remap" type="button">\n                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                          <path d="${getMdiPath('mdiPlus')}"/>\n                        </svg>\n                        <span>Adicionar Regra</span>\n                      </button>`
);

// Install Addon Page: UUID info bar icon
html = html.replace(
  /<div class="uuid-info-icon">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<\/div>/,
  `<div class="uuid-info-icon">\n                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#60a5fa">\n                    <path d="${getMdiPath('mdiInformationOutline')}"/>\n                  </svg>\n                </div>`
);

// Install Addon Page: Copy UUID button
html = html.replace(
  /<button class="btn-copy-inline" id="btn-copy-uuid" title="Copiar UUID">[\s\S]*?<\/button>/,
  `<button class="btn-copy-inline" id="btn-copy-uuid" title="Copiar UUID">\n                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                        <path d="${getMdiPath('mdiContentCopy')}"/>\n                      </svg>\n                    </button>`
);

// Install Addon Page: Password toggle eye
html = html.replace(
  /<button class="btn-toggle-eye" id="btn-toggle-pass-eye" title="Mostrar\/Ocultar Senha" type="button">[\s\S]*?<\/button>/,
  `<button class="btn-toggle-eye" id="btn-toggle-pass-eye" title="Mostrar/Ocultar Senha" type="button">\n                    <svg id="pass-eye-show" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                      <path d="${getMdiPath('mdiEye')}"/>\n                    </svg>\n                    <svg id="pass-eye-hide" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: none;">\n                      <path d="${getMdiPath('mdiEyeOff')}"/>\n                    </svg>\n                  </button>`
);

// Install Addon Page: Copy Password button
html = html.replace(
  /<button class="btn-copy-inline-pass" id="btn-copy-password" title="Copiar Senha">[\s\S]*?<\/button>/,
  `<button class="btn-copy-inline-pass" id="btn-copy-password" title="Copiar Senha">\n                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                      <path d="${getMdiPath('mdiContentCopy')}"/>\n                    </svg>\n                  </button>`
);

// Install Addon Page: Stremio logo badge (32px Simple Icon)
html = html.replace(
  /<div class="stremio-logo-badge"[^>]*>[\s\S]*?<\/div>/,
  `<div class="stremio-logo-badge" title="Stremio">\n                      <svg width="32" height="32" viewBox="0 0 24 24" fill="#685CEE" xmlns="http://www.w3.org/2000/svg">\n                        <path d="${getSiPath('siStremio')}"/>\n                      </svg>\n                    </div>`
);

// Install Addon Page: Copy Manifest button
html = html.replace(
  /<button class="btn btn-primary btn-copy-manifest-purple" id="btn-copy-manifest" title="Copiar Manifest URL">[\s\S]*?<\/button>/,
  `<button class="btn btn-primary btn-copy-manifest-purple" id="btn-copy-manifest" title="Copiar Manifest URL">\n                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                        <path d="${getMdiPath('mdiContentCopy')}"/>\n                      </svg>\n                    </button>`
);

// Install Addon Page: Compatible client pills
html = html.replace(
  /<div class="compatible-clients-row">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/,
  `<div class="compatible-clients-row">\n                    <div class="client-pill" title="Stremio">\n                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#685CEE">\n                        <path d="${getSiPath('siStremio')}"/>\n                      </svg>\n                      <span>Stremio</span>\n                    </div>\n                    <div class="client-pill" title="Nuvio" id="pill-open-nuvio">\n                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#38bdf8">\n                        <path d="${getMdiPath('mdiCellphone')}"/>\n                      </svg>\n                      <span>Nuvio (QR)</span>\n                    </div>\n                    <div class="client-pill" title="Web Client">\n                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#a3e635">\n                        <path d="${getMdiPath('mdiWeb')}"/>\n                      </svg>\n                      <span>Web</span>\n                    </div>\n                  </div>\n                </div>\n\n              </div>\n            </div>\n          </div>\n        </section>`
);

// Modals: Close buttons
['btn-close-service-modal', 'btn-close-load-modal', 'btn-close-nuvio-modal', 'btn-close-branding-modal', 'btn-close-edit-addon-modal'].forEach(btnId => {
  const re = new RegExp(`<button class="modal-close" id="${btnId}"[^>]*>[\\s\\S]*?<\\/button>`);
  html = html.replace(
    re,
    `<button class="modal-close" id="${btnId}" title="Fechar" type="button">\n          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\n            <path d="${getMdiPath('mdiClose')}"/>\n          </svg>\n        </button>`
  );
});

// Modals: Service modal eye
html = html.replace(
  /<button class="btn-toggle-eye" id="btn-modal-toggle-eye" title="Mostrar\/Ocultar API Key" type="button">[\s\S]*?<\/button>/,
  `<button class="btn-toggle-eye" id="btn-modal-toggle-eye" title="Mostrar/Ocultar API Key" type="button">\n              <svg id="eye-icon-show" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                <path d="${getMdiPath('mdiEye')}"/>\n              </svg>\n              <svg id="eye-icon-hide" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: none;">\n                <path d="${getMdiPath('mdiEyeOff')}"/>\n              </svg>\n            </button>`
);

// Modals: Load modal eye
html = html.replace(
  /<button class="btn-toggle-eye" id="btn-toggle-load-eye" type="button" title="Mostrar\/Ocultar">[\s\S]*?<\/button>/,
  `<button class="btn-toggle-eye" id="btn-toggle-load-eye" type="button" title="Mostrar/Ocultar">\n                <svg id="load-eye-show" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">\n                  <path d="${getMdiPath('mdiEye')}"/>\n                </svg>\n                <svg id="load-eye-hide" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: none;">\n                  <path d="${getMdiPath('mdiEyeOff')}"/>\n                </svg>\n              </button>`
);

fs.writeFileSync('src/web/public/index.html', html, 'utf8');
console.log('src/web/public/index.html updated successfully.');

// =============================================================================
// 2. Process src/web/public/app.js
// =============================================================================
let appJs = fs.readFileSync('src/web/public/app.js', 'utf8');

// Insert ICONS object at the top of app.js (after line 6)
if (!appJs.includes('const MDI_ICONS = {')) {
  const iconsSnippet = `// =============================================================================
// Material Design Icons Constants (Standardized Icon System)
// =============================================================================
const MDI_ICONS = {
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiCheck')}"/></svg>',
  check16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiCheck')}"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiPlus')}"/></svg>',
  plus16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiPlus')}"/></svg>',
  close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiClose')}"/></svg>',
  close16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiClose')}"/></svg>',
  closeSm: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiClose')}"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiTrashCanOutline')}"/></svg>',
  pencil: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiPencilOutline')}"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiContentCopy')}"/></svg>',
  copySm: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiContentCopy')}"/></svg>',
  drag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiDragVertical')}"/></svg>',
  arrowUp: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiArrowUp')}"/></svg>',
  arrowDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiArrowDown')}"/></svg>',
  arrowRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiArrowRight')}"/></svg>',
  puzzle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="${getMdiPath('mdiPuzzle')}"/></svg>'
};\n\n`;

  appJs = appJs.replace(
    '// 1. Default Configuration & Services Metadata',
    iconsSnippet + '// 1. Default Configuration & Services Metadata'
  );
}

// 2.1 Replace statusEl symbols '✓' and '✕'
appJs = appJs.replace(
  "statusEl.innerHTML = '✓';",
  "statusEl.innerHTML = MDI_ICONS.check16;"
);
appJs = appJs.replace(
  "statusEl.innerHTML = '✕';",
  "statusEl.innerHTML = MDI_ICONS.close16;"
);
appJs = appJs.replace(
  "statusEl.innerHTML = '✕';",
  "statusEl.innerHTML = MDI_ICONS.close16;"
);

// 2.2 Replace btnImport finally SVG
appJs = appJs.replace(
  /btnImport\.innerHTML = `[\s\S]*?<line x1="12" y1="5" x2="12" y2="19"><\/line>[\s\S]*?Importar\s*`;/,
  "btnImport.innerHTML = `${MDI_ICONS.plus16} Importar`;"
);

// 2.3 Replace renderInstalledAddons fallback logo and action buttons
appJs = appJs.replace(
  /: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"><\/path><\/svg>`;/,
  `: MDI_ICONS.puzzle;`
);

appJs = appJs.replace(
  /<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"><\/rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"><\/path><\/svg>/,
  `\${MDI_ICONS.copySm}`
);

appJs = appJs.replace(
  /<button class="btn-addon-action btn-edit-addon" data-id="\${addon\.id}" title="Editar informações do addon">[\s\S]*?<\/button>/,
  `<button class="btn-addon-action btn-edit-addon" data-id="\${addon.id}" title="Editar informações do addon">\${MDI_ICONS.pencil}</button>`
);

appJs = appJs.replace(
  /<button class="btn-addon-action delete btn-delete-addon" data-id="\${addon\.id}" title="Excluir addon">[\s\S]*?<\/button>/,
  `<button class="btn-addon-action delete btn-delete-addon" data-id="\${addon.id}" title="Excluir addon">\${MDI_ICONS.trash}</button>`
);

// 2.4 Replace renderWhitelistTags remove button &times;
appJs = appJs.replace(
  /<button class="btn-remove-tag" data-code="\${escapeHtml\(cleanCode\)}" title="Remover \${escapeHtml\(label\)}" type="button">&times;<\/button>/,
  `<button class="btn-remove-tag" data-code="\${escapeHtml(cleanCode)}" title="Remover \${escapeHtml(label)}" type="button">\${MDI_ICONS.closeSm}</button>`
);

// 2.5 Replace renderLanguageChips status
appJs = appJs.replace(
  /<span class="chip-status">\${isSelected \? '✓' : '\+'}<\/span>/,
  `<span class="chip-status">\${isSelected ? MDI_ICONS.check : MDI_ICONS.plus}</span>`
);

// 2.6 Replace renderRemapTable arrow and delete button
appJs = appJs.replace(
  /<td style="color: var\(--text-muted\); text-align: center;">→<\/td>/,
  `<td style="color: var(--text-muted); text-align: center; vertical-align: middle;">\${MDI_ICONS.arrowRight}</td>`
);

appJs = appJs.replace(
  /<button class="btn-addon-action delete" title="Excluir regra" type="button">[\s\S]*?<\/button>/,
  `<button class="btn-addon-action delete" title="Excluir regra" type="button">\${MDI_ICONS.trash}</button>`
);

// 2.7 Replace renderFiltersPriority drag handle and up/down buttons
appJs = appJs.replace(
  /<span class="drag-handle" title="Arraste para reordenar">☰<\/span>/,
  `<span class="drag-handle" title="Arraste para reordenar">\${MDI_ICONS.drag}</span>`
);

appJs = appJs.replace(
  /<button class="btn-priority-move" data-action="up" data-index="\${index}" title="Mover para cima" [^>]*>▲<\/button>/,
  `<button class="btn-priority-move" data-action="up" data-index="\${index}" title="Mover para cima" \${index === 0 ? 'disabled style="opacity:0.3;cursor:default"' : ''}>\${MDI_ICONS.arrowUp}</button>`
);

appJs = appJs.replace(
  /<button class="btn-priority-move" data-action="down" data-index="\${index}" title="Mover para baixo" [^>]*>▼<\/button>/,
  `<button class="btn-priority-move" data-action="down" data-index="\${index}" title="Mover para baixo" \${index === orderedList.length - 1 ? 'disabled style="opacity:0.3;cursor:default"' : ''}>\${MDI_ICONS.arrowDown}</button>`
);

fs.writeFileSync('src/web/public/app.js', appJs, 'utf8');
console.log('src/web/public/app.js updated successfully.');

// =============================================================================
// 3. Process src/web/public/style.css
// =============================================================================
let css = fs.readFileSync('src/web/public/style.css', 'utf8');

// Ensure modal-close is flex centered
css = css.replace(
  /\.modal-close\s*\{[\s\S]*?\}/,
  `.modal-close {\n  background: transparent;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 4px;\n  border-radius: var(--radius-sm);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  transition: all var(--transition-fast);\n}\n.modal-close:hover {\n  color: #fff;\n  background-color: rgba(255, 255, 255, 0.06);\n}`
);

// Ensure missing-cred-close is flex centered
css = css.replace(
  /\.missing-cred-close\s*\{[\s\S]*?\}/,
  `.missing-cred-close {\n  background: transparent;\n  border: none;\n  color: #f87171;\n  cursor: pointer;\n  padding: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  opacity: 0.8;\n  border-radius: var(--radius-sm);\n  transition: all var(--transition-fast);\n}\n.missing-cred-close:hover {\n  opacity: 1;\n  background-color: rgba(239, 68, 68, 0.1);\n}`
);

// Ensure btn-priority-move is flex centered and clean
css = css.replace(
  /\.btn-priority-move\s*\{[\s\S]*?\}/,
  `.btn-priority-move {\n  background: transparent;\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-sm);\n  color: var(--text-secondary);\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  padding: 0;\n  transition: all var(--transition-fast);\n}\n.btn-priority-move:hover:not(:disabled) {\n  background-color: #222228;\n  color: #fff;\n  border-color: var(--border-hover);\n}`
);

// Ensure chip-status has flex centering
css = css.replace(
  /\.chip-status\s*\{[\s\S]*?\}/,
  `.chip-status {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 14px;\n  height: 14px;\n  flex-shrink: 0;\n}`
);

// Ensure remap-arrow has flex centering
if (!css.includes('.remap-arrow {')) {
  css += `\n.remap-arrow {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--text-muted);\n  flex-shrink: 0;\n}\n`;
}

// Ensure stremio-logo-badge is flex centered
if (!css.includes('.stremio-logo-badge {')) {
  css += `\n.stremio-logo-badge {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n`;
}

fs.writeFileSync('src/web/public/style.css', css, 'utf8');
console.log('src/web/public/style.css updated successfully.');

console.log('All files standardized successfully!');
