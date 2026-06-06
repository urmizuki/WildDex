// App State & Navigation

function toggleTheme() {
  state.isDark = !state.isDark;
  document.body.setAttribute('data-theme', state.isDark ? 'night' : 'day');
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
}

function goHome() {
  document.getElementById('page-reveal').classList.add('hidden');
  stopCamera();
  showPage('home');
  renderHome();
}

function goScan() {
  if (state.scansUsed >= state.scansMax) {
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

// Home
function renderHome() {
  document.getElementById('scan-counter').textContent = state.scansUsed + ' / ' + state.scansMax;
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
  renderHome();
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('active');
    });
  });
});
