// Camera & Teachable Machine Scan Logic

let cameraStream = null;
let isPredicting = false;

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
  if (state.scansUsed >= state.scansMax) {
    showFreemium();
    return;
  }

  const btn = document.getElementById('scan-btn');
  btn.disabled = true;
  document.getElementById('model-loading').style.display = 'block';

  await loadTMModel();
  if (!cameraStream) await initCamera();

  document.getElementById('model-loading').style.display = 'none';

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
  btn.disabled = false;

  stopCamera();
  setupReveal(species, confidence);
  goReveal();
}

// Image upload fallback
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (state.scansUsed >= state.scansMax) {
    showFreemium();
    return;
  }

  const btn = document.getElementById('scan-btn');
  btn.disabled = true;
  document.getElementById('model-loading').style.display = 'block';

  await loadTMModel();

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
    btn.disabled = false;
    document.getElementById('model-loading').style.display = 'none';

    setupReveal(species, confidence);
    goReveal();
  };
  img.src = URL.createObjectURL(file);
}
