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
