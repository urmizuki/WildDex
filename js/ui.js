// UI Components - Modals, Theme, Detail View

function showDetail(species) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay detail-modal';
  modal.id = 'detail-modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 300px;">
      <button class="modal-close" onclick="closeDetail()" aria-label="Close">X</button>
      <div style="margin: 0 auto; width: 200px;">
        <div class="card-scene" style="width: 200px; height: 280px;">
          <div class="card-wrapper" style="transform: rotateY(180deg);">
            <div class="card-face card-back" style="position: absolute;">
              <div class="card-image-area" style="height: 55%;">
                <div class="card-rarity-badge ${species.rarity}">${species.rarity}</div>
                <div class="card-conservation-badge ${species.conservation.replace(' ', '-')}" style="position: absolute; top: 8px; left: 8px;">⚠ ${species.conservation}</div>
                <svg viewBox="0 0 32 32" width="100%" height="100%" class="pixelated" style="image-rendering: pixelated;">
                  ${species.pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.c}"/>`).join('')}
                </svg>
              </div>
              <div class="card-info">
                <div class="card-name">${species.name}</div>
                <div class="card-species">${species.species}</div>
                <div class="card-stats">
                  <div class="card-stat"><div class="card-stat-label">Height</div><div class="card-stat-value">${species.height}</div></div>
                  <div class="card-stat"><div class="card-stat-label">Age</div><div class="card-stat-value">${species.age}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="font-size: 20px; color: var(--day-muted); line-height: 1.4; margin-top: 16px;">${species.description}</div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.classList.add('active');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDetail();
  });
}

function closeDetail() {
  const modal = document.getElementById('detail-modal');
  if (modal) modal.remove();
}

function showFreemium() {
  document.getElementById('freemium-modal').classList.add('active');
  document.querySelector('.scan-container').classList.add('shake');
  setTimeout(() => document.querySelector('.scan-container').classList.remove('shake'), 400);
}

function closeFreemium() {
  document.getElementById('freemium-modal').classList.remove('active');
}

function renderProfile() {
  const totalCards = state.collection.length;
  const totalScans = state.scansUsed;
  
  // Find rarest card
  const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'legendary': 4 };
  let rarest = null;
  let maxRarity = 0;
  state.collection.forEach(id => {
    const species = SPECIES.find(s => s.id === id);
    if (species && rarityOrder[species.rarity] > maxRarity) {
      maxRarity = rarityOrder[species.rarity];
      rarest = species;
    }
  });
  
  document.getElementById('profile-cards').textContent = totalCards;
  document.getElementById('profile-scans').textContent = totalScans;
  document.getElementById('profile-rarest').textContent = rarest ? rarest.name : '-';
  
  const progress = (totalCards / 10) * 100;
  document.getElementById('profile-progress').style.width = progress + '%';
  document.getElementById('profile-progress-count').textContent = totalCards;
  
  // Badges
  const badgeFirst = document.getElementById('badge-first');
  const badgeRare = document.getElementById('badge-rare');
  const badgeFull = document.getElementById('badge-full');
  
  if (totalScans > 0) {
    badgeFirst.classList.add('unlocked');
    badgeFirst.classList.remove('locked');
  } else {
    badgeFirst.classList.add('locked');
    badgeFirst.classList.remove('unlocked');
  }
  
  if (maxRarity >= 3) {
    badgeRare.classList.add('unlocked');
    badgeRare.classList.remove('locked');
  } else {
    badgeRare.classList.add('locked');
    badgeRare.classList.remove('unlocked');
  }
  
  if (totalCards >= 10) {
    badgeFull.classList.add('unlocked');
    badgeFull.classList.remove('locked');
  } else {
    badgeFull.classList.add('locked');
    badgeFull.classList.remove('unlocked');
  }
}

function exportCollectionToPDF() {
  if (!state.isPro) {
    showFreemium();
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(45, 106, 79);
  doc.text('WildDex Collection Report', 105, 20, { align: 'center' });
  
  // Subheader
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const date = new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated: ${date} | WildDex Pro Member`, 105, 30, { align: 'center' });
  
  // Table header
  const startY = 45;
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(45, 106, 79);
  doc.rect(10, startY - 5, 190, 8, 'F');
  doc.text('Name', 15, startY);
  doc.text('Scientific Name', 60, startY);
  doc.text('Rarity', 120, startY);
  doc.text('Height', 145, startY);
  doc.text('Age', 170, startY);
  
  // Table rows
  let y = startY + 8;
  const ownedSpecies = SPECIES.filter(s => state.collection.includes(s.id));
  
  ownedSpecies.forEach((species, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(245, 253, 244);
      doc.rect(10, y - 5, 190, 8, 'F');
    }
    doc.setTextColor(0, 0, 0);
    doc.text(species.name, 15, y);
    doc.text(species.species, 60, y);
    doc.text(species.rarity, 120, y);
    doc.text(species.height, 145, y);
    doc.text(species.age, 170, y);
    y += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by WildDex - AI Tree Species Identifier', 105, 280, { align: 'center' });
  
  doc.save('wilddex-collection.pdf');
}
