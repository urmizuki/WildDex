// Collection Logic

function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const countEl = document.getElementById('collection-count');
  countEl.textContent = state.collection.length;
  grid.innerHTML = '';
  
  const filtered = SPECIES.filter(s => {
    if (state.currentFilter === 'all') return true;
    if (state.currentFilter === 'owned') return state.collection.includes(s.id);
    return s.rarity === state.currentFilter;
  });
  
  filtered.forEach((species, index) => {
    const isOwned = state.collection.includes(species.id);
    const card = document.createElement('div');
    card.className = `collection-card ${isOwned ? 'owned' : 'missing'}`;
    card.style.animationDelay = (index * 50) + 'ms';
    card.innerHTML = `
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
    if (isOwned) {
      card.onclick = () => showDetail(species);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${species.name} details`);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') showDetail(species); };
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
