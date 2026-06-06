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
    isDark: state.isDark,
    introMode: state.introMode,
    _user: WILDEX_USER || null
  };
  localStorage.setItem(key, JSON.stringify(data));
}

function upgradeToProDemo() {
  state.isPro = true;
  saveState();
  updateProUI();
  closeFreemium();
  alert('Welcome to WildDex Pro! All features unlocked.');
}

function updateProUI() {
  // Update nav Pro item
  const navPro = document.getElementById('nav-pro');
  if (navPro && state.isPro) {
    navPro.classList.add('nav-pro');
    const label = navPro.querySelector('.nav-pro-label');
    if (label && !label.querySelector('.nav-pro-star')) {
      label.innerHTML = 'Pro <span class="nav-pro-star">⭐</span>';
    }
  }
  // Update scan counter
  const scanCounters = document.querySelectorAll('.scan-counter-value');
  scanCounters.forEach(el => {
    if (state.isPro) {
      el.textContent = 'PRO \u221E';
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
  if (pageId === 'home') navItems[0].classList.add('active');
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
  if (!state.isPro && state.scansUsed >= state.scansMax) {
    showFreemium();
    return;
  }
  document.getElementById('page-reveal').classList.add('hidden');
  document.getElementById('model-loading').style.display = 'none';
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
  document.getElementById('page-reveal').classList.add('hidden');
  stopCamera();
  showPage('subscription');
}

// Home
function renderHome() {
  const counterEl = document.getElementById('scan-counter');
  if (state.isPro) {
    counterEl.textContent = 'PRO \u221E';
    counterEl.style.color = 'var(--day-accent)';
  } else {
    counterEl.textContent = state.scansUsed + ' / ' + state.scansMax;
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
  updateProUI();
  renderHome();
  initIntro();
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('active');
    });
  });
});
