// Collection Logic

function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const countEl = document.getElementById('collection-count');
  const exportBar = document.getElementById('collection-export-bar');
  const exportBtn = document.getElementById('export-pdf-btn');
  const exportLocked = document.getElementById('export-pdf-locked');
  const totalSpecies = SPECIES.length;
  const collected = state.collection.length;

  countEl.innerHTML = `<span>${collected}</span> / ${totalSpecies}`;

  const pct = Math.min((collected / totalSpecies) * 100, 100);
  const progressFill = document.getElementById('collection-progress-fill');
  if (progressFill) progressFill.style.width = pct + '%';

  const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'legendary': 4 };
  let rarest = null;
  let maxRarity = 0;
  state.collection.forEach(id => {
    const s = SPECIES.find(sp => sp.id === id);
    if (s && rarityOrder[s.rarity] > maxRarity) {
      maxRarity = rarityOrder[s.rarity];
      rarest = s;
    }
  });
  const elCards = document.getElementById('stat-cards');
  const elRarest = document.getElementById('stat-rarest');
  const elScans = document.getElementById('stat-scans');
  if (elCards) elCards.textContent = collected;
  if (elRarest) elRarest.textContent = rarest ? rarest.name : '—';
  if (elScans) elScans.textContent = state.scansUsed;

  grid.innerHTML = '';

  if (state.isPro) {
    exportBtn.style.display = 'inline-flex';
    exportLocked.style.display = 'none';
  } else {
    exportBtn.style.display = 'none';
    exportLocked.style.display = 'inline-flex';
  }

  const filtered = SPECIES.filter(s => {
    if (state.currentFilter === 'all') return true;
    if (state.currentFilter === 'owned') return state.collection.includes(s.id);
    return s.rarity === state.currentFilter;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="collection-empty">
        <svg class="collection-empty-icon" viewBox="0 0 32 32" style="image-rendering: pixelated;">
          <rect x="14" y="2" width="4" height="4" fill="#4ADE80"/>
          <rect x="10" y="6" width="12" height="4" fill="#22C55E"/>
          <rect x="6" y="10" width="20" height="4" fill="#16A34A"/>
          <rect x="14" y="14" width="4" height="18" fill="#92400E"/>
        </svg>
        <div class="collection-empty-text">Nothing here yet</div>
        <div class="collection-empty-sub">
          ${state.currentFilter === 'owned'
            ? 'Go scan some trees to build your collection!'
            : state.currentFilter === 'all'
              ? 'No species match this filter.'
              : 'No ' + state.currentFilter + ' species found.'}
        </div>
      </div>
    `;
    return;
  }

  filtered.forEach((species, index) => {
    const isOwned = state.collection.includes(species.id);
    const isLocked = !state.isPro && !isOwned && (species.rarity === 'rare' || species.rarity === 'legendary');
    const card = document.createElement('div');

    let cls = 'collection-card';
    if (isOwned) cls += ' owned';
    else if (isLocked) cls += ' locked';
    else cls += ' undiscovered';
    card.className = cls;

    card.style.animationDelay = (index * 40) + 'ms';

    const isHolo = state.isPro && isOwned && (species.rarity === 'rare' || species.rarity === 'legendary');
    if (isHolo) card.classList.add('holo');

    // Build SVG pixel art
    const pixelSvg = species.pixels.map(p =>
      `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.c}"/>`
    ).join('');

    const svg = `
      <svg viewBox="0 0 32 32" width="80" height="80" style="image-rendering: pixelated;">
        ${pixelSvg}
      </svg>
    `;

    // Locked silhouette
    const silhouette = `
      <svg class="silhouette" viewBox="0 0 32 32" width="80" height="80" style="image-rendering: pixelated;">
        ${species.pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#1A1A1A"/>`).join('')}
      </svg>
    `;

    const consClass = species.conservation.replace(/\s+/g, '-');
    const consLabel = species.conservation;

    if (isOwned) {
      card.innerHTML = `
        <div class="collection-card-image">
          ${svg}
        </div>
        <div class="collection-card-info">
          <div class="collection-card-top">
            <div class="collection-card-name">${species.name}</div>
            <div class="collection-card-rarity ${species.rarity}">${species.rarity}</div>
          </div>
          <div class="collection-card-species">${species.species}</div>
          <div class="collection-card-bottom">
            <div class="collection-card-conservation ${consClass}">${consLabel}</div>
            <div class="collection-card-stat">${species.height}</div>
          </div>
        </div>
      `;
      card.onclick = () => showDetail(species);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${species.name} details`);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') showDetail(species); };
    } else if (isLocked) {
      card.innerHTML = `
        <div class="collection-card-image">
          ${silhouette}
          <div class="lock-overlay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <div class="lock-text">Pro Only</div>
          </div>
        </div>
        <div class="collection-card-info">
          <div class="collection-card-top">
            <div class="collection-card-name">???</div>
            <div class="collection-card-rarity ${species.rarity}">${species.rarity}</div>
          </div>
          <div class="collection-card-species" style="opacity:0.4;">${species.species}</div>
        </div>
      `;
      card.onclick = () => showFreemium();
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${species.name} locked. Upgrade to Pro.`);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') showFreemium(); };
    } else {
      // undiscovered — show desaturated preview
      card.innerHTML = `
        <div class="collection-card-image undiscovered-img">
          ${svg}
        </div>
        <div class="collection-card-info">
          <div class="collection-card-top">
            <div class="collection-card-name" style="color: var(--day-muted);">???</div>
            <div class="collection-card-rarity ${species.rarity}">${species.rarity}</div>
          </div>
          <div class="collection-card-species" style="opacity:0.5;">${species.species}</div>
        </div>
      `;
    }

    grid.appendChild(card);
  });
}

function filterCollection(filter) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => {
    const isActive = b.dataset.filter === filter;
    b.classList.toggle('active', isActive);
  });
  renderCollection();
}

/* ===== Herbarium Helpers ===== */

function toggleFlipCard(card) {
  card.classList.toggle('flipped');
}

function switchHerbariumTab(e, tab) {
  e.stopPropagation();
  const back = e.target.closest('.flip-card-back');
  if (!back) return;
  back.querySelectorAll('.herbarium-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  back.querySelectorAll('.herbarium-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
}

function getConservationGauge(status) {
  const levels = ['Critically Endangered','Endangered','Vulnerable','Near Threatened','Least Concern'];
  const idx = levels.indexOf(status);
  const filled = idx >= 0 ? idx + 1 : 3;
  let bars = '';
  for (let i = 0; i < 5; i++) {
    const active = i < filled ? 'active' : '';
    const color = i < 2 ? 'danger' : i < 3 ? 'warn' : 'safe';
    bars += `<div class="gauge-block ${active} ${color}"></div>`;
  }
  return bars;
}

function getConservationNote(status) {
  const notes = {
    'Critically Endangered': 'Immediate action required. Population declining.',
    'Endangered': 'High risk of extinction in the wild.',
    'Vulnerable': 'Facing high risk of endangerment.',
    'Near Threatened': 'Close to qualifying for threatened status.',
    'Least Concern': 'Widespread and abundant.'
  };
  return notes[status] || 'Status under review.';
}

function getFamily(name) {
  const families = {
    'Meranti': 'Dipterocarpaceae',
    'Keruing': 'Dipterocarpaceae',
    'Rubber Tree': 'Euphorbiaceae',
    'Jati': 'Lamiaceae',
    'Kulai': 'Malvaceae',
    'Durian Tree': 'Malvaceae',
    'Cengal': 'Dipterocarpaceae',
    'Tualang': 'Fabaceae',
    'Rafflesia': 'Rafflesiaceae',
    'Banyan': 'Moraceae'
  };
  return families[name] || 'Unknown';
}

function getOrder(name) {
  const orders = {
    'Meranti': 'Malvales',
    'Keruing': 'Malvales',
    'Rubber Tree': 'Malpighiales',
    'Jati': 'Lamiales',
    'Kulai': 'Malvales',
    'Durian Tree': 'Malvales',
    'Cengal': 'Malvales',
    'Tualang': 'Fabales',
    'Rafflesia': 'Malpighiales',
    'Banyan': 'Rosales'
  };
  return orders[name] || 'Unknown';
}

function getCarbon(heightStr) {
  // Rough estimate: taller trees sequester more carbon
  const m = parseInt(heightStr);
  if (isNaN(m)) return '~120 kg/yr';
  const kg = Math.round(m * 3.5);
  return `~${kg} kg/yr`;
}
