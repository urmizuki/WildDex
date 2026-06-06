// Card Reveal Logic

function setupReveal(species, confidence) {
  const wrapper = document.getElementById('card-wrapper');
  const revealed = document.getElementById('revealed-card');
  const actions = document.getElementById('reveal-actions');
  const newBadge = document.getElementById('new-badge');
  const revealPage = document.querySelector('.reveal-page');
  
  // Reset animations
  wrapper.className = 'card-wrapper';
  revealPage.classList.remove('shake-screen', 'flash-rare', 'flash-legendary', 'legendary-summon-mode');
  revealed.classList.remove('glow-rare', 'glow-legendary');
  actions.style.opacity = '0';
  newBadge.classList.add('hidden');
  
  if (!species) {
    // Not recognised
    const confPct = Math.round((confidence || 0) * 100);
    revealed.innerHTML = `
      <div class="card-image-area">
        <div class="card-rarity-badge common">???</div>
        <svg viewBox="0 0 32 32" width="100%" height="100%" class="pixelated" preserveAspectRatio="xMidYMid meet" style="image-rendering: pixelated;">
          <rect x="12" y="12" width="8" height="8" fill="#6B7280"/>
          <rect x="14" y="4" width="4" height="4" fill="#6B7280"/>
          <rect x="4" y="14" width="4" height="4" fill="#6B7280"/>
          <rect x="24" y="14" width="4" height="4" fill="#6B7280"/>
          <rect x="14" y="24" width="4" height="4" fill="#6B7280"/>
        </svg>
      </div>
      <div class="card-info">
        <div class="card-name">Not Recognised</div>
        <div class="card-species">Confidence: ${confPct}%</div>
        <div style="font-size: 18px; color: var(--day-muted); line-height: 1.4; margin-top: 8px;">
          The AI could not identify this tree. Try again with a clearer photo!
        </div>
      </div>
    `;
    
    setTimeout(() => {
      wrapper.classList.add('flipped');
      setTimeout(() => {
        actions.style.opacity = '1';
      }, 400);
    }, 600);
    return;
  }
  
  const isNew = !state.collection.includes(species.id);
  const rarity = species.rarity;
  
  // Set flip animation class based on rarity + newness
  let flipClass = 'flip-common';
  if (rarity === 'legendary') flipClass = 'flip-card-summon';
  else if (isNew) flipClass = 'flip-new';
  else if (rarity === 'rare') flipClass = 'flip-rare';
  else if (rarity === 'uncommon') flipClass = 'flip-uncommon';
  
  wrapper.classList.add(flipClass);
  
  // Apply glow effects
  if (rarity === 'rare') revealed.classList.add('glow-rare');
  if (rarity === 'legendary') revealed.classList.add('glow-legendary');
  
  // Apply screen effects
  if (rarity === 'rare') {
    revealPage.classList.add('shake-screen', 'flash-rare');
  }
  if (rarity === 'legendary') {
    revealPage.classList.add('legendary-summon-mode');
  }
  
  const legendaryOverlay = rarity === 'legendary'
    ? '<div class="legendary-card-shimmer"></div><div class="legendary-card-aura"></div>'
    : '';

  revealed.innerHTML = `
    <div class="card-image-area">
      ${legendaryOverlay}
      <div class="card-rarity-badge ${species.rarity}">${species.rarity}</div>
      <div class="card-conservation-badge ${species.conservation.replace(' ', '-')}">⚠ ${species.conservation}</div>
      <svg viewBox="0 0 32 32" width="100%" height="100%" class="pixelated" preserveAspectRatio="xMidYMid meet" style="image-rendering: pixelated;">
        ${species.pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.c}"/>`).join('')}
      </svg>
    </div>
    <div class="card-info">
      <div class="card-name">${species.name}</div>
      <div class="card-species">${species.species}</div>
      <div class="card-stats">
        <div class="card-stat">
          <div class="card-stat-label">Height</div>
          <div class="card-stat-value">${species.height}</div>
        </div>
        <div class="card-stat">
          <div class="card-stat-label">Age</div>
          <div class="card-stat-value">${species.age}</div>
        </div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    const showPostRevealEffects = () => {
      if (isNew) {
        newBadge.classList.remove('hidden');
        newBadge.classList.add('enhanced');
      }

      actions.style.opacity = '1';

      // Spawn particles based on rarity
      spawnRarityParticles(rarity, isNew);

      // Spawn float text
      if (isNew) {
        spawnFloatText('NEW!', 'new');
      } else if (rarity === 'legendary') {
        spawnFloatText('LEGENDARY CARD!', 'legendary');
      } else if (rarity === 'rare') {
        spawnFloatText('RARE!', 'rare');
      }
    };

    if (rarity === 'legendary') {
      wrapper.classList.add('summoning');
      setTimeout(() => {
        wrapper.classList.remove('summoning');
        wrapper.classList.add('flipped', 'zoom-legendary');
        showPostRevealEffects();
      }, 1100);
      return;
    }

    wrapper.classList.add('flipped');
    setTimeout(showPostRevealEffects, 400);
  }, 600);
}

function spawnRarityParticles(rarity, isNew) {
  const scene = document.querySelector('.card-scene');
  const revealPage = document.querySelector('.reveal-page');
  
  // Base count based on rarity
  let count = 0;
  let colors = [];
  
  switch (rarity) {
    case 'common':
      count = 0;
      break;
    case 'uncommon':
      count = 8;
      colors = ['green'];
      break;
    case 'rare':
      count = 16;
      colors = ['blue', 'gold', 'purple'];
      break;
    case 'legendary':
      count = 32;
      colors = ['gold', 'red', 'purple', 'blue'];
      break;
  }
  
  // Bonus particles for new discovery
  if (isNew) count += 10;
  
  // Spawn star particles
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() > 0.7 ? 'large' : '';
    const shape = Math.random() > 0.8 ? 'diamond' : '';
    p.className = `star-particle ${color} ${size} ${shape}`;
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.animationDuration = (0.8 + Math.random() * 0.7) + 's';
    scene.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
  
  // Spawn sparkle bursts for rare+
  if (rarity === 'rare' || rarity === 'legendary') {
    for (let i = 0; i < 5; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle-burst';
      s.style.left = (20 + Math.random() * 60) + '%';
      s.style.top = (20 + Math.random() * 60) + '%';
      s.style.animationDelay = (Math.random() * 0.3) + 's';
      scene.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  }
  
  // Spawn confetti for legendary
  if (rarity === 'legendary') {
    const confettiColors = ['#FBBF24', '#EF4444', '#60A5FA', '#A855F7', '#4ADE80', '#F472B6'];
    for (let i = 0; i < 20; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.left = Math.random() * 100 + '%';
      c.style.top = (Math.random() * 40) + '%';
      c.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      c.style.animationDelay = Math.random() * 0.5 + 's';
      c.style.animationDuration = (1.5 + Math.random() * 1) + 's';
      revealPage.appendChild(c);
      setTimeout(() => c.remove(), 3000);
    }
  }
}

function spawnFloatText(text, type) {
  const scene = document.querySelector('.card-scene');
  const el = document.createElement('div');
  el.className = `float-text ${type}`;
  el.textContent = text;
  scene.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function saveAndGoHome() {
  const species = state.justRevealed;
  if (species && !state.collection.includes(species.id)) {
    state.collection.push(species.id);
    saveState();
  }
  state.justRevealed = null;
  goHome();
}
