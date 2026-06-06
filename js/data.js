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
  { id: 'meranti', name: 'Meranti', species: 'Shorea curtisii', rarity: 'common', height: '50m', age: '80 yrs', description: 'Malaysia\'s most important timber tree. Light reddish-brown wood used for plywood and furniture.', pixels: [{x:14,y:20,w:4,h:10,c:'#A0522D'},{x:13,y:22,w:1,h:6,c:'#8B4513'},{x:18,y:23,w:1,h:4,c:'#8B4513'},{x:8,y:14,w:16,h:6,c:'#2D6A4F'},{x:10,y:10,w:12,h:4,c:'#1B4332'},{x:12,y:6,w:8,h:4,c:'#40916C'},{x:14,y:4,w:4,h:2,c:'#52B788'},{x:12,y:8,w:2,h:2,c:'#86EFAC'},{x:10,y:16,w:2,h:2,c:'#40916C'}] },
  { id: 'keruing', name: 'Keruing', species: 'Dipterocarpus coriaceus', rarity: 'common', height: '45m', age: '100 yrs', description: 'Tall dipterocarp with distinctive winged fruits. Hardwood used for construction and railway sleepers.', pixels: [{x:14,y:22,w:4,h:8,c:'#6B4423'},{x:12,y:18,w:8,h:4,c:'#1B4332'},{x:11,y:14,w:10,h:4,c:'#2D6A4F'},{x:10,y:10,w:12,h:4,c:'#1B4332'},{x:11,y:6,w:10,h:4,c:'#40916C'},{x:12,y:2,w:8,h:4,c:'#52B788'},{x:13,y:8,w:2,h:2,c:'#86EFAC'},{x:9,y:26,w:2,h:4,c:'#8B4513'},{x:20,y:26,w:2,h:4,c:'#8B4513'}] },
  { id: 'rubber', name: 'Rubber Tree', species: 'Hevea brasiliensis', rarity: 'common', height: '30m', age: '40 yrs', description: 'Source of natural rubber. Smooth grey bark with compound leaves. Introduced to Malaysia in 1877.', pixels: [{x:14,y:18,w:4,h:12,c:'#9CA3AF'},{x:13,y:20,w:1,h:8,c:'#6B7280'},{x:18,y:22,w:1,h:6,c:'#6B7280'},{x:10,y:14,w:12,h:4,c:'#2D6A4F'},{x:11,y:10,w:10,h:4,c:'#40916C'},{x:12,y:6,w:8,h:4,c:'#52B788'},{x:11,y:16,w:2,h:2,c:'#1B4332'},{x:16,y:8,w:2,h:2,c:'#86EFAC'}] },
  { id: 'jati', name: 'Jati', species: 'Tectona grandis', rarity: 'uncommon', height: '35m', age: '120 yrs', description: 'Premium teak wood prized for durability. Large oval leaves and greyish-brown bark. Highly valued timber.', pixels: [{x:15,y:16,w:2,h:14,c:'#8B7355'},{x:14,y:18,w:1,h:10,c:'#6B5B45'},{x:8,y:8,w:16,h:2,c:'#2D6A4F'},{x:10,y:10,w:12,h:2,c:'#1B4332'},{x:6,y:10,w:2,h:8,c:'#40916C'},{x:8,y:12,w:2,h:8,c:'#52B788'},{x:10,y:14,w:2,h:6,c:'#40916C'},{x:22,y:10,w:2,h:8,c:'#40916C'},{x:20,y:12,w:2,h:6,c:'#52B788'},{x:18,y:14,w:2,h:4,c:'#86EFAC'},{x:12,y:16,w:2,h:2,c:'#1B4332'}] },
  { id: 'kulai', name: 'Kulai', species: 'Scaphium macropodum', rarity: 'uncommon', height: '40m', age: '90 yrs', description: 'Tall tree with edible fruit and seeds used in traditional desserts. Smooth light-coloured bark.', pixels: [{x:15,y:18,w:2,h:12,c:'#D2B48C'},{x:14,y:20,w:1,h:8,c:'#C19A6B'},{x:8,y:12,w:16,h:2,c:'#1B4332'},{x:10,y:10,w:12,h:2,c:'#2D6A4F'},{x:6,y:6,w:4,h:4,c:'#D2691E'},{x:8,y:4,w:4,h:2,c:'#FF8C00'},{x:10,y:8,w:4,h:4,c:'#CD853F'},{x:12,y:6,w:2,h:2,c:'#F4A460'},{x:18,y:6,w:4,h:4,c:'#D2691E'},{x:20,y:4,w:4,h:2,c:'#FF8C00'},{x:16,y:8,w:4,h:4,c:'#CD853F'},{x:14,y:8,w:2,h:2,c:'#F4A460'},{x:12,y:14,w:2,h:2,c:'#D2691E'},{x:18,y:14,w:2,h:2,c:'#D2691E'}] },
  { id: 'durian', name: 'Durian Tree', species: 'Durio zibethinus', rarity: 'uncommon', height: '27m', age: '50 yrs', description: 'The king of fruits. Spiky durian fruits hang from thick branches. Broad evergreen canopy.', pixels: [{x:15,y:16,w:2,h:14,c:'#4A3728'},{x:14,y:18,w:1,h:10,c:'#3D2B1F'},{x:8,y:8,w:16,h:2,c:'#2D6A4F'},{x:10,y:10,w:12,h:2,c:'#1B4332'},{x:6,y:6,w:4,h:4,c:'#228B22'},{x:8,y:4,w:4,h:2,c:'#32CD32'},{x:10,y:8,w:4,h:4,c:'#006400'},{x:12,y:6,w:2,h:2,c:'#90EE90'},{x:18,y:6,w:4,h:4,c:'#228B22'},{x:20,y:4,w:4,h:2,c:'#32CD32'},{x:16,y:8,w:4,h:4,c:'#006400'},{x:14,y:8,w:2,h:2,c:'#90EE90'},{x:12,y:14,w:2,h:2,c:'#8B4513'},{x:18,y:14,w:2,h:2,c:'#8B4513'}] },
  { id: 'cengal', name: 'Cengal', species: 'Neobalanocarpus heimii', rarity: 'rare', height: '60m', age: '200 yrs', description: 'Malaysia\'s most durable hardwood. Dense, heavy timber resistant to rot and termites. Very rare.', pixels: [{x:15,y:18,w:2,h:12,c:'#5C4033'},{x:14,y:20,w:1,h:8,c:'#4A3728'},{x:8,y:12,w:16,h:2,c:'#1B4332'},{x:10,y:10,w:12,h:2,c:'#2D6A4F'},{x:6,y:6,w:4,h:4,c:'#DAA520'},{x:8,y:4,w:4,h:2,c:'#FFD700'},{x:10,y:8,w:4,h:4,c:'#B8860B'},{x:12,y:6,w:2,h:2,c:'#F0E68C'},{x:18,y:6,w:4,h:4,c:'#DAA520'},{x:20,y:4,w:4,h:2,c:'#FFD700'},{x:16,y:8,w:4,h:4,c:'#B8860B'},{x:14,y:8,w:2,h:2,c:'#F0E68C'},{x:12,y:14,w:2,h:2,c:'#DAA520'},{x:18,y:14,w:2,h:2,c:'#DAA520'}] },
  { id: 'tualang', name: 'Tualang', species: 'Koompassia excelsa', rarity: 'rare', height: '85m', age: '300 yrs', description: 'Towering emergent tree rising above the rainforest canopy. Massive buttress roots. One of the tallest in Malaysia.', pixels: [{x:14,y:20,w:4,h:10,c:'#4A3728'},{x:13,y:22,w:1,h:6,c:'#3D2B1F'},{x:18,y:23,w:1,h:4,c:'#3D2B1F'},{x:8,y:14,w:16,h:6,c:'#1B4332'},{x:10,y:10,w:12,h:4,c:'#2D6A4F'},{x:12,y:6,w:8,h:4,c:'#40916C'},{x:14,y:4,w:4,h:2,c:'#52B788'},{x:12,y:8,w:2,h:2,c:'#86EFAC'},{x:10,y:16,w:2,h:2,c:'#40916C'},{x:9,y:28,w:2,h:4,c:'#4A3728'},{x:20,y:28,w:2,h:4,c:'#4A3728'}] },
  { id: 'rafflesia', name: 'Rafflesia', species: 'Rafflesia arnoldii', rarity: 'legendary', height: '1m', age: 'N/A', description: 'The world\'s largest flower, up to 1m wide. Parasitic plant with no stem or leaves. Found in Malaysian rainforests.', pixels: [{x:13,y:12,w:6,h:18,c:'#8B0000'},{x:12,y:14,w:1,h:14,c:'#660000'},{x:19,y:16,w:1,h:10,c:'#660000'},{x:14,y:18,w:1,h:8,c:'#A52A2A'},{x:6,y:8,w:20,h:4,c:'#DC143C'},{x:8,y:6,w:16,h:2,c:'#FF0000'},{x:10,y:4,w:12,h:2,c:'#FF6347'},{x:12,y:2,w:8,h:2,c:'#FFA07A'},{x:10,y:10,w:2,h:2,c:'#FFD700'},{x:14,y:10,w:2,h:2,c:'#FF6347'},{x:18,y:10,w:2,h:2,c:'#FFD700'},{x:8,y:12,w:2,h:2,c:'#FF6347'},{x:22,y:12,w:2,h:2,c:'#FF6347'}] },
  { id: 'banyan', name: 'Banyan', species: 'Ficus benghalensis', rarity: 'legendary', height: '30m', age: '500 yrs', description: 'Sacred fig tree with massive aerial roots that become secondary trunks. Can spread over hectares. Also known as the Walking Tree.', pixels: [{x:10,y:12,w:12,h:16,c:'#4A3728'},{x:9,y:14,w:1,h:12,c:'#3D2B1F'},{x:22,y:16,w:1,h:10,c:'#3D2B1F'},{x:12,y:14,w:2,h:10,c:'#5C4033'},{x:16,y:16,w:2,h:8,c:'#5C4033'},{x:14,y:18,w:4,h:2,c:'#3D2B1F'},{x:8,y:8,w:16,h:4,c:'#1B4332'},{x:10,y:6,w:12,h:2,c:'#2D6A4F'},{x:12,y:4,w:8,h:2,c:'#40916C'},{x:14,y:2,w:4,h:2,c:'#52B788'},{x:6,y:10,w:2,h:4,c:'#86EFAC'},{x:24,y:10,w:2,h:4,c:'#86EFAC'}] }
];

let state = {
  scansUsed: 0,
  scansMax: 5,
  collection: ['meranti', 'keruing', 'rubber'],
  currentFilter: 'all',
  justRevealed: null,
  isDark: false,
  isPro: false
};

// Load saved state from localStorage
const savedState = localStorage.getItem('wilddex-state');
if (savedState) {
  try {
    const parsed = JSON.parse(savedState);
    state.isPro = parsed.isPro || false;
    state.scansUsed = parsed.scansUsed || 0;
    state.collection = parsed.collection || state.collection;
    state.isDark = parsed.isDark || false;
  } catch (e) {
    console.error('Failed to load saved state', e);
  }
}
