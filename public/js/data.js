// Teachable Machine Model
const TM_URL = 'https://teachablemachine.withgoogle.com/models/BWvqf33Uf/';

// Map TM class names to SPECIES ids
const TM_CLASS_MAP = {
  'jati': 'jati',
  'meranti': 'meranti',
  'cengal': 'cengal',
  'keruing': 'keruing',
  'kulai': 'kulai',
  'rafflessia': 'rafflesia'
};
let tmModel = null;
let tmMaxPredictions = 5;

// Data - Malaysian Trees
const SPECIES = [
  { id: 'meranti', name: 'Meranti', species: 'Shorea curtisii', rarity: 'common', conservation: 'Vulnerable', height: '50m', age: '80 yrs', description: 'Malaysia\'s most important timber tree. Light reddish-brown wood used for plywood and furniture.', pixels: [{x:14,y:20,w:4,h:10,c:'#A0522D'},{x:13,y:22,w:1,h:6,c:'#8B4513'},{x:18,y:23,w:1,h:4,c:'#8B4513'},{x:8,y:14,w:16,h:6,c:'#2D6A4F'},{x:10,y:10,w:12,h:4,c:'#1B4332'},{x:12,y:6,w:8,h:4,c:'#40916C'},{x:14,y:4,w:4,h:2,c:'#52B788'},{x:12,y:8,w:2,h:2,c:'#86EFAC'},{x:10,y:16,w:2,h:2,c:'#40916C'}] },
  { id: 'keruing', name: 'Keruing', species: 'Dipterocarpus coriaceus', rarity: 'common', conservation: 'Vulnerable', height: '45m', age: '100 yrs', description: 'Tall dipterocarp with distinctive winged fruits. Hardwood used for construction and railway sleepers.', pixels: [{x:14,y:22,w:4,h:8,c:'#6B4423'},{x:12,y:18,w:8,h:4,c:'#1B4332'},{x:11,y:14,w:10,h:4,c:'#2D6A4F'},{x:10,y:10,w:12,h:4,c:'#1B4332'},{x:11,y:6,w:10,h:4,c:'#40916C'},{x:12,y:2,w:8,h:4,c:'#52B788'},{x:13,y:8,w:2,h:2,c:'#86EFAC'},{x:9,y:26,w:2,h:4,c:'#8B4513'},{x:20,y:26,w:2,h:4,c:'#8B4513'}] },
  { id: 'rubber', name: 'Rubber Tree', species: 'Hevea brasiliensis', rarity: 'common', conservation: 'Least Concern', height: '30m', age: '40 yrs', description: 'Source of natural rubber. Smooth grey bark with compound leaves. Introduced to Malaysia in 1877.', pixels: [{x:14,y:18,w:4,h:12,c:'#9CA3AF'},{x:13,y:20,w:1,h:8,c:'#6B7280'},{x:18,y:22,w:1,h:6,c:'#6B7280'},{x:10,y:14,w:12,h:4,c:'#2D6A4F'},{x:11,y:10,w:10,h:4,c:'#40916C'},{x:12,y:6,w:8,h:4,c:'#52B788'},{x:11,y:16,w:2,h:2,c:'#1B4332'},{x:16,y:8,w:2,h:2,c:'#86EFAC'}] },
  { id: 'jati', name: 'Jati', species: 'Tectona grandis', rarity: 'uncommon', conservation: 'Near Threatened', height: '35m', age: '120 yrs', description: 'Premium teak wood prized for durability. Large oval leaves and greyish-brown bark. Highly valued timber.', pixels: [{x:15,y:16,w:2,h:14,c:'#8B7355'},{x:14,y:18,w:1,h:10,c:'#6B5B45'},{x:8,y:8,w:16,h:2,c:'#2D6A4F'},{x:10,y:10,w:12,h:2,c:'#1B4332'},{x:6,y:10,w:2,h:8,c:'#40916C'},{x:8,y:12,w:2,h:8,c:'#52B788'},{x:10,y:14,w:2,h:6,c:'#40916C'},{x:22,y:10,w:2,h:8,c:'#40916C'},{x:20,y:12,w:2,h:6,c:'#52B788'},{x:18,y:14,w:2,h:4,c:'#86EFAC'},{x:12,y:16,w:2,h:2,c:'#1B4332'}] },
  { id: 'kulai', name: 'Kulai', species: 'Scaphium macropodum', rarity: 'uncommon', conservation: 'Least Concern', height: '40m', age: '90 yrs', description: 'Tall tree with edible fruit and seeds used in traditional desserts. Smooth light-coloured bark.', pixels: [{x:15,y:18,w:2,h:12,c:'#D2B48C'},{x:14,y:20,w:1,h:8,c:'#C19A6B'},{x:18,y:23,w:1,h:4,c:'#C19A6B'},{x:8,y:12,w:16,h:2,c:'#1B4332'},{x:10,y:10,w:12,h:2,c:'#2D6A4F'},{x:6,y:6,w:4,h:4,c:'#D2691E'},{x:8,y:4,w:4,h:2,c:'#FF8C00'},{x:10,y:8,w:4,h:4,c:'#CD853F'},{x:12,y:6,w:2,h:2,c:'#F4A460'},{x:18,y:6,w:4,h:4,c:'#D2691E'},{x:20,y:4,w:4,h:2,c:'#FF8C00'},{x:16,y:8,w:4,h:4,c:'#CD853F'},{x:14,y:8,w:2,h:2,c:'#F4A460'},{x:12,y:14,w:2,h:2,c:'#D2691E'},{x:18,y:14,w:2,h:2,c:'#D2691E'}] },
  { id: 'durian', name: 'Durian Tree', species: 'Durio zibethinus', rarity: 'uncommon', conservation: 'Vulnerable', height: '27m', age: '50 yrs', description: 'The king of fruits. Spiky durian fruits hang from thick branches. Broad evergreen canopy.', pixels: [{x:15,y:16,w:2,h:14,c:'#4A3728'},{x:14,y:18,w:1,h:10,c:'#3D2B1F'},{x:8,y:8,w:16,h:2,c:'#2D6A4F'},{x:10,y:10,w:12,h:2,c:'#1B4332'},{x:6,y:6,w:4,h:4,c:'#228B22'},{x:8,y:4,w:4,h:2,c:'#32CD32'},{x:10,y:8,w:4,h:4,c:'#006400'},{x:12,y:6,w:2,h:2,c:'#90EE90'},{x:18,y:6,w:4,h:4,c:'#228B22'},{x:20,y:4,w:4,h:2,c:'#32CD32'},{x:16,y:8,w:4,h:4,c:'#006400'},{x:14,y:8,w:2,h:2,c:'#90EE90'},{x:12,y:14,w:2,h:2,c:'#8B4513'},{x:18,y:14,w:2,h:2,c:'#8B4513'}] },
  { id: 'cengal', name: 'Cengal', species: 'Neobalanocarpus heimii', rarity: 'rare', conservation: 'Endangered', height: '60m', age: '200 yrs', description: 'Malaysia\'s most durable hardwood. Dense, heavy timber resistant to rot and termites. Very rare.', pixels: [{x:15,y:18,w:2,h:12,c:'#5C4033'},{x:14,y:20,w:1,h:8,c:'#4A3728'},{x:8,y:12,w:16,h:2,c:'#1B4332'},{x:10,y:10,w:12,h:2,c:'#2D6A4F'},{x:6,y:6,w:4,h:4,c:'#DAA520'},{x:8,y:4,w:4,h:2,c:'#FFD700'},{x:10,y:8,w:4,h:4,c:'#B8860B'},{x:12,y:6,w:2,h:2,c:'#F0E68C'},{x:18,y:6,w:4,h:4,c:'#DAA520'},{x:20,y:4,w:4,h:2,c:'#FFD700'},{x:16,y:8,w:4,h:4,c:'#B8860B'},{x:14,y:8,w:2,h:2,c:'#F0E68C'},{x:12,y:14,w:2,h:2,c:'#DAA520'},{x:18,y:14,w:2,h:2,c:'#DAA520'}] },
  { id: 'tualang', name: 'Tualang', species: 'Koompassia excelsa', rarity: 'rare', conservation: 'Near Threatened', height: '85m', age: '300 yrs', description: 'Towering emergent tree rising above the rainforest canopy. Massive buttress roots. One of the tallest in Malaysia.', pixels: [{x:14,y:20,w:4,h:10,c:'#4A3728'},{x:13,y:22,w:1,h:6,c:'#3D2B1F'},{x:18,y:23,w:1,h:4,c:'#3D2B1F'},{x:8,y:14,w:16,h:6,c:'#1B4332'},{x:10,y:10,w:12,h:4,c:'#2D6A4F'},{x:12,y:6,w:8,h:4,c:'#40916C'},{x:14,y:4,w:4,h:2,c:'#52B788'},{x:12,y:8,w:2,h:2,c:'#86EFAC'},{x:10,y:16,w:2,h:2,c:'#40916C'},{x:9,y:28,w:2,h:4,c:'#4A3728'},{x:20,y:28,w:2,h:4,c:'#4A3728'}] },
  { id: 'rafflesia', name: 'Rafflesia', species: 'Rafflesia arnoldii', rarity: 'legendary', conservation: 'Critically Endangered', height: '1m', age: 'N/A', description: 'The world\'s largest flower, up to 1m wide. Parasitic plant with no stem or leaves. Found in Malaysian rainforests.', pixels: [{x:13,y:12,w:6,h:18,c:'#8B0000'},{x:12,y:14,w:1,h:14,c:'#660000'},{x:19,y:16,w:1,h:10,c:'#660000'},{x:14,y:18,w:1,h:8,c:'#A52A2A'},{x:6,y:8,w:20,h:4,c:'#DC143C'},{x:8,y:6,w:16,h:2,c:'#FF0000'},{x:10,y:4,w:12,h:2,c:'#FF6347'},{x:12,y:2,w:8,h:2,c:'#FFA07A'},{x:10,y:10,w:2,h:2,c:'#FFD700'},{x:14,y:10,w:2,h:2,c:'#FF6347'},{x:18,y:10,w:2,h:2,c:'#FFD700'},{x:8,y:12,w:2,h:2,c:'#FF6347'},{x:22,y:12,w:2,h:2,c:'#FF6347'}] },
  { id: 'banyan', name: 'Banyan', species: 'Ficus benghalensis', rarity: 'legendary', conservation: 'Least Concern', height: '30m', age: '500 yrs', description: 'Sacred fig tree with massive aerial roots that become secondary trunks. Can spread over hectares. Also known as the Walking Tree.', pixels: [{x:10,y:12,w:12,h:16,c:'#4A3728'},{x:9,y:14,w:1,h:12,c:'#3D2B1F'},{x:22,y:16,w:1,h:10,c:'#3D2B1F'},{x:12,y:14,w:2,h:10,c:'#5C4033'},{x:16,y:16,w:2,h:8,c:'#5C4033'},{x:14,y:18,w:4,h:2,c:'#3D2B1F'},{x:8,y:8,w:16,h:4,c:'#1B4332'},{x:10,y:6,w:12,h:2,c:'#2D6A4F'},{x:12,y:4,w:8,h:2,c:'#40916C'},{x:14,y:2,w:4,h:2,c:'#52B788'},{x:6,y:10,w:2,h:4,c:'#86EFAC'},{x:24,y:10,w:2,h:4,c:'#86EFAC'}] }
];

// Auth - extract user email from URL hash (set by Next.js wrapper)
const WILDEX_USER = (() => {
  try {
    const hash = window.location.hash;
    const match = hash.match(/user=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch { return null; }
})();

function getStorageKey() {
  return WILDEX_USER ? `wilddex-state-${WILDEX_USER}` : 'wilddex-state';
}

// Migrate old shared key to per-user key
if (WILDEX_USER) {
  const oldSaved = localStorage.getItem('wilddex-state');
  if (oldSaved) {
    try {
      const parsed = JSON.parse(oldSaved);
      if (parsed._user === WILDEX_USER) {
        const newKey = getStorageKey();
        if (!localStorage.getItem(newKey)) {
          localStorage.setItem(newKey, oldSaved);
        }
        localStorage.removeItem('wilddex-state');
      }
    } catch {
      localStorage.removeItem('wilddex-state');
    }
  }
}

// Expedition tiers
const EXPEDITION_TIERS = [
  { id: 'seedling', name: 'Seedling', scans: 0, scansMax: 5, color: '#6B7280' },
  { id: 'sapling', name: 'Sapling', scans: 5, scansMax: 10, color: '#2D6A4F' },
  { id: 'forester', name: 'Forester', scans: 10, scansMax: 9999, color: '#D4AF37' },
  { id: 'researcher', name: 'Researcher', scans: 25, scansMax: 9999, color: '#2563EB' },
  { id: 'ranger', name: 'Ranger', scans: 50, scansMax: 9999, color: '#DC2626' }
];

function getExpeditionTier(scans) {
  for (let i = EXPEDITION_TIERS.length - 1; i >= 0; i--) {
    if (scans >= EXPEDITION_TIERS[i].scans) return EXPEDITION_TIERS[i];
  }
  return EXPEDITION_TIERS[0];
}

let state = {
  scansUsed: 0,
  scansMax: 5,
  collection: [],
  journal: [],
  currentFilter: 'all',
  justRevealed: null,
  isDark: false,
  isPro: false,
  introMode: 'jungle',
  expeditionScans: 0,
  expeditionTier: 'seedling',
  unlockedFeatures: []
};

// Load saved state from localStorage
const savedState = localStorage.getItem(getStorageKey());
if (savedState) {
  try {
    const parsed = JSON.parse(savedState);
    state.isPro = parsed.isPro === true;
    if (typeof parsed.scansUsed === 'number') state.scansUsed = parsed.scansUsed;
    state.collection = Array.isArray(parsed.collection) && parsed.collection.length > 0 ? parsed.collection : state.collection;
    state.journal = Array.isArray(parsed.journal) ? parsed.journal : state.journal;
    state.isDark = parsed.isDark === true;
    if (parsed.introMode) state.introMode = parsed.introMode;
    if (typeof parsed.expeditionScans === 'number') state.expeditionScans = parsed.expeditionScans;
    if (typeof parsed.expeditionTier === 'string') state.expeditionTier = parsed.expeditionTier;
    if (Array.isArray(parsed.unlockedFeatures)) state.unlockedFeatures = parsed.unlockedFeatures;
    // Migrate: if user had isPro, give them forester tier
    if (state.isPro && state.expeditionTier === 'seedling') {
      console.log('[WildDex] Migrating Pro user to Forester tier');
      state.expeditionScans = Math.max(state.expeditionScans, 10);
      state.expeditionTier = 'forester';
      state.unlockedFeatures = ['expedition-hud', 'tag-seen', 'unlimited-scans'];
    }
    // Ensure tier matches scan count
    const computedTier = getExpeditionTier(state.expeditionScans);
    if (computedTier.id !== state.expeditionTier) {
      console.log('[WildDex] Correcting tier from', state.expeditionTier, 'to', computedTier.id);
      state.expeditionTier = computedTier.id;
      state.scansMax = computedTier.scansMax;
      // Auto-unlock features for the tier
      if (state.expeditionTier === 'forester' || state.expeditionTier === 'researcher' || state.expeditionTier === 'ranger') {
        state.isPro = true;
      }
    }
    console.log('[WildDex] Loaded state:', 'tier:', state.expeditionTier, 'scans:', state.expeditionScans, 'isPro:', state.isPro);
  } catch (e) {
    console.error('Failed to load saved state', e);
  }
}


