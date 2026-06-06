// Collection Logic

function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const countEl = document.getElementById('collection-count');
  const exportBar = document.getElementById('collection-export-bar');
  const exportBtn = document.getElementById('export-pdf-btn');
  const exportLocked = document.getElementById('export-pdf-locked');
  
  countEl.textContent = state.collection.length;
  grid.innerHTML = '';
  
  // Show/hide export button based on pro status
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
  
  filtered.forEach((species, index) => {
    const isOwned = state.collection.includes(species.id);
    const isLocked = !state.isPro && (species.rarity === 'rare' || species.rarity === 'legendary');
    const card = document.createElement('div');
    card.className = `collection-card ${isOwned ? 'owned' : 'missing'} ${isLocked ? 'locked' : ''}`;
    card.style.animationDelay = (index * 50) + 'ms';
    
    // Holographic effect for pro users on rare/legendary
    const isHolo = state.isPro && isOwned && (species.rarity === 'rare' || species.rarity === 'legendary');
    if (isHolo) {
      card.classList.add('holo');
    }
    
    let cardContent = '';
    if (isLocked) {
      // Silhouette for locked cards
      cardContent = `
        <div class="collection-card-image">
          <svg viewBox="0 0 32 32" width="80" height="80" class="pixelated silhouette" style="image-rendering: pixelated;">
            ${species.pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#1A1A1A"/>`).join('')}
          </svg>
          <div class="lock-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <div class="lock-text">Pro Only</div>
          </div>
        </div>
        <div class="collection-card-info">
          <div class="collection-card-name">${species.name}</div>
          <div class="collection-card-rarity ${species.rarity}">${species.rarity}</div>
        </div>
      `;
    } else {
      cardContent = `
        <div class="collection-card-image">
          <svg viewBox="0 0 32 32" width="80" height="80" class="pixelated" style="image-rendering: pixelated;">
            ${species.pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.c}"/>`).join('')}
          </svg>
        </div>
        <div class="collection-card-info">
          <div class="collection-card-name">${species.name}</div>
          <div class="collection-card-rarity ${species.rarity}">${species.rarity}</div>
          ${isOwned ? `<div class="collection-card-stat">${species.height} &middot; ${species.age}</div>` : ''}
        </div>
      `;
    }
    
    card.innerHTML = cardContent;
    
    if (isOwned && !isLocked) {
      card.onclick = () => showDetail(species);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${species.name} details`);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') showDetail(species); };
    } else if (isLocked) {
      card.onclick = () => showFreemium();
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${species.name} locked. Upgrade to Pro.`);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') showFreemium(); };
    }
    grid.appendChild(card);
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No cards found in this filter.</div>';
  }
}

function filterCollection(filter) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => {
    const isActive = b.dataset.filter === filter;
    b.classList.toggle('active', isActive);
  });
  renderCollection();
}
