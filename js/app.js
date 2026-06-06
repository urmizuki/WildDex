// App State & Navigation

function toggleTheme() {
  state.isDark = !state.isDark;
  document.body.setAttribute('data-theme', state.isDark ? 'night' : 'day');
  saveState();
}

function saveState() {
  const data = {
    isPro: state.isPro,
    scansUsed: state.scansUsed,
    collection: state.collection,
    isDark: state.isDark
  };
  localStorage.setItem('wilddex-state', JSON.stringify(data));
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

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (state.isDark) {
    document.body.setAttribute('data-theme', 'night');
  }
  updateProUI();
  renderHome();
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('active');
    });
  });
});
