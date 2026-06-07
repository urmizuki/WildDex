// Camera & Teachable Machine Scan Logic

let cameraStream = null;
let isPredicting = false;
let scanFlashSkip = false;

function skipScanFlash() {
  scanFlashSkip = true;
}

function waitForFlash(ms) {
  return new Promise(resolve => {
    const start = Date.now();
    const timeout = setTimeout(() => {
      scanFlashSkip = false;
      resolve();
    }, ms);
    const check = setInterval(() => {
      if (scanFlashSkip) {
        clearTimeout(timeout);
        clearInterval(check);
        scanFlashSkip = false;
        resolve();
      }
      if (Date.now() - start > ms + 100) {
        clearInterval(check);
      }
    }, 50);
  });
}

async function initCamera() {
  const video = document.getElementById('camera-video');
  const placeholder = document.getElementById('camera-placeholder');
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = cameraStream;
    video.style.display = 'block';
    placeholder.style.display = 'none';
  } catch (e) {
    console.log('Camera not available, using image upload mode');
  }
}

async function loadTMModel() {
  if (tmModel) return;
  const modelURL = TM_URL + 'model.json';
  const metadataURL = TM_URL + 'metadata.json';
  try {
    tmModel = await tmImage.load(modelURL, metadataURL);
    tmMaxPredictions = tmModel.getTotalClasses();
  } catch (e) {
    console.log('TM model failed to load', e);
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  const video = document.getElementById('camera-video');
  const placeholder = document.getElementById('camera-placeholder');
  video.style.display = 'none';
  placeholder.style.display = 'flex';
}

// Predict from an image element
async function predictFromImage(imgElement) {
  if (!tmModel) {
    await loadTMModel();
  }
  if (!tmModel) {
    return null;
  }
  const prediction = await tmModel.predict(imgElement);
  prediction.sort((a, b) => b.probability - a.probability);
  return prediction[0];
}

function mapTMClass(className) {
  const normalized = className.toLowerCase().trim();
  return TM_CLASS_MAP[normalized] || normalized;
}

async function performScan() {
  if (!WILDEX_USER) {
    window.location.href = '/login';
    return;
  }

  if (!state.isPro && state.scansUsed >= state.scansMax) {
    showFreemium();
    return;
  }

  const btn = document.getElementById('scan-btn');
  const hud = document.getElementById('scan-hud');
  const beam = document.getElementById('scan-hud-beam');
  const dataLines = document.querySelectorAll('.scan-hud-data-line');
  btn.disabled = true;

  // Show HUD overlay
  if (hud) {
    hud.style.display = 'block';
    // Trigger reflow to restart animation
    hud.style.animation = 'none';
    void hud.offsetWidth;
    hud.style.animation = '';
  }
  if (beam) {
    beam.classList.add('active');
  }

  // Animate data readout lines sequentially
  if (dataLines.length) {
    dataLines[0].setAttribute('data-status', 'scanning');
    setTimeout(() => {
      if (dataLines[1]) dataLines[1].setAttribute('data-status', 'scanning');
    }, 400);
    setTimeout(() => {
      if (dataLines[2]) dataLines[2].setAttribute('data-status', 'scanning');
    }, 800);
  }

  try {
    await loadTMModel();
    if (!cameraStream) await initCamera();
  } catch (e) {
    console.log('Camera/Model init failed', e);
  }

  let predictedId = null;
  let confidence = 0;

  if (tmModel && cameraStream) {
    const video = document.getElementById('camera-video');
    const prediction = await predictFromImage(video);
    if (prediction) {
      confidence = prediction.probability;
      if (confidence > 0.5) {
        predictedId = mapTMClass(prediction.className);
      }
    }
  }

  const species = SPECIES.find(s => s.id === predictedId);
  state.justRevealed = species || null;
  state.lastConfidence = confidence;
  state.scansUsed++;
  state.expeditionScans++;
  // Check expedition progression
  const newTier = checkExpeditionUnlock();
  if (newTier) {
    showUnlockPopup(newTier);
  }
  saveState();
  updateProUI();

  // Update data lines with results
  if (dataLines[0]) dataLines[0].textContent = 'BARK TEXTURE: CAPTURED';
  if (dataLines[1]) dataLines[1].textContent = species ? 'LEAF MORPHOLOGY: MATCHED' : 'LEAF MORPHOLOGY: NO MATCH';
  if (dataLines[2]) dataLines[2].textContent = species ? 'DBH ESTIMATE: ANALYZED' : 'DBH ESTIMATE: N/A';
  if (dataLines[3]) {
    dataLines[3].textContent = `CONFIDENCE: ${Math.round(confidence * 100)}%`;
    dataLines[3].style.display = 'flex';
  }

  // Show species detected flash before reveal
  if (species) {
    const flash = document.getElementById('scan-detected-flash');
    const detectedName = document.getElementById('scan-detected-name');
    if (flash && detectedName) {
      detectedName.textContent = species.name;
      flash.classList.add('active');

      // Wait for flash animation then transition (skippable)
      await waitForFlash(1600);
      flash.classList.remove('active');
    }
  } else {
    // Brief pause for "not recognized" too
    await waitForFlash(500);
  }

  // Hide HUD
  if (hud) hud.style.display = 'none';
  if (beam) beam.classList.remove('active');

  btn.disabled = false;
  stopCamera();
  setupReveal(species, confidence);
  goReveal();
}

// Image upload fallback
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!WILDEX_USER) {
    window.location.href = '/login';
    return;
  }

  if (!state.isPro && state.scansUsed >= state.scansMax) {
    showFreemium();
    return;
  }

  const btn = document.getElementById('scan-btn');
  const hud = document.getElementById('scan-hud');
  const beam = document.getElementById('scan-hud-beam');
  const dataLines = document.querySelectorAll('.scan-hud-data-line');
  btn.disabled = true;

  // Show HUD for image scan too
  if (hud) {
    hud.style.display = 'block';
    hud.style.animation = 'none';
    void hud.offsetWidth;
    hud.style.animation = '';
  }
  if (beam) beam.classList.add('active');

  if (dataLines.length) {
    dataLines[0].setAttribute('data-status', 'scanning');
    setTimeout(() => { if (dataLines[1]) dataLines[1].setAttribute('data-status', 'scanning'); }, 400);
    setTimeout(() => { if (dataLines[2]) dataLines[2].setAttribute('data-status', 'scanning'); }, 800);
  }

  try {
    await loadTMModel();
  } catch (e) {
    console.log('TM model failed to load', e);
  }

  const img = new Image();
  img.onload = async function() {
    let predictedId = null;
    let confidence = 0;

    if (tmModel) {
      const prediction = await predictFromImage(img);
      if (prediction) {
        confidence = prediction.probability;
        if (confidence > 0.5) {
          predictedId = mapTMClass(prediction.className);
        }
      }
    }

    const species = SPECIES.find(s => s.id === predictedId);
    state.justRevealed = species || null;
    state.lastConfidence = confidence;
    state.scansUsed++;
    state.expeditionScans++;
    const newTier = checkExpeditionUnlock();
    if (newTier) {
      showUnlockPopup(newTier);
    }
    saveState();
    updateProUI();

    if (dataLines[0]) dataLines[0].textContent = 'BARK TEXTURE: CAPTURED';
    if (dataLines[1]) dataLines[1].textContent = species ? 'LEAF MORPHOLOGY: MATCHED' : 'LEAF MORPHOLOGY: NO MATCH';
    if (dataLines[2]) dataLines[2].textContent = species ? 'DBH ESTIMATE: ANALYZED' : 'DBH ESTIMATE: N/A';
    if (dataLines[3]) {
      dataLines[3].textContent = `CONFIDENCE: ${Math.round(confidence * 100)}%`;
      dataLines[3].style.display = 'flex';
    }

    if (species) {
      const flash = document.getElementById('scan-detected-flash');
      const detectedName = document.getElementById('scan-detected-name');
      if (flash && detectedName) {
        detectedName.textContent = species.name;
        flash.classList.add('active');
        await waitForFlash(1600);
        flash.classList.remove('active');
      }
    } else {
      await waitForFlash(500);
    }

    if (hud) hud.style.display = 'none';
    if (beam) beam.classList.remove('active');
    btn.disabled = false;

    setupReveal(species, confidence);
    goReveal();
  };
  img.onerror = function() {
    if (hud) hud.style.display = 'none';
    if (beam) beam.classList.remove('active');
    btn.disabled = false;
    console.log('Image failed to load');
  };
  img.src = URL.createObjectURL(file);
}
