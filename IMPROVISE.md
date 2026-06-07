# WildDex Design Improvements — FORESTX Hackathon 2026

## Project Context
- **Case Study:** 4 — AI-Driven Species Identification (The Bio-Identifier)
- **Team:** FORESTX, Universiti Putra Malaysia (UPM), Kolej Pendeta Za'ba
- **Current Branch:** `experiment` (design overhaul)
- **Design Direction:** Retro pixel-art trading card collector aesthetic with conservation-science backbone
- **Design Dials:** `DESIGN_VARIANCE: 8/10` | `MOTION_INTENSITY: 6/10` | `VISUAL_DENSITY: 5/10`

## Judging Criteria Alignment
| Criteria | Weight | How Improvements Address It |
|----------|--------|----------------------------|
| Innovation & Creativity | 25% | Digital Herbarium, Field Journal, Expedition Mode — gamified citizen science |
| Problem-Solution Fit | 25% | Card-flip scientific detail view, conservation status meter, ecological data |
| Technical Feasibility | 20% | Per-user data persistence, auth timeout handling, reduced-motion support |
| Impact & Sustainability | 15% | Forest Impact Dashboard quantifies user conservation contributions |
| Presentation | 15% | Pixel-art HUD, gold-shimmer Pro badges, stepped animations, typography audit |

---

## Completed Work (Baseline)

### 1. Data Persistence Fix
- Per-user localStorage keys (`wilddex-state-{email}`) with migration from shared key
- Collection data survives refresh, iframe reload, user switching
- Rafflesia invisible card bug fixed: `.collection-card.holo` now has `opacity: 1`

### 2. Collection Page Redesign
- Progress bar with stats row
- Scientific names and conservation badges
- 3-tier card states: owned / undiscovered / locked
- Staggered entrance animation (`steps()` timing)
- Owned rare/legendary cards never locked

### 3. Scan Experience Overhaul
- Pixel-art HUD overlay: 4px blocky corner brackets, 2px crosshair, flat scan beam
- Terminal data readout with blinking cursor
- Species detected flash with skip-tap
- Same HUD for camera scan and image upload
- All animations use `steps()` for retro feel

### 4. Login Page Redesign
- Removed: glassmorphism, fireflies, CSS triangle trees, scan lines, all glow effects
- Removed: all `borderRadius` (0px everywhere)
- Flat `#0a0f0a` background with pixel-art SVG decorations
- Solid 4px pixel borders, 6px offset shadows
- 6-cell OTP with stepped `otp-pop` animation

### 5. Auth Bar (Pixel HUD Header)
- 40px height, flat `#0a0f0a` background, 3px border
- `Press Start 2P` for brand name, `VT323` for all other text
- Sign Out button: 2px border, no `borderRadius`, hover inverts to solid green

### 6. Pro Badge Gold Shimmer
- `gold-shimmer` keyframes: discrete color steps (`#D4AF37` → `#FBBF24` → `#FDE047`)
- Applied to `.nav-pro` (1.5s) and `.plan-pro` (2s)
- Night mode variants included

### 7. Auth Timeout Fix
- `getUser()` now has a 5-second timeout with `.catch()` error handling
- Loading screen shows "Checking auth (max 5s)"
- Error state has "Go to Login" button instead of hanging forever

---

## Planned Improvements (Priority Order)

### Step 1: Digital Herbarium — Species Detail Card-Flip View ✅ COMPLETED
**Priority:** P1 | **Effort:** Medium | **Impact:** High

**Goal:** Transform collection cards into full scientific profiles on tap.

**Implementation:**
- **Interaction:** Tap an owned collection card → CSS `transform: rotateY(180deg)` flip animation
- **Front (Card Face):** Existing trading card design (image, name, rarity badge)
- **Back (Herbarium):**
  - Left column: Pixel-art illustration placeholder + rarity badge + "Specimen ID" hash
  - Right column: Tabbed data panels:
    - **Scientific:** Latin name, family, order, endemic status
    - **Conservation:** IUCN status as pixel-bar gauge (CR→EN→VU→NT→LC)
    - **Ecology:** "Carbon sequestration: X kg/yr", "Wildlife support: X species"
    - **Habitat:** Distribution map placeholder, elevation range
- **Aesthetic:** Thick 3px borders, flat colors, `VT323` for data, `Press Start 2P` for section labels only
- **Animation:** `rotateY` with `steps(6)` for retro flip feel, not smooth easing

**Files modified:**
- `public/js/collection.js` — `flip-card` wrapper, `toggleFlipCard()`, `switchHerbariumTab()`, helper functions (`getConservationGauge`, `getFamily`, `getOrder`, `getCarbon`)
- `public/css/pages.css` — `.flip-card`, `.flip-card-inner`, `.flip-card-front/back`, `.herbarium-*`, `.conservation-gauge`, `.gauge-block`

**Features shipped:**
- Tap any owned collection card → CSS `rotateY(180deg)` flip with `steps(6)` timing
- Front face: existing trading card design preserved
- Back face (Herbarium):
  - Header: `DATA SHEET` label + unique Specimen ID (8-char hash)
  - 3 tabs: **SCI** (scientific name, family, order, endemic status), **CON** (IUCN status + pixel-bar gauge + note), **ECO** (height, age, estimated carbon sequestration, description)
  - Conservation gauge: 5 blocky bars colored by status (red/orange/yellow/blue/green)
  - `Tap to flip back` footer hint
- Keyboard accessible: Enter/Space flips card, tabs are clickable

---

### Step 2: Forest Impact Dashboard ✅ COMPLETED
**Priority:** P2 | **Effort:** Medium | **Impact:** High

**Goal:** Quantify user's conservation contribution for judges.

**Implementation:**
- **Access:** "Impact" button added to home page ( alongside Scan and Collection)
- **Layout:** Full-width page with blocky stat tiles in a 2×2 grid
- **Metrics shown:**
  - Species Found: X/10 (collected / total)
  - Rare Protected: count of rare + legendary species
  - kg CO₂/yr: estimated carbon sequestration based on tree heights
  - Scans Done: total scans used
- **Pixel bar charts:** Biodiversity by rarity (Common/Uncommon/Rare/Legendary) and Carbon by top 5 species — each bar made of 20 small block segments that fill proportionally
- **Milestones:** 6 unlockable badges (First Scan, 10 Scans, First Rare, First Legendary, Half Collection, Full Collection) shown as pixel grid with lock/unlock state
- **Stagger animation:** Stats and milestones enter with 60-80ms stepped delay

**Files modified:**
- `public/index.html` — new `page-impact` section with stat containers, bar chart containers, milestone grid
- `public/js/app.js` — `goImpact()` route, `renderImpact()` function with live data calculation, `renderPixelBlocks()` helper
- `public/css/pages.css` — `.impact-page`, `.impact-stat`, `.pixel-bar-chart`, `.pixel-bar-block`, `.milestone-grid`, stepped entrance animations

---

### Step 3: Typography & Hierarchy Audit ✅ COMPLETED
**Priority:** P3 | **Effort:** Low | **Impact:** Medium

**Issues fixed:**
1. `Press Start 2P` at 9-10px was unreadable — bumped all instances to **12px minimum**
2. Loading state was bare text — replaced with pixel-art skeleton

**Changes made:**
- **Login page (`app/login/page.tsx`):**
  - FORESTX HACKATHON badge: 10px → 12px
  - Env var names (`NEXT_PUBLIC_SUPABASE_URL`, etc.): 9px → 12px
  - Email display in OTP step: 11px → 12px
  - UPM footer: 10px → 12px
- **Loading screen (`app/page.tsx`):**
  - Replaced bare "Loading..." text with pixel-art skeleton:
    - Pulsing pixel tree SVG (48×60px) with `skeleton-pulse` animation
    - 3 blocky skeleton bars that cycle colors with staggered delays
    - "Checking auth (max 5s)" subtitle retained
- **CSS (`app/globals.css`):**
  - Added `skeleton-pulse` keyframes (steps(3))
  - Added `skeleton-bar` keyframes (steps(4))

**Typographic scale enforced:**
- **Display:** `Press Start 2P`, ≥12px, brand/titles only
- **Heading:** `VT323`, 18-28px, section headers
- **Body:** `VT323`, 14-18px, all readable text

**Files modified:**
- `app/login/page.tsx`
- `app/page.tsx`
- `app/globals.css`

---

### Step 4: Field Journal / Discovery Certificate ✅ COMPLETED
**Priority:** P4 | **Effort:** Medium | **Impact:** High

**Goal:** Add traceability (borrows from Case Study 2: Chain of Custody).

**Implementation:**
- **Discovery Certificate:** Auto-generated on every new scan capture with:
  - Timestamp, location (Malaysia), AI confidence %
  - Unique Specimen ID (8-char hash)
  - Species name, Latin name, rarity, conservation status
- **Field Journal page:**
  - Chronological list of all discoveries (newest first)
  - Each entry shows: pixel-art icon, species name, rarity color, date/time, confidence %, Specimen ID, conservation badge
  - Retroactive fill: if user has collection data but no journal (upgraded from old version), auto-populates journal entries with estimated dates
  - Empty state with pixel tree icon and "Go scan some trees" prompt
- **Access:** "Journal" button added to home page alongside Scan/Collection/Impact

**Files modified:**
- `public/js/reveal.js` — `saveAndGoHome()` now creates journal entry with full discovery data
- `public/js/data.js` — `state.journal` array added to default state and localStorage load/save
- `public/js/app.js` — `goJournal()` route, `renderJournal()` function, retroactive journal population on init, console logging for debugging
- `public/index.html` — `page-journal` section with list and empty-state containers (**fixed:** moved inside `.app-container`)
- `public/css/pages.css` — `.journal-page`, `.journal-entry`, `.journal-entry-*` styles with stepped entrance animation

**Bug fix:** Journal section was accidentally placed outside `.app-container`, making it invisible. Fixed by moving it inside the container, before the closing `</div>`.

---

### Step 5: Expedition Mode (Progression Unlock System)
**Priority:** P5 | **Effort:** Medium | **Impact:** High

**Goal:** Replace binary Pro paywall with scan-milestone unlocks.

**Milestones:**
| Scans | Badge | Unlock |
|-------|-------|--------|
| 1 | Seedling | Basic scan |
| 5 | Sapling | Collection grid view |
| 10 | Forester | **Expedition Mode** — gold HUD, wider beam, "tag as seen" |
| 25 | Researcher | "Field Researcher" title on Impact Dashboard |
| 50 | Ranger | All card backs reveal habitat map |

**Design Spec:**
- Badge icons: pixel-art trophy/leaf icons
- Unlock animation: gold-shimmer popup with stepped scale
- No real payment — progression only

**Files to modify:**
- `public/js/data.js` — track scan count and unlocked tiers
- `public/js/scan.js` — check unlocks after each scan
- `public/css/components.css` — `.expedition-badge`, `.unlock-popup`
- `public/js/ui.js` — `updateExpeditionUI()`

---

### Step 6: Accessibility & Dark Mode Audit
**Priority:** P6 | **Effort:** Low | **Impact:** Medium

**Checklist:**
- [x] Focus rings: 3px solid `#4ADE80` on all interactive elements (`:focus-visible`)
- [x] Contrast audit: undiscovered species text 0.3→0.5, dark mode undiscovered 0.4→0.55
- [x] Undiscovered cards: 2px dashed border added (light + dark mode)
- [x] `prefers-reduced-motion`: disable all animations/transitions with `0s !important`
- [x] Keyboard nav: skip-link added, all interactive elements are native `<button>` or have `tabindex="0"` + `role="button"` + `aria-label` + `onkeydown` handlers

**Files to modify:**
- `public/css/theme.css` — `@media (prefers-reduced-motion: reduce)` overrides
- `public/css/components.css` — `:focus-visible` states
- `public/css/pages.css` — contrast fixes for undiscovered cards

---

## Technical Notes

### Pixel-Art Aesthetic Rules (Enforced Across All Improvements)
1. **No modern effects:** No `backdrop-filter: blur`, no `box-shadow: 0 0 Xpx` glows, no gradients, no `text-shadow`
2. **Borders:** Minimum 2px, solid colors, no rounded corners (`border-radius: 0`)
3. **Animations:** Prefer `steps(N)` over smooth easing for retro feel
4. **Fonts:** `Press Start 2P` for display only (≥12px), `VT323` for everything else
5. **Colors:** Flat solid colors only, CSS variables (`--day-primary`, `--day-muted`)

### State Management
- All new features use the existing `state` object in `public/js/data.js`
- New keys: `journal`, `scanCount`, `unlockedTiers`, `expeditionMode`
- Per-user localStorage keys prevent data collision

### Performance
- Card flip uses CSS `transform: rotateY` (GPU-accelerated)
- Journal list virtualized if >50 entries
- Impact dashboard charts are CSS-only (no chart.js)

---

## Commit Log

| Commit | Description |
|--------|-------------|
| ✅ | `feat: add IMPROVISE.md with design improvement roadmap` |
| ✅ | `feat: digital herbarium card-flip species detail view` |
| ✅ | `feat: forest impact dashboard with pixel-bar charts` |
| ✅ | `style: typography audit — defined 3-tier pixel-art scale` |
| ✅ | `feat: field journal with discovery certificates` |
| (pending) | `feat: expedition mode progression unlock system` |
| ✅ | `a11y: dark mode & reduced-motion audit` |

---

## References
- **Case Study 4 PDF:** `Here is all the text extracted… (1).txt`
- **Design Skills Used:** `impeccable`, `design-taste-frontend`, `emil-design-eng`, `ui-ux-pro-max`, `frontend-design`
- **Existing Codebase:** Next.js 15 + Vanilla JS SPA (iframe architecture)

---

*Document created: 2026-06-07*
*Next action: Implement Step 1 (Digital Herbarium)*
