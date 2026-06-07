// App State & Navigation

function toggleTheme() {
  state.isDark = !state.isDark;
  document.body.setAttribute('data-theme', state.isDark ? 'night' : 'day');
  saveState();
}

function saveState() {
  const key = WILDEX_USER ? `wilddex-state-${WILDEX_USER}` : 'wilddex-state';
  const data = {
    isPro: state.isPro,
    scansUsed: state.scansUsed,
    collection: state.collection,
    journal: state.journal,
    isDark: state.isDark,
    introMode: state.introMode,
    expeditionScans: state.expeditionScans,
    expeditionTier: state.expeditionTier,
    unlockedFeatures: state.unlockedFeatures,
    _user: WILDEX_USER || null
  };
  localStorage.setItem(key, JSON.stringify(data));
}

function upgradeToProDemo() {
  state.isPro = true;
  saveState();
  updateProUI();
  renderSubscription();
  closeFreemium();
}

function downgradeToFree() {
  state.isPro = false;
  saveState();
  updateProUI();
  renderSubscription();
}

function updateProUI() {
  // Update expedition badge
  updateExpeditionUI();
  // Update scan counter
  const scanCounters = document.querySelectorAll('.scan-counter-value');
  scanCounters.forEach(el => {
    if (state.isPro) {
      el.textContent = state.expeditionTier === 'seedling' ? state.scansUsed + ' / ' + state.scansMax : state.scansUsed + ' / \u221E';
      el.style.color = 'var(--day-accent)';
    } else {
      el.textContent = state.scansUsed + ' / ' + state.scansMax;
      el.style.color = '';
    }
  });
  // Re-render collection if on that page
  if (document.getElementById('page-collection').classList.contains('active')) {
    renderCollection();
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    if (pageId === 'reveal') page.classList.remove('hidden');
  }
  
  const navItems = document.querySelectorAll('.nav-item');
  if (pageId === 'home' || pageId === 'impact' || pageId === 'journal') navItems[0].classList.add('active');
  if (pageId === 'scan') navItems[1].classList.add('active');
  if (pageId === 'collection') navItems[2].classList.add('active');
  if (pageId === 'profile') navItems[3].classList.add('active');
  if (pageId === 'subscription') navItems[4].classList.add('active');
}

function goHome() {
  document.getElementById('page-reveal').classList.add('hidden');
  stopCamera();
  showPage('home');
  renderHome();
}

function goScan() {
  const tier = EXPEDITION_TIERS.find(t => t.id === state.expeditionTier) || EXPEDITION_TIERS[0];
  if (state.scansUsed >= tier.scansMax && !state.isPro) {
    showFreemium();
    return;
  }
  document.getElementById('page-reveal').classList.add('hidden');
  document.getElementById('model-loading').style.display = 'none';

  // Reset scan HUD state
  const hud = document.getElementById('scan-hud');
  const beam = document.getElementById('scan-hud-beam');
  const flash = document.getElementById('scan-detected-flash');
  if (hud) hud.style.display = 'none';
  if (beam) beam.classList.remove('active');
  if (flash) flash.classList.remove('active');

  // Reset data lines
  const dataLines = document.querySelectorAll('.scan-hud-data-line');
  const defaultLabels = ['BARK TEXTURE: SCANNING_', 'LEAF MORPHOLOGY: --', 'DBH ESTIMATE: --', 'CONFIDENCE: --'];
  dataLines.forEach((line, i) => {
    line.textContent = defaultLabels[i] || '';
    line.setAttribute('data-status', i === 0 ? 'scanning' : 'waiting');
    if (i === 3) line.style.display = 'none';
  });

  // Update expedition scan badge
  updateScanExpeditionBadge();

  showPage('scan');
  initCamera();
  loadTMModel();
}

function goCollection() {
  document.getElementById('page-reveal').classList.add('hidden');
  stopCamera();
  showPage('collection');
  renderCollection();
}

function goReveal() {
  showPage('reveal');
}

function goProfile() {
  document.getElementById('page-reveal').classList.add('hidden');
  stopCamera();
  showPage('profile');
  renderProfile();
}

function goSubscription() {
  showPage('subscription');
  if (typeof renderSubscription === 'function') renderSubscription();
}

function goImpact() {
  document.getElementById('page-reveal').classList.add('hidden');
  stopCamera();
  showPage('impact');
  renderImpact();
}

function goJournal() {
  document.getElementById('page-reveal').classList.add('hidden');
  stopCamera();
  showPage('journal');
  renderJournal();
}

// Home
function renderHome() {
  const counterEl = document.getElementById('scan-counter');
  const tier = EXPEDITION_TIERS.find(t => t.id === state.expeditionTier) || EXPEDITION_TIERS[0];
  if (state.isPro) {
    counterEl.textContent = state.scansUsed + ' / \u221E';
    counterEl.style.color = tier.color;
  } else {
    counterEl.textContent = state.scansUsed + ' / ' + tier.scansMax;
    counterEl.style.color = '';
  }
  const recentEl = document.getElementById('recent-finds');
  recentEl.innerHTML = '';
  const recent = [...state.collection].reverse().slice(0, 5);
  recent.forEach((id, index) => {
    const species = SPECIES.find(s => s.id === id);
    if (!species) return;
    const card = document.createElement('div');
    card.className = 'mini-card';
    card.style.animationDelay = (index * 50) + 'ms';
    card.innerHTML = `
      <svg viewBox="0 0 32 32" width="48" height="48" class="pixelated" style="image-rendering: pixelated;">
        ${species.pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.c}"/>`).join('')}
      </svg>
      <div class="mini-card-name">${species.name}</div>
    `;
    card.onclick = () => showDetail(species);
    recentEl.appendChild(card);
  });
  if (recent.length === 0) {
    recentEl.innerHTML = '<div style="color: var(--day-muted); font-size: 18px;">No cards yet. Start scanning!</div>';
  }
}

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDetail();
    closeFreemium();
  }
});

// Intro Animation
function initIntro() {
  const introOverlay = document.getElementById('intro-overlay');
  if (!introOverlay) return;

  // Handle dismiss
  function dismissIntro() {
    introOverlay.classList.add('exiting');
    setTimeout(() => {
      introOverlay.classList.add('hidden');
      introOverlay.classList.remove('exiting');
    }, 800);
  }

  // Check which intro mode to show (default: jungle)
  const introMode = state.introMode || 'jungle';

  if (introMode === 'scanner') {
    // Show scanner intro
    const jungleScene = document.getElementById('intro-jungle');
    const scannerScene = document.getElementById('intro-scanner');
    const cardScene = document.getElementById('intro-card-summon');
    if (jungleScene) jungleScene.style.display = 'none';
    if (cardScene) cardScene.style.display = 'none';
    if (scannerScene) scannerScene.style.display = 'block';

    // Update scanner status text
    const statusEl = document.getElementById('scanner-status');
    if (statusEl) {
      setTimeout(() => { statusEl.textContent = 'Calibrating...'; }, 1500);
      setTimeout(() => { statusEl.textContent = 'Scanning...'; }, 2500);
      setTimeout(() => { statusEl.textContent = 'Analyzing...'; }, 3500);
    }

    // Auto-dismiss after 5 seconds
    setTimeout(dismissIntro, 5000);
  } else if (introMode === 'card') {
    // Show card summoning intro
    const jungleScene = document.getElementById('intro-jungle');
    const scannerScene = document.getElementById('intro-scanner');
    const cardScene = document.getElementById('intro-card-summon');
    if (jungleScene) jungleScene.style.display = 'none';
    if (scannerScene) scannerScene.style.display = 'none';
    if (cardScene) cardScene.style.display = 'flex';

    // Generate card particles
    const particlesContainer = document.getElementById('intro-card-particles');
    if (particlesContainer) {
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'intro-card-particle';
        particle.style.left = (Math.random() * 100) + '%';
        particle.style.top = (Math.random() * 100) + '%';
        particle.style.animationDelay = (Math.random() * 2) + 's';
        particle.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        particlesContainer.appendChild(particle);
      }
    }

    // Trigger card flip after appearance
    const cardWrapper = document.getElementById('intro-card-wrapper');
    if (cardWrapper) {
      setTimeout(() => {
        cardWrapper.classList.add('flipping');
      }, 1500);
    }

    // Auto-dismiss after 5.5 seconds
    setTimeout(dismissIntro, 5500);
  } else {
    // Show jungle intro (default)
    const jungleScene = document.getElementById('intro-jungle');
    const scannerScene = document.getElementById('intro-scanner');
    const cardScene = document.getElementById('intro-card-summon');
    if (jungleScene) jungleScene.style.display = 'block';
    if (scannerScene) scannerScene.style.display = 'none';
    if (cardScene) cardScene.style.display = 'none';

    const treesContainer = document.getElementById('intro-trees');
    const firefliesContainer = document.getElementById('intro-fireflies');
    if (!treesContainer) return;

    // Generate pixel trees with more variety
    const treeConfigs = [
      { left: 5, w: 28, h: 140, color: '#2D6A4F', trunk: '#5D4037', layers: 4 },
      { left: 15, w: 22, h: 110, color: '#1B4332', trunk: '#6D4C41', layers: 3 },
      { left: 25, w: 32, h: 160, color: '#4ADE80', trunk: '#5D4037', layers: 5 },
      { left: 35, w: 20, h: 90, color: '#22C55E', trunk: '#6D4C41', layers: 3 },
      { left: 45, w: 26, h: 130, color: '#16A34A', trunk: '#5D4037', layers: 4 },
      { left: 55, w: 24, h: 120, color: '#2D6A4F', trunk: '#6D4C41', layers: 4 },
      { left: 65, w: 30, h: 150, color: '#1B4332', trunk: '#5D4037', layers: 5 },
      { left: 75, w: 18, h: 80, color: '#4ADE80', trunk: '#6D4C41', layers: 3 },
      { left: 85, w: 28, h: 140, color: '#22C55E', trunk: '#5D4037', layers: 4 },
      { left: 95, w: 20, h: 100, color: '#16A34A', trunk: '#6D4C41', layers: 3 }
    ];

    treeConfigs.forEach((config, i) => {
      const tree = document.createElement('div');
      tree.className = 'intro-tree';
      tree.style.left = config.left + '%';
      tree.style.width = config.w + 'px';
      tree.style.height = config.h + 'px';
      tree.style.animationDelay = (0.3 + i * 0.12) + 's';
      
      // Create more detailed pixel tree SVG
      const trunkW = Math.max(4, Math.floor(config.w / 5));
      const trunkX = Math.floor((config.w - trunkW) / 2);
      const trunkH = 20;
      const foliageH = config.h - trunkH;
      const layerH = Math.floor(foliageH / config.layers);
      
      let rects = [];
      // Trunk
      rects.push(`<rect x="${trunkX}" y="${foliageH}" width="${trunkW}" height="${trunkH}" fill="${config.trunk}"/>`);
      
      // Foliage layers with varying widths
      for (let l = 0; l < config.layers; l++) {
        const y = foliageH - (l + 1) * layerH;
        const layerWidth = config.w - 4 - (l * 2);
        const layerX = Math.floor((config.w - layerWidth) / 2);
        const layerColor = l === 0 ? config.color : 
                          l === 1 ? config.color : 
                          l === config.layers - 1 ? config.color : 
                          config.color;
        
        // Add some texture variation
        rects.push(`<rect x="${layerX}" y="${y}" width="${layerWidth}" height="${layerH}" fill="${layerColor}"/>`);
        
        // Add highlight pixels
        if (l < config.layers - 1) {
          rects.push(`<rect x="${layerX + 2}" y="${y + 2}" width="${Math.floor(layerWidth/3)}" height="2" fill="${config.color === '#4ADE80' ? '#86EFAC' : '#4ADE80'}"/>`);
        }
      }
      
      // Top detail
      rects.push(`<rect x="${Math.floor(config.w/2)-2}" y="0" width="4" height="${layerH}" fill="${config.color}"/>`);
      
      tree.innerHTML = `
        <svg viewBox="0 0 ${config.w} ${config.h}" width="${config.w}" height="${config.h}" class="pixelated">
          ${rects.join('')}
        </svg>
      `;
      treesContainer.appendChild(tree);
    });

    // Generate fireflies
    for (let i = 0; i < 12; i++) {
      const firefly = document.createElement('div');
      firefly.className = 'intro-firefly';
      firefly.style.left = (10 + Math.random() * 80) + '%';
      firefly.style.top = (20 + Math.random() * 60) + '%';
      firefly.style.animationDelay = (Math.random() * 2) + 's';
      firefly.style.animationDuration = (2 + Math.random() * 2) + 's';
      firefliesContainer.appendChild(firefly);
    }

    // Auto-dismiss after 5 seconds
    setTimeout(dismissIntro, 5000);
  }

  // Handle tap to dismiss (works for both modes)
  introOverlay.addEventListener('click', dismissIntro);
  introOverlay.addEventListener('touchstart', dismissIntro);
}

// Set intro mode (call before initIntro)
// Options: 'jungle', 'scanner', 'card'
function setIntroMode(mode) {
  if (['jungle', 'scanner', 'card'].includes(mode)) {
    state.introMode = mode;
    saveState();
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (!WILDEX_USER) {
    window.location.href = '/login';
    return;
  }
  if (state.isDark) {
    document.body.setAttribute('data-theme', 'night');
  }
  // Retroactive: populate journal from collection if empty
  console.log('[WildDex] Init check — collection:', state.collection.length, 'journal:', state.journal ? state.journal.length : 'undefined');
  if ((!state.journal || state.journal.length === 0) && state.collection.length > 0) {
    state.journal = state.collection.map((id, index) => {
      const s = SPECIES.find(sp => sp.id === id);
      if (!s) return null;
      return {
        id: s.id,
        name: s.name,
        species: s.species,
        rarity: s.rarity,
        conservation: s.conservation,
        timestamp: Date.now() - (state.collection.length - index) * 86400000,
        specimenId: btoa(s.id + '-' + index).substring(0, 8).toUpperCase(),
        confidence: 0.85,
        location: 'Malaysia'
      };
    }).filter(Boolean);
    saveState();
    console.log('[WildDex] Retroactive journal fill:', state.journal.length, 'entries');
  }
  updateProUI();
  updateExpeditionUI();
  updateScanExpeditionBadge();
  renderHome();
  renderSubscription();
  initIntro();
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('active');
    });
  });

  // URL-triggered unlock: append ?unlock=max to URL for demo (one-shot)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('unlock') === 'max' && state.collection.length < 10) {
    state.collection = ['meranti','keruing','rubber','jati','kulai','durian','cengal','tualang','rafflesia','banyan'];
    state.scansUsed = 999;
    state.scansMax = 9999;
    state.isPro = true;
    state.expeditionScans = 999;
    state.expeditionTier = 'ranger';
    state.unlockedFeatures = ['expedition-hud','tag-seen','unlimited-scans','night-vision','global-leaderboard'];
    state.journal = state.collection.map((id, index) => {
      const s = SPECIES.find(sp => sp.id === id);
      if (!s) return null;
      return {
        id: s.id, name: s.name, rarity: s.rarity, species: s.species,
        specimenId: btoa(s.id + '-' + Date.now()).substring(0, 8).toUpperCase(),
        timestamp: Date.now() - (state.collection.length - index) * 86400000,
        confidence: 95 + Math.floor(Math.random() * 5),
        location: 'Taman Negara, Pahang'
      };
    }).filter(Boolean);
    saveState();
    window.location.href = window.location.pathname + window.location.hash;
  }
});

/* ===== Impact Dashboard ===== */

function renderImpact() {
  const statsEl = document.getElementById('impact-stats');
  const bioEl = document.getElementById('impact-biodiversity');
  const carbonEl = document.getElementById('impact-carbon');
  const milestoneEl = document.getElementById('impact-milestones');

  const totalSpecies = SPECIES.length;
  const collected = state.collection.length;
  const pct = Math.round((collected / totalSpecies) * 100);

  // Expedition progress
  const expProgress = getExpeditionProgress();

  // Count rare/legendary
  let rareCount = 0;
  let legendaryCount = 0;
  let totalCarbon = 0;
  state.collection.forEach(id => {
    const s = SPECIES.find(sp => sp.id === id);
    if (!s) return;
    if (s.rarity === 'rare') rareCount++;
    if (s.rarity === 'legendary') legendaryCount++;
    const h = parseInt(s.height);
    if (!isNaN(h)) totalCarbon += Math.round(h * 3.5);
  });

  // Stat tiles
  const tierLabel = state.expeditionTier === 'researcher' || state.expeditionTier === 'ranger'
    ? 'Field Researcher'
    : expProgress.current.name;
  statsEl.innerHTML = `
    <div class="impact-stat">
      <div class="impact-stat-value">${collected}/${totalSpecies}</div>
      <div class="impact-stat-label">Species Found</div>
    </div>
    <div class="impact-stat">
      <div class="impact-stat-value">${rareCount + legendaryCount}</div>
      <div class="impact-stat-label">Rare Protected</div>
    </div>
    <div class="impact-stat">
      <div class="impact-stat-value">${totalCarbon}</div>
      <div class="impact-stat-label">kg CO₂/yr</div>
    </div>
    <div class="impact-stat">
      <div class="impact-stat-value">${state.expeditionScans}</div>
      <div class="impact-stat-label">Scans Done</div>
    </div>
  `;

  // Expedition tier badge
  const headerEl = document.querySelector('.impact-header');
  if (headerEl && !headerEl.querySelector('.expedition-tier-badge')) {
    const badge = document.createElement('div');
    badge.className = 'expedition-tier-badge';
    badge.style.color = expProgress.current.color;
    badge.innerHTML = `<span class="expedition-tier-label">${tierLabel}</span>`;
    headerEl.appendChild(badge);
  }

  // Expedition progress bar
  const progressContainer = document.getElementById('impact-expedition-progress');
  if (progressContainer) {
    if (expProgress.next) {
      progressContainer.innerHTML = `
        <div class="pixel-bar-row">
          <div class="pixel-bar-label">Next: ${expProgress.next.name}</div>
          <div class="pixel-bar-track">${renderPixelBlocks(expProgress.percent, 100, expProgress.current.color)}</div>
          <div class="pixel-bar-value">${expProgress.percent}%</div>
        </div>
        <div style="font-family: var(--font-body); font-size: 14px; color: var(--day-muted); margin-top: 4px;">
          ${expProgress.scansNeeded} more scan${expProgress.scansNeeded !== 1 ? 's' : ''} to unlock ${expProgress.next.name}
        </div>
      `;
    } else {
      progressContainer.innerHTML = `
        <div class="pixel-bar-row">
          <div class="pixel-bar-label">Ranger — Max Tier</div>
          <div class="pixel-bar-track">${renderPixelBlocks(100, 100, '#DC2626')}</div>
          <div class="pixel-bar-value">MAX</div>
        </div>
        <div style="font-family: var(--font-body); font-size: 14px; color: var(--day-muted); margin-top: 4px;">
          All expedition tiers unlocked!
        </div>
      `;
    }
  }

  // Biodiversity bar chart (by rarity)
  const rarityCounts = { common: 0, uncommon: 0, rare: 0, legendary: 0 };
  state.collection.forEach(id => {
    const s = SPECIES.find(sp => sp.id === id);
    if (s) rarityCounts[s.rarity]++;
  });
  const rarityMax = Math.max(...Object.values(rarityCounts), 1);
  bioEl.innerHTML = `
    <div class="pixel-bar-row">
      <div class="pixel-bar-label">Common</div>
      <div class="pixel-bar-track">${renderPixelBlocks(rarityCounts.common, rarityMax, '#6B7280')}</div>
      <div class="pixel-bar-value">${rarityCounts.common}</div>
    </div>
    <div class="pixel-bar-row">
      <div class="pixel-bar-label">Uncommon</div>
      <div class="pixel-bar-track">${renderPixelBlocks(rarityCounts.uncommon, rarityMax, '#2D6A4F')}</div>
      <div class="pixel-bar-value">${rarityCounts.uncommon}</div>
    </div>
    <div class="pixel-bar-row">
      <div class="pixel-bar-label">Rare</div>
      <div class="pixel-bar-track">${renderPixelBlocks(rarityCounts.rare, rarityMax, '#D4AF37')}</div>
      <div class="pixel-bar-value">${rarityCounts.rare}</div>
    </div>
    <div class="pixel-bar-row">
      <div class="pixel-bar-label">Legendary</div>
      <div class="pixel-bar-track">${renderPixelBlocks(rarityCounts.legendary, rarityMax, '#DC2626')}</div>
      <div class="pixel-bar-value">${rarityCounts.legendary}</div>
    </div>
  `;

  // Carbon bar chart (top 5 species by carbon)
  const carbonData = state.collection.map(id => {
    const s = SPECIES.find(sp => sp.id === id);
    if (!s) return null;
    const h = parseInt(s.height);
    return { name: s.name, carbon: isNaN(h) ? 0 : Math.round(h * 3.5) };
  }).filter(Boolean).sort((a, b) => b.carbon - a.carbon).slice(0, 5);
  const carbonMax = Math.max(...carbonData.map(d => d.carbon), 1);
  carbonEl.innerHTML = carbonData.map(d => `
    <div class="pixel-bar-row">
      <div class="pixel-bar-label">${d.name}</div>
      <div class="pixel-bar-track">${renderPixelBlocks(d.carbon, carbonMax, '#16A34A')}</div>
      <div class="pixel-bar-value">${d.carbon}</div>
    </div>
  `).join('') || '<div class="pixel-bar-row"><div class="pixel-bar-label">-</div><div class="pixel-bar-track"></div><div class="pixel-bar-value">0</div></div>';

  // Milestones
  const milestones = [
    { label: 'First Scan', value: state.scansUsed >= 1, icon: '🔍' },
    { label: '10 Scans', value: state.scansUsed >= 10, icon: '🔬' },
    { label: 'First Rare', value: rareCount >= 1, icon: '💎' },
    { label: 'First Legendary', value: legendaryCount >= 1, icon: '👑' },
    { label: 'Half Collection', value: collected >= totalSpecies / 2, icon: '📚' },
    { label: 'Full Collection', value: collected >= totalSpecies, icon: '🏆' },
  ];
  milestoneEl.innerHTML = milestones.map(m => `
    <div class="milestone ${m.value ? 'unlocked' : 'locked'}">
      <div class="milestone-icon">${m.icon}</div>
      <div class="milestone-label">${m.label}</div>
      <div class="milestone-value">${m.value ? 'DONE' : 'LOCK'}</div>
    </div>
  `).join('');
}

function renderPixelBlocks(value, max, color) {
  const total = 20;
  const filled = Math.round((value / max) * total);
  let html = '';
  for (let i = 0; i < total; i++) {
    const active = i < filled ? `background: ${color}; border-color: ${color};` : '';
    html += `<div class="pixel-bar-block" style="${active}"></div>`;
  }
  return html;
}

/* ===== Field Journal ===== */

function renderJournal() {
  const listEl = document.getElementById('journal-list');
  const emptyEl = document.getElementById('journal-empty');

  console.log('[WildDex] renderJournal — entries:', state.journal ? state.journal.length : 0, 'listEl:', !!listEl, 'emptyEl:', !!emptyEl);

  if (!listEl || !emptyEl) {
    console.error('[WildDex] Journal elements not found in DOM');
    return;
  }

  if (!state.journal || state.journal.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  listEl.innerHTML = state.journal.map((entry, index) => {
    const date = new Date(entry.timestamp);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const species = SPECIES.find(s => s.id === entry.id);
    const pixelSvg = species ? species.pixels.map(p =>
      `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.c}"/>`
    ).join('') : '';
    const rarityColor = {
      common: '#6B7280',
      uncommon: '#2D6A4F',
      rare: '#D4AF37',
      legendary: '#DC2626'
    }[entry.rarity] || '#6B7280';

    return `
      <div class="journal-entry" style="animation-delay: ${index * 60}ms;">
        <div class="journal-entry-icon">
          <svg viewBox="0 0 32 32" width="40" height="40" style="image-rendering:pixelated;">
            ${pixelSvg}
          </svg>
        </div>
        <div class="journal-entry-info">
          <div class="journal-entry-top">
            <span class="journal-entry-name">${entry.name}</span>
            <span class="journal-entry-rarity" style="color:${rarityColor};">${entry.rarity}</span>
          </div>
          <div class="journal-entry-meta">
            <span>#${entry.specimenId}</span>
            <span>|</span>
            <span>${dateStr} ${timeStr}</span>
            <span>|</span>
            <span>${Math.round((entry.confidence || 0) * 100)}% AI</span>
          </div>
          <div class="journal-entry-species">${entry.species}</div>
        </div>
        <div class="journal-entry-conservation ${entry.conservation.replace(/\s+/g, '-')}">${entry.conservation}</div>
      </div>
    `;
  }).join('');
}
