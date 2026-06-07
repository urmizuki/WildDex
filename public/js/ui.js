// UI Components - Modals, Theme, Detail View

function showDetail(species) {
  closeDetail(); // remove any existing
  const consClass = species.conservation.replace(/\s+/g, '-');
  const consGauge = getConservationGauge(species.conservation);
  const specimenId = btoa(species.id).substring(0, 8).toUpperCase();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay detail-modal';
  modal.id = 'detail-modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 340px; padding: 20px;">
      <button class="modal-close" onclick="closeDetail()" aria-label="Close">X</button>

      <!-- Big centered flip card -->
      <div class="detail-flip-card" id="detail-flip-card" onclick="toggleDetailFlip()" tabindex="0" role="button" aria-label="Flip card">
        <div class="detail-flip-inner" id="detail-flip-inner">

          <!-- FRONT: Trading Card -->
          <div class="detail-flip-front">
            <div class="card-image-area" style="height: 55%;">
              <div class="card-rarity-badge ${species.rarity}">${species.rarity}</div>
              <div class="card-conservation-badge ${consClass}">${species.conservation}</div>
              <svg viewBox="0 0 32 32" width="100%" height="100%" style="image-rendering: pixelated;">
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

          <!-- BACK: Herbarium Data Sheet -->
          <div class="detail-flip-back">
            <div class="herbarium-header">
              <span class="herbarium-label">DATA SHEET</span>
              <span class="herbarium-id">#${specimenId}</span>
            </div>
            <div class="herbarium-tabs">
              <button class="herbarium-tab active" data-tab="sci" onclick="event.stopPropagation();switchDetailTab('sci')">SCI</button>
              <button class="herbarium-tab" data-tab="con" onclick="event.stopPropagation();switchDetailTab('con')">CON</button>
              <button class="herbarium-tab" data-tab="eco" onclick="event.stopPropagation();switchDetailTab('eco')">ECO</button>
            </div>
            <div class="herbarium-panel active" data-panel="sci">
              <div class="herbarium-row"><span class="h-key">Latin</span><span class="h-val">${species.species}</span></div>
              <div class="herbarium-row"><span class="h-key">Family</span><span class="h-val">${getFamily(species.name)}</span></div>
              <div class="herbarium-row"><span class="h-key">Order</span><span class="h-val">${getOrder(species.name)}</span></div>
              <div class="herbarium-row"><span class="h-key">Endemic</span><span class="h-val">Malaysia</span></div>
            </div>
            <div class="herbarium-panel" data-panel="con">
              <div class="herbarium-row"><span class="h-key">IUCN</span><span class="h-val ${consClass}">${species.conservation}</span></div>
              <div class="conservation-gauge">${consGauge}</div>
              <div class="herbarium-note">${getConservationNote(species.conservation)}</div>
            </div>
            <div class="herbarium-panel" data-panel="eco">
              <div class="herbarium-row"><span class="h-key">Height</span><span class="h-val">${species.height}</span></div>
              <div class="herbarium-row"><span class="h-key">Age</span><span class="h-val">${species.age}</span></div>
              <div class="herbarium-row"><span class="h-key">Carbon</span><span class="h-val">${getCarbon(species.height)}</span></div>
              <div class="herbarium-desc">${species.description}</div>
            </div>
            <div class="herbarium-footer">Tap card to flip</div>
          </div>

        </div>
      </div>

      <div style="font-size: 18px; color: var(--day-muted); line-height: 1.4; margin-top: 16px; text-align: center;">${species.description}</div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.classList.add('active');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDetail();
  });

  // Keyboard support for flip
  const flipCard = document.getElementById('detail-flip-card');
  if (flipCard) {
    flipCard.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDetailFlip(); }
    };
  }
}

function toggleDetailFlip() {
  const card = document.getElementById('detail-flip-card');
  if (card) card.classList.toggle('flipped');
}

function switchDetailTab(tab) {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  modal.querySelectorAll('.herbarium-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  modal.querySelectorAll('.herbarium-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
}

function closeDetail() {
  const modal = document.getElementById('detail-modal');
  if (modal) modal.remove();
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
  const tier = EXPEDITION_TIERS.find(t => t.id === state.expeditionTier) || EXPEDITION_TIERS[0];
  
  // Show user email
  const emailEl = document.getElementById('profile-email');
  if (emailEl && WILDEX_USER) {
    emailEl.textContent = WILDEX_USER;
  }
  
  // Update rank with expedition tier
  const rankEl = document.getElementById('profile-rank');
  if (rankEl) {
    const rankName = tier.id === 'researcher' || tier.id === 'ranger' ? 'Field Researcher' : tier.name;
    rankEl.textContent = rankName;
    rankEl.style.color = tier.color;
  }
  
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

/* ===== Expedition Mode ===== */

function checkExpeditionUnlock() {
  const currentTier = EXPEDITION_TIERS.find(t => t.id === state.expeditionTier) || EXPEDITION_TIERS[0];
  const nextTier = EXPEDITION_TIERS.find(t => t.scans > currentTier.scans && state.expeditionScans >= t.scans);
  if (nextTier && !state.unlockedFeatures.includes(nextTier.id)) {
    state.expeditionTier = nextTier.id;
    state.scansMax = nextTier.scansMax;
    state.unlockedFeatures.push(nextTier.id);
    if (nextTier.id === 'forester' || nextTier.id === 'researcher' || nextTier.id === 'ranger') {
      state.isPro = true;
    }
    return nextTier;
  }
  return null;
}

function showUnlockPopup(tier) {
  const popup = document.createElement('div');
  popup.className = 'unlock-popup';
  popup.innerHTML = `
    <div class="unlock-popup-inner">
      <div class="unlock-popup-tier" style="color: ${tier.color};">${tier.name.toUpperCase()}</div>
      <div class="unlock-popup-title">TIER UNLOCKED</div>
      <div class="unlock-popup-scans">${state.expeditionScans} total scans</div>
      <div class="unlock-popup-reward">${getTierReward(tier.id)}</div>
      <button class="pixel-btn" style="margin-top: 12px;" onclick="this.closest('.unlock-popup').remove()">AWESOME!</button>
    </div>
  `;
  document.body.appendChild(popup);
  // Auto-dismiss after 4 seconds
  setTimeout(() => { if (popup.parentNode) popup.remove(); }, 4000);
}

function getTierReward(tierId) {
  const rewards = {
    'sapling': 'Collection grid view + 10 daily scans',
    'forester': 'Expedition Mode: unlimited scans, gold HUD',
    'researcher': '"Field Researcher" title + habitat data',
    'ranger': 'All card backs show full habitat maps'
  };
  return rewards[tierId] || 'New feature unlocked!';
}

function updateExpeditionUI() {
  const navExpedition = document.getElementById('nav-expedition');
  if (!navExpedition) {
    console.warn('[WildDex] #nav-expedition not found in DOM');
    return;
  }
  const tier = EXPEDITION_TIERS.find(t => t.id === state.expeditionTier) || EXPEDITION_TIERS[0];
  console.log('[WildDex] updateExpeditionUI:', tier.id, 'scans:', state.expeditionScans, 'isPro:', state.isPro);
  const label = navExpedition.querySelector('.nav-expedition-label');
  if (label) {
    label.textContent = tier.name.toUpperCase();
    label.style.color = tier.color;
  }
  navExpedition.classList.remove('tier-seedling', 'tier-sapling', 'tier-forester', 'tier-researcher', 'tier-ranger');
  navExpedition.classList.add('tier-' + tier.id);
  // Gold shimmer for forester+
  if (tier.id === 'forester' || tier.id === 'researcher' || tier.id === 'ranger') {
    navExpedition.classList.add('nav-expedition-gold');
  } else {
    navExpedition.classList.remove('nav-expedition-gold');
  }
}

function updateScanExpeditionBadge() {
  const badge = document.getElementById('expedition-scan-badge');
  const tierEl = document.getElementById('expedition-scan-tier');
  const modeEl = document.getElementById('expedition-scan-mode');
  const viewfinder = document.querySelector('.viewfinder');
  
  if (!badge || !tierEl || !modeEl) {
    console.log('[WildDex] Expedition scan badge elements not found');
    return;
  }
  
  const tier = EXPEDITION_TIERS.find(t => t.id === state.expeditionTier) || EXPEDITION_TIERS[0];
  console.log('[WildDex] Updating scan badge for tier:', tier.id, 'scans:', state.expeditionScans);
  
  tierEl.textContent = tier.name.toUpperCase();
  
  if (tier.id === 'forester' || tier.id === 'researcher' || tier.id === 'ranger') {
    modeEl.textContent = 'EXPEDITION MODE — \u221E scans';
  } else {
    modeEl.textContent = tier.scansMax + ' scans/day';
  }
  
  // Remove old tier classes
  badge.classList.remove('tier-seedling', 'tier-sapling', 'tier-forester', 'tier-researcher', 'tier-ranger');
  badge.classList.add('tier-' + tier.id);
  
  // Gold HUD theme for forester+
  if (viewfinder) {
    const isGold = tier.id === 'forester' || tier.id === 'researcher' || tier.id === 'ranger';
    if (isGold) {
      viewfinder.classList.add('expedition-gold');
      console.log('[WildDex] Added expedition-gold to viewfinder');
    } else {
      viewfinder.classList.remove('expedition-gold');
      console.log('[WildDex] Removed expedition-gold from viewfinder');
    }
    // Double-check after 500ms for mobile browsers
    setTimeout(() => {
      if (viewfinder.classList.contains('expedition-gold') !== isGold) {
        viewfinder.classList.toggle('expedition-gold', isGold);
        console.log('[WildDex] Re-synced expedition-gold class, isGold:', isGold);
      }
    }, 500);
  }
}

function getExpeditionProgress() {
  const currentIdx = EXPEDITION_TIERS.findIndex(t => t.id === state.expeditionTier);
  const current = EXPEDITION_TIERS[currentIdx];
  const next = EXPEDITION_TIERS[currentIdx + 1];
  if (!next) return { current, next: null, percent: 100 };
  const scansIntoTier = state.expeditionScans - current.scans;
  const scansNeeded = next.scans - current.scans;
  const percent = Math.min(100, Math.round((scansIntoTier / scansNeeded) * 100));
  return { current, next, percent, scansNeeded: next.scans - state.expeditionScans };
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
