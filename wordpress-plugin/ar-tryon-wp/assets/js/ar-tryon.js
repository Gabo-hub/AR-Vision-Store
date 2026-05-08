/**
 * AR Try-On Engine — WordPress Plugin
 *
 * Vanilla JavaScript AR glasses try-on system.
 * Uses MediaPipe FaceMesh for real-time face tracking and Three.js for 3D rendering.
 *
 * @version 2.1.0
 * @license GPL-2.0-or-later
 */

let THREE;
let GLTFLoader;

/* ═══════════════════════════════════════════════════════════════════════════
 *  ONE EURO FILTER
 *  Adaptive low-pass filter — industry standard for AR tracking noise.
 *  Slow movement → aggressive smoothing (no jitter).
 *  Fast movement → responsive follow (no lag).
 *  Reference: http://cristal.univ-lille.fr/~casiez/1euro/
 * ═══════════════════════════════════════════════════════════════════════════ */
class OneEuroFilter {
    constructor(minCutoff = 1.0, beta = 0.0, dCutoff = 1.0) {
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
        this.firstTime = true;
        this.xPrev = 0;
        this.dxPrev = 0;
        this.tPrev = 0;
    }

    _alpha(cutoff, dt) {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / dt);
    }

    filter(x, timestamp) {
        if (this.firstTime) {
            this.firstTime = false;
            this.xPrev = x;
            this.dxPrev = 0;
            this.tPrev = timestamp;
            return x;
        }

        const dt = timestamp - this.tPrev;
        if (dt <= 0) return this.xPrev;

        // Smoothed derivative
        const dx = (x - this.xPrev) / dt;
        const edAlpha = this._alpha(this.dCutoff, dt);
        const dxHat = edAlpha * dx + (1 - edAlpha) * this.dxPrev;

        // Adaptive cutoff: slow motion → lower cutoff (more smoothing)
        const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
        const a = this._alpha(cutoff, dt);
        const xHat = a * x + (1 - a) * this.xPrev;

        this.xPrev = xHat;
        this.dxPrev = dxHat;
        this.tPrev = timestamp;

        return xHat;
    }

    reset() {
        this.firstTime = true;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  PRE-ALLOCATED VECTORS — avoid GC pressure inside render loop
 * ═══════════════════════════════════════════════════════════════════════════ */
let _vLeftEye, _vRightEye, _vTopHead, _vChin, _vTempleLeft, _vTempleRight;
let _xAxis, _yAxis, _zAxis, _rotationMatrix, _faceQuaternion, _flipY;

/** Lazy loads Three.js and initializes math primitives */
async function loadThreeJS() {
    if (THREE) return;
    THREE = await import('three');
    const loaders = await import('three/addons/loaders/GLTFLoader.js');
    GLTFLoader = loaders.GLTFLoader;

    _vLeftEye = new THREE.Vector3();
    _vRightEye = new THREE.Vector3();
    _vTopHead = new THREE.Vector3();
    _vChin = new THREE.Vector3();
    _vTempleLeft = new THREE.Vector3();
    _vTempleRight = new THREE.Vector3();
    _xAxis = new THREE.Vector3();
    _yAxis = new THREE.Vector3();
    _zAxis = new THREE.Vector3();
    _rotationMatrix = new THREE.Matrix4();
    _faceQuaternion = new THREE.Quaternion();
    _flipY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  SVG ICONS (inline to avoid external dependencies)
 * ═══════════════════════════════════════════════════════════════════════════ */
const ICONS = {
    camera: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    box: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    capture: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>',
    switchCam: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><circle cx="12" cy="12" r="3"/><path d="m18 22-3-3 3-3"/><path d="m6 2 3 3-3 3"/></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
};

/* ═══════════════════════════════════════════════════════════════════════════
 *  AR TRY-ON ENGINE
 *
 *  State machine: idle → loading → searching → tracking → error
 *
 *  - idle:      Showing thumbnail, waiting for user click
 *  - loading:   Initializing camera + MediaPipe + Three.js
 *  - searching: Camera ready, no face detected yet
 *  - tracking:  Face detected, rendering glasses in real-time
 *  - error:     Something went wrong
 * ═══════════════════════════════════════════════════════════════════════════ */
class ARTryOn {
    /**
     * @param {HTMLElement} container - The DOM element with class 'ar-tryon-container'
     */
    constructor(container) {
        this.container = container;

        // Parse configuration from data attributes
        this.config = {
            modelUrl: container.dataset.model || '',
            scaleFactor: parseFloat(container.dataset.scale) || 2.5,
            offsetX: parseFloat(container.dataset.offsetX) || 0,
            offsetY: parseFloat(container.dataset.offsetY) || 0,
            offsetZ: parseFloat(container.dataset.offsetZ) || 0,
            rotationX: parseFloat(container.dataset.rotationX) || 0,
            rotationY: parseFloat(container.dataset.rotationY) || 0,
            rotationZ: parseFloat(container.dataset.rotationZ) || 0,
            thumbnail: container.dataset.thumbnail || '',
            buttonText: container.dataset.buttonText || 'Try On with AR',
            enableCapture: container.dataset.enableCapture !== '0',
            enableFaceGuide: container.dataset.enableFaceGuide !== '0',
            btnColor: container.dataset.btnColor || '#111111',
            btnTextColor: container.dataset.btnTextColor || '#ffffff',
            btnStyle: container.dataset.btnStyle || 'solid',
            cameraRes: parseInt(container.dataset.cameraRes) || 640,
            loadingText: container.dataset.loadingText || 'Loading AI engine...',
            searchingText: container.dataset.searchingText || 'Position your face',
            trackingText: container.dataset.trackingText || 'Live Tracking',
        };

        // State
        this.state = 'idle';
        this.faceData = null;
        this.faceDetected = false;
        this.ipdSamples = [];
        this.lockedIPD = 0;
        this.modelWidth = 1;
        this.isDestroyed = false;
        this.isProcessing = false;
        this.facingMode = 'user';
        this._noFaceFrames = 0;
        this._modelReady = false;

        // Three.js objects
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.glassesGroup = null;
        this.modelGroup = null;
        this.headOccluder = null;
        this.glassesScene = null;

        // MediaPipe
        this.faceMesh = null;
        this.stream = null;
        this.video = null;
        this.animationFrameId = null;

        // Resize observer
        this._resizeObserver = null;

        // DOM element refs
        this.els = {};

        // One Euro Filters for smooth tracking (7 values: x, y, z, qx, qy, qz, qw)
        this._filters = {
            posX: new OneEuroFilter(1.5, 0.007, 1.0),
            posY: new OneEuroFilter(1.5, 0.007, 1.0),
            posZ: new OneEuroFilter(1.5, 0.007, 1.0),
            scale: new OneEuroFilter(0.5, 0.001, 1.0),
        };

        // Build the UI
        this._createUI();
    }

    /* ─────────────────────────────────────────────────────────
     *  UI CREATION
     * ───────────────────────────────────────────────────────── */
    _createUI() {
        this.container.innerHTML = '';
        this.container.classList.add('ar-tryon-wrapper');

        // ── IDLE VIEW (thumbnail + activate button) ──
        const idleView = this._el('div', 'ar-tryon-idle');

        if (this.config.thumbnail) {
            const img = this._el('img', 'ar-tryon-thumbnail');
            img.src = this.config.thumbnail;
            img.alt = 'Product preview';
            img.loading = 'eager';
            idleView.appendChild(img);
        }

        const btnOverlay = this._el('div', 'ar-tryon-btn-overlay');
        const btn = this._el('button', 'ar-tryon-activate-btn');
        btn.type = 'button'; // Prevent form submission if placed inside WC form
        btn.setAttribute('aria-label', this.config.buttonText);
        btn.innerHTML = `${ICONS.camera}<span>${this.config.buttonText}</span>`;

        // Apply dynamic button styles from settings
        this._applyButtonStyle(btn);

        btn.addEventListener('click', () => this.activate());
        btnOverlay.appendChild(btn);
        idleView.appendChild(btnOverlay);
        this.els.idleView = idleView;
        this.container.appendChild(idleView);

        // ── ACTIVE VIEW (camera + 3D overlay + controls) ──
        const activeView = this._el('div', 'ar-tryon-active');
        activeView.style.display = 'none';
        activeView.setAttribute('role', 'dialog');
        activeView.setAttribute('aria-label', 'AR Try-On Experience');

        // Video element
        const video = this._el('video', 'ar-tryon-video');
        video.playsInline = true;
        video.autoplay = true;
        video.muted = true;
        video.setAttribute('webkit-playsinline', 'true');
        this.video = video;
        activeView.appendChild(video);

        // Three.js canvas container
        const canvasCtn = this._el('div', 'ar-tryon-canvas-ctn');
        this.els.canvasCtn = canvasCtn;
        activeView.appendChild(canvasCtn);

        // ── Top controls bar ──
        const controls = this._el('div', 'ar-tryon-controls');

        const statusBadge = this._el('div', 'ar-tryon-status-badge');
        statusBadge.setAttribute('role', 'status');
        statusBadge.setAttribute('aria-live', 'polite');
        statusBadge.innerHTML = '<div class="ar-tryon-status-dot"></div><span class="ar-tryon-status-text">Initializing...</span>';
        this.els.statusBadge = statusBadge;
        controls.appendChild(statusBadge);

        // Right controls group
        const controlsRight = this._el('div', 'ar-tryon-controls-right');

        // Camera switch button (mobile only)
        const switchBtn = this._el('button', 'ar-tryon-switch-btn');
        switchBtn.type = 'button';
        switchBtn.setAttribute('aria-label', 'Switch camera');
        switchBtn.innerHTML = ICONS.switchCam;
        switchBtn.addEventListener('click', () => this._switchCamera());
        this.els.switchBtn = switchBtn;
        controlsRight.appendChild(switchBtn);

        const closeBtn = this._el('button', 'ar-tryon-close-btn');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close AR try-on');
        closeBtn.innerHTML = ICONS.close;
        closeBtn.addEventListener('click', () => this.deactivate());
        controlsRight.appendChild(closeBtn);

        controls.appendChild(controlsRight);
        activeView.appendChild(controls);

        // ── Bottom action bar ──
        if (this.config.enableCapture) {
            const bottomBar = this._el('div', 'ar-tryon-bottom-bar');

            const captureBtn = this._el('button', 'ar-tryon-capture-btn');
            captureBtn.type = 'button';
            captureBtn.setAttribute('aria-label', 'Take photo');
            captureBtn.innerHTML = ICONS.capture;
            captureBtn.addEventListener('click', () => this._capturePhoto());
            this.els.captureBtn = captureBtn;
            bottomBar.appendChild(captureBtn);

            this.els.bottomBar = bottomBar;
            activeView.appendChild(bottomBar);
        }

        // ── Loading overlay (with progress) ──
        const loadingOv = this._el('div', 'ar-tryon-overlay ar-tryon-loading');
        loadingOv.innerHTML = `
            <div class="ar-tryon-bounce">${ICONS.box}</div>
            <p class="ar-tryon-ov-title">${this.config.loadingText}</p>
            <div class="ar-tryon-progress-bar"><div class="ar-tryon-progress-fill"></div></div>
            <p class="ar-tryon-ov-subtitle">This may take a few seconds</p>`;
        this.els.loadingOv = loadingOv;
        this.els.progressFill = loadingOv.querySelector('.ar-tryon-progress-fill');
        activeView.appendChild(loadingOv);

        // ── Searching overlay ──
        const searchingOv = this._el('div', 'ar-tryon-overlay ar-tryon-searching');
        searchingOv.style.display = 'none';
        if (this.config.enableFaceGuide) {
            searchingOv.innerHTML = `<div class="ar-tryon-face-frame"><p>${this.config.searchingText}</p></div>`;
        }
        this.els.searchingOv = searchingOv;
        activeView.appendChild(searchingOv);

        // ── Error overlay ──
        const errorOv = this._el('div', 'ar-tryon-overlay ar-tryon-error');
        errorOv.style.display = 'none';
        errorOv.innerHTML = `
            <div class="ar-tryon-error-icon">${ICONS.info}</div>
            <p class="ar-tryon-ov-title ar-tryon-error-title">Camera Error</p>
            <p class="ar-tryon-error-msg"></p>`;
        const errRetryBtn = this._el('button', 'ar-tryon-error-retry-btn');
        errRetryBtn.type = 'button';
        errRetryBtn.textContent = 'Retry';
        errRetryBtn.addEventListener('click', () => {
            this.deactivate();
            setTimeout(() => this.activate(), 300);
        });
        errorOv.appendChild(errRetryBtn);

        const errCloseBtn = this._el('button', 'ar-tryon-error-close-btn');
        errCloseBtn.type = 'button';
        errCloseBtn.textContent = 'Close';
        errCloseBtn.addEventListener('click', () => this.deactivate());
        errorOv.appendChild(errCloseBtn);
        this.els.errorOv = errorOv;
        activeView.appendChild(errorOv);

        // ── Photo preview overlay ──
        const photoOv = this._el('div', 'ar-tryon-overlay ar-tryon-photo-preview');
        photoOv.style.display = 'none';
        this.els.photoOv = photoOv;
        activeView.appendChild(photoOv);

        this.els.activeView = activeView;
        this.container.appendChild(activeView);
    }

    /** Apply dynamic button styles from settings */
    _applyButtonStyle(btn) {
        const { btnColor, btnTextColor, btnStyle } = this.config;

        // Clear any mode-specific overrides (modal mode handles its own style)
        if (this.container.classList.contains('ar-tryon-mode-modal')) return;

        switch (btnStyle) {
            case 'solid':
                btn.style.backgroundColor = btnColor;
                btn.style.color = btnTextColor;
                btn.style.border = 'none';
                btn.style.boxShadow = 'none';
                break;
            case 'outline':
                btn.style.backgroundColor = 'transparent';
                btn.style.color = btnColor;
                btn.style.border = `2px solid ${btnColor}`;
                btn.style.boxShadow = 'none';
                break;
            case 'minimal':
                btn.style.backgroundColor = 'transparent';
                btn.style.color = btnColor;
                btn.style.border = 'none';
                btn.style.boxShadow = 'none';
                btn.style.textDecoration = 'underline';
                break;
        }
    }

    /** Helper: create an element with className(s) */
    _el(tag, className) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
    }

    /* ─────────────────────────────────────────────────────────
     *  STATE MANAGEMENT
     * ───────────────────────────────────────────────────────── */
    _setState(newState, errorMsg = '') {
        this.state = newState;
        const { statusBadge, loadingOv, searchingOv, errorOv } = this.els;
        const dot = statusBadge?.querySelector('.ar-tryon-status-dot');
        const text = statusBadge?.querySelector('.ar-tryon-status-text');

        // Hide all overlays first
        if (loadingOv) loadingOv.style.display = 'none';
        if (searchingOv) searchingOv.style.display = 'none';
        if (errorOv) errorOv.style.display = 'none';

        switch (newState) {
            case 'loading':
                if (dot) dot.className = 'ar-tryon-status-dot is-loading';
                if (text) text.textContent = 'Initializing...';
                if (loadingOv) loadingOv.style.display = '';
                break;
            case 'searching':
                if (dot) dot.className = 'ar-tryon-status-dot is-searching';
                if (text) text.textContent = this.config.searchingText;
                if (searchingOv) searchingOv.style.display = '';
                break;
            case 'tracking':
                if (dot) dot.className = 'ar-tryon-status-dot is-tracking';
                if (text) text.textContent = this.config.trackingText;
                break;
            case 'error':
                if (dot) dot.className = 'ar-tryon-status-dot is-error';
                if (text) text.textContent = 'Error';
                if (errorOv) {
                    const msg = errorOv.querySelector('.ar-tryon-error-msg');
                    if (msg) msg.textContent = this._friendlyError(errorMsg);
                    errorOv.style.display = '';
                }
                break;
        }
    }

    /**
     * Convert technical error messages to user-friendly text.
     */
    _friendlyError(msg) {
        if (!msg) return 'An unknown error occurred. Please try again.';

        const lower = msg.toLowerCase();

        if (lower.includes('secure context') || lower.includes('https')) {
            return 'This feature requires a secure connection (HTTPS). Please make sure your site has an SSL certificate installed.';
        }
        if (lower.includes('notallowed') || lower.includes('permission')) {
            return 'Camera access was denied. Please allow camera permissions in your browser settings and try again.';
        }
        if (lower.includes('notfound') || lower.includes('no camera')) {
            return 'No camera was found on this device. Please connect a webcam and try again.';
        }
        if (lower.includes('notreadable') || lower.includes('in use')) {
            return 'Your camera is being used by another application. Please close other apps using the camera and try again.';
        }
        if (lower.includes('facemesh') || lower.includes('mediapipe')) {
            return 'Could not load the face detection AI. Please check your internet connection and try again.';
        }
        if (lower.includes('model') || lower.includes('gltf') || lower.includes('glb')) {
            return 'Could not load the 3D glasses model. The file may be corrupted or inaccessible.';
        }

        return msg;
    }

    /**
     * Update loading progress bar.
     */
    _setProgress(pct) {
        if (this.els.progressFill) {
            this.els.progressFill.style.width = `${Math.min(pct, 100)}%`;
        }
    }

    /* ─────────────────────────────────────────────────────────
     *  ACTIVATE / DEACTIVATE
     * ───────────────────────────────────────────────────────── */
    async activate() {
        this.isDestroyed = false;
        this.faceData = null;
        this.faceDetected = false;
        this.ipdSamples = [];
        this.lockedIPD = 0;
        this._noFaceFrames = 0;
        this._modelReady = false;

        // Reset filters
        Object.values(this._filters).forEach(f => f.reset());

        this.container.classList.add('is-active');
        this.els.idleView.style.display = 'none';
        this.els.activeView.style.display = '';
        this._setState('loading');
        this._setProgress(0);

        try {
            this._setProgress(5);

            // 1. Lazy load Three.js
            await loadThreeJS();
            this._setProgress(10);

            // 2. Lazy load MediaPipe FaceMesh
            if (!window.FaceMesh) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Failed to load MediaPipe FaceMesh from CDN'));
                    document.head.appendChild(script);
                });
            }
            this._setProgress(15);

            await this._initCamera();
            this._setProgress(30);
            this._initThreeScene();
            this._setProgress(45);
            await this._loadGlassesModel();
            this._setProgress(70);
            await this._initFaceMesh();
            this._setProgress(100);
            this._startLoops();
        } catch (err) {
            console.error('[AR Try-On] Initialization error:', err);
            this._setState('error', err.message || 'Could not initialize AR.');
        }
    }

    deactivate() {
        this.isDestroyed = true;

        // Stop animation loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Stop Three.js render loop
        if (this.renderer) {
            this.renderer.setAnimationLoop(null);
        }

        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }

        // Close MediaPipe
        if (this.faceMesh) {
            try { this.faceMesh.close(); } catch (_) { /* noop */ }
            this.faceMesh = null;
        }

        // Dispose Three.js
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer = null;
        }
        this.scene = null;
        this.camera = null;
        this.glassesGroup = null;
        this.modelGroup = null;
        this.headOccluder = null;
        this.glassesScene = null;

        // Clean canvas container
        if (this.els.canvasCtn) this.els.canvasCtn.innerHTML = '';

        // Reset video
        if (this.video) this.video.srcObject = null;

        // Disconnect resize observer
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }

        // Hide photo preview
        if (this.els.photoOv) {
            this.els.photoOv.style.display = 'none';
            this.els.photoOv.innerHTML = '';
        }

        // Show idle view
        this.container.classList.remove('is-active');
        if (this.els.activeView) this.els.activeView.style.display = 'none';
        if (this.els.idleView) this.els.idleView.style.display = '';
        this.state = 'idle';
        this.faceDetected = false;
        this._modelReady = false;
    }

    /* ─────────────────────────────────────────────────────────
     *  CAMERA INITIALIZATION
     * ───────────────────────────────────────────────────────── */
    async _initCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera requires a secure context (HTTPS).');
        }

        const res = this.config.cameraRes;

        this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: res },
                height: { ideal: Math.round(res * 0.75) },
                facingMode: this.facingMode,
            },
            audio: false,
        });

        this.video.srcObject = this.stream;

        return new Promise((resolve, reject) => {
            this.video.onloadedmetadata = async () => {
                try {
                    await this.video.play();
                    resolve();
                } catch (err) {
                    reject(new Error('Could not start camera: ' + err.message));
                }
            };
            this.video.onerror = () => reject(new Error('Camera video failed to load.'));
        });
    }

    /**
     * Switch between front and back cameras.
     */
    async _switchCamera() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';

        // Stop current stream
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
        }

        // Mirror only the front camera
        this.video.style.transform = this.facingMode === 'user' ? 'scaleX(-1)' : 'none';

        try {
            await this._initCamera();
        } catch (err) {
            console.error('[AR Try-On] Camera switch failed:', err);
            // Revert to previous camera
            this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
            this.video.style.transform = this.facingMode === 'user' ? 'scaleX(-1)' : 'none';
            await this._initCamera();
        }
    }

    /* ─────────────────────────────────────────────────────────
     *  THREE.JS SCENE SETUP
     * ───────────────────────────────────────────────────────── */
    _initThreeScene() {
        const ctn = this.els.canvasCtn;
        const w = ctn.clientWidth;
        const h = ctn.clientHeight;

        // Renderer — alpha, antialias off, high-performance
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
        });
        const dpr = Math.min(Math.max(window.devicePixelRatio, 1), 1.5);
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.sortObjects = true;
        ctn.appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();

        // Camera — fov=45, near=0.1, far=1000, position=[0,0,5]
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        this.camera.position.set(0, 0, 5);

        // Lights
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        // Head occluder — depth-only invisible mesh for realistic self-occlusion
        const occMat = new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: true,
            side: THREE.DoubleSide,
        });
        this.headOccluder = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), occMat);
        this.headOccluder.renderOrder = 1;
        this.scene.add(this.headOccluder);

        // Glasses group hierarchy
        this.glassesGroup = new THREE.Group();
        this.glassesGroup.renderOrder = 2;
        this.glassesGroup.visible = false; // Hidden until face is detected AND model is ready
        this.modelGroup = new THREE.Group();
        this.modelGroup.renderOrder = 4;
        this.glassesGroup.add(this.modelGroup);
        this.scene.add(this.glassesGroup);

        // Handle container resizes
        this._resizeObserver = new ResizeObserver(() => this._onResize());
        this._resizeObserver.observe(ctn);
    }

    _onResize() {
        if (!this.renderer || !this.camera) return;
        const ctn = this.els.canvasCtn;
        const w = ctn.clientWidth;
        const h = ctn.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    /* ─────────────────────────────────────────────────────────
     *  GLTF MODEL LOADING
     * ───────────────────────────────────────────────────────── */
    async _loadGlassesModel() {
        if (!this.config.modelUrl) {
            console.warn('[AR Try-On] No 3D model URL provided.');
            return;
        }

        const loader = new GLTFLoader();

        return new Promise((resolve) => {
            loader.load(
                this.config.modelUrl,
                (gltf) => {
                    this.glassesScene = gltf.scene;

                    // Calculate native model width from a clean clone (avoids cached scale issues)
                    const clone = this.glassesScene.clone();
                    clone.position.set(0, 0, 0);
                    clone.rotation.set(0, 0, 0);
                    clone.scale.set(1, 1, 1);
                    clone.updateMatrixWorld(true);

                    const bbox = new THREE.Box3().setFromObject(clone);
                    const size = new THREE.Vector3();
                    bbox.getSize(size);
                    this.modelWidth = Math.max(size.x, 0.001);

                    // Configure materials for AR rendering
                    this.glassesScene.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.side = THREE.DoubleSide;
                            child.material.depthWrite = true;
                            child.renderOrder = 2;
                        }
                    });

                    this.modelGroup.add(this.glassesScene);

                    // Apply initial rotation from config
                    this.modelGroup.rotation.set(
                        this.config.rotationX * Math.PI / 180,
                        this.config.rotationY * Math.PI / 180,
                        this.config.rotationZ * Math.PI / 180
                    );

                    // Mark model as ready — prevents flash of wrong-sized model
                    this._modelReady = true;

                    resolve();
                },
                // Progress callback
                (progress) => {
                    if (progress.total > 0) {
                        const pct = 45 + (progress.loaded / progress.total) * 25;
                        this._setProgress(pct);
                    }
                },
                (err) => {
                    console.error('[AR Try-On] Error loading 3D model:', err);
                    resolve(); // Don't reject — AR can work without a visible model for debugging
                }
            );
        });
    }

    /* ─────────────────────────────────────────────────────────
     *  MEDIAPIPE FACEMESH INITIALIZATION
     * ───────────────────────────────────────────────────────── */
    async _initFaceMesh() {
        const FaceMeshCtor = window.FaceMesh;
        if (!FaceMeshCtor) {
            throw new Error('Could not load MediaPipe FaceMesh. Check your internet connection.');
        }

        this.faceMesh = new FaceMeshCtor({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        this.faceMesh.onResults((results) => {
            if (this.isDestroyed) return;

            const hasFace = !!(results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0);
            if (hasFace) {
                this.faceData = results.multiFaceLandmarks[0];
                this._noFaceFrames = 0;
            } else {
                // Hysteresis: require several frames without face before hiding
                this._noFaceFrames++;
                if (this._noFaceFrames > 10) {
                    this.faceData = null;
                }
            }

            if (hasFace !== this.faceDetected) {
                // Only change state if consistent
                if (hasFace || this._noFaceFrames > 10) {
                    this.faceDetected = hasFace;
                    this._setState(hasFace ? 'tracking' : 'searching');
                    if (this.glassesGroup) {
                        this.glassesGroup.visible = hasFace && this._modelReady;
                    }
                }
            }
        });

        // Camera is ready, switch to searching
        this._setState('searching');
    }

    /* ─────────────────────────────────────────────────────────
     *  RENDER & INFERENCE LOOPS
     * ───────────────────────────────────────────────────────── */
    _startLoops() {
        // MediaPipe inference loop — non-blocking fire-and-forget pattern
        const processMediaPipe = () => {
            if (this.isDestroyed) return;

            if (this.video && this.faceMesh && this.video.readyState >= 2 && !this.isProcessing) {
                this.isProcessing = true;
                this.faceMesh.send({ image: this.video })
                    .then(() => { this.isProcessing = false; })
                    .catch(() => { this.isProcessing = false; });
            }

            if (!this.isDestroyed) {
                this.animationFrameId = requestAnimationFrame(processMediaPipe);
            }
        };
        processMediaPipe();

        // Three.js render loop
        this.renderer.setAnimationLoop(() => this._renderFrame());
    }

    /* ─────────────────────────────────────────────────────────
     *  RENDER FRAME — Core AR logic
     *  All math is preserved from the original React version,
     *  with OneEuroFilter applied for smooth tracking.
     * ───────────────────────────────────────────────────────── */
    _renderFrame() {
        if (!this.renderer || !this.scene || !this.camera) return;

        // If no face data yet, just render an empty scene
        if (!this.faceData || !this.video || !this._modelReady) {
            // Hide glasses if not tracking
            if (this.glassesGroup) this.glassesGroup.visible = false;
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Ensure glasses are visible when tracking
        if (this.glassesGroup && !this.glassesGroup.visible) {
            this.glassesGroup.visible = true;
        }

        const faceData = this.faceData;
        const now = performance.now() / 1000; // seconds for filter

        // ── Compute viewport dimensions (equivalent to R3F state.viewport) ──
        const distance = this.camera.position.z; // 5
        const vFov = this.camera.fov * Math.PI / 180;
        const viewportHeight = 2 * Math.tan(vFov / 2) * distance;
        const viewportWidth = viewportHeight * this.camera.aspect;

        // ── MediaPipe landmark indices ──
        const noseBridge = faceData[168];
        const leftEye = faceData[33];
        const rightEye = faceData[263];
        const topOfHead = faceData[10];
        const bottomOfChin = faceData[152];
        const templeLeft = faceData[454];
        const templeRight = faceData[234];

        // ── Video-to-viewport aspect ratio correction ──
        const videoAspect = this.video.videoWidth / this.video.videoHeight || 1;
        const vpAspect = viewportWidth / viewportHeight;

        let scaleX = viewportWidth;
        let scaleY = viewportHeight;

        if (vpAspect > videoAspect) {
            scaleY = viewportWidth / videoAspect;
        } else {
            scaleX = viewportHeight * videoAspect;
        }

        // ── Position: Map normalized MediaPipe coords to 3D viewport space ──
        const rawX = (0.5 - noseBridge.x) * scaleX;
        const rawY = (0.5 - noseBridge.y) * scaleY;
        const rawZ = -noseBridge.z * scaleX;

        // Apply One Euro Filter for smooth position tracking
        const x = this._filters.posX.filter(rawX, now);
        const y = this._filters.posY.filter(rawY, now);
        const z = this._filters.posZ.filter(rawZ, now);

        // ── Rotation: Build orthonormal basis from facial landmarks ──
        const toViewSpace = (p, vec) => vec.set(
            (0.5 - p.x) * scaleX,
            (0.5 - p.y) * scaleY,
            -p.z * scaleX
        );

        toViewSpace(leftEye, _vLeftEye);
        toViewSpace(rightEye, _vRightEye);
        toViewSpace(topOfHead, _vTopHead);
        toViewSpace(bottomOfChin, _vChin);
        toViewSpace(templeLeft, _vTempleLeft);
        toViewSpace(templeRight, _vTempleRight);

        _xAxis.subVectors(_vRightEye, _vLeftEye).normalize();
        _yAxis.subVectors(_vTopHead, _vChin).normalize();
        _zAxis.crossVectors(_xAxis, _yAxis).normalize();
        _yAxis.crossVectors(_zAxis, _xAxis).normalize(); // Orthogonal correction

        // Pitch clamp — prevents quaternion inversion when head tilts too far
        if (_yAxis.y < -0.5) {
            _yAxis.y = -0.5;
            _yAxis.normalize();
            _zAxis.crossVectors(_xAxis, _yAxis).normalize();
            _xAxis.crossVectors(_yAxis, _zAxis).normalize();
        }

        _rotationMatrix.makeBasis(_xAxis, _yAxis, _zAxis);
        _faceQuaternion.setFromRotationMatrix(_rotationMatrix);
        _faceQuaternion.multiply(_flipY); // Flip 180° on Y for mirrored video

        // ── IPD (Inter-Pupillary Distance) — real-time scaling ──
        const rawIPD = _vRightEye.distanceTo(_vLeftEye);

        // Keep locked IPD as reference (average of first ~60 frames)
        if (this.ipdSamples.length < 60) {
            this.ipdSamples.push(rawIPD);
            this.lockedIPD = this.ipdSamples.reduce((a, b) => a + b, 0) / this.ipdSamples.length;
        }

        // Apply filter to IPD for smooth scaling
        const baseDistance = this._filters.scale.filter(rawIPD, now);
        const { scaleFactor } = this.config;
        const modelWidth = this.modelWidth;

        // Normalized scale: IPD / modelWidth aligns glasses with eye width
        const depthCorrection = 1 + noseBridge.z * 0.5;
        const normalizedScale = baseDistance / modelWidth;
        const adjustedScale = Math.max(normalizedScale * scaleFactor * depthCorrection, 0.001);

        // ── Dynamic Z offset based on nose depth ──
        const dynamicOffsetZ = this.config.offsetZ - noseBridge.z * 0.2;

        // ── Apply transforms to glasses group ──
        this.glassesGroup.position.set(x, y, z);
        this.glassesGroup.scale.set(adjustedScale, adjustedScale, adjustedScale);
        this.glassesGroup.quaternion.copy(_faceQuaternion);

        // Apply offset to model subgroup
        if (this.modelGroup) {
            this.modelGroup.position.set(
                this.config.offsetX,
                this.config.offsetY,
                dynamicOffsetZ
            );
        }

        // ── Head occluder: dynamically sized cube based on eye distance ──
        if (this.headOccluder) {
            const eyeDist = rawIPD;
            const headWidth = eyeDist * 1.8;
            const headHeight = eyeDist * 2.2;
            const headDepth = eyeDist * 1.5 + Math.abs(z) * 0.5;

            this.headOccluder.position.set(x, y + 0.1 * eyeDist, z - headDepth);
            this.headOccluder.quaternion.copy(_faceQuaternion);
            this.headOccluder.scale.set(headWidth, headHeight, headDepth);
        }

        // ── Render ──
        this.renderer.render(this.scene, this.camera);
    }

    /* ─────────────────────────────────────────────────────────
     *  PHOTO CAPTURE
     *  Composites video + 3D overlay into a single image.
     * ───────────────────────────────────────────────────────── */
    _capturePhoto() {
        if (!this.video || !this.renderer) return;

        // Flash effect
        const flash = this._el('div', 'ar-tryon-flash');
        this.els.activeView.appendChild(flash);
        setTimeout(() => flash.remove(), 500);

        // We want the final image to exactly match what the user sees
        // (the canvas container dimensions, with object-fit: cover logic applied to the video)
        const ctn = this.els.canvasCtn;
        const cw = ctn.clientWidth;
        const ch = ctn.clientHeight;

        if (cw === 0 || ch === 0) return;

        // Create composite canvas
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');

        const vw = this.video.videoWidth;
        const vh = this.video.videoHeight;

        // Calculate "object-fit: cover" cropping
        const videoRatio = vw / vh;
        const canvasRatio = cw / ch;

        let drawW = vw;
        let drawH = vh;
        let offsetX = 0;
        let offsetY = 0;

        if (videoRatio > canvasRatio) {
            // Video is wider than canvas -> crop sides
            drawW = vh * canvasRatio;
            offsetX = (vw - drawW) / 2;
        } else {
            // Video is taller than canvas -> crop top/bottom
            drawH = vw / canvasRatio;
            offsetY = (vh - drawH) / 2;
        }

        // Draw mirrored camera background
        ctx.save();
        if (this.facingMode === 'user') {
            ctx.translate(cw, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.video, offsetX, offsetY, drawW, drawH, 0, 0, cw, ch);
        ctx.restore();

        // Ensure 3D frame is up-to-date
        this.renderer.render(this.scene, this.camera);
        
        // Draw Three.js overlay on top
        const glCanvas = this.renderer.domElement;
        ctx.drawImage(glCanvas, 0, 0, cw, ch);

        // Generate data URL
        const dataUrl = canvas.toDataURL('image/png');

        // Show photo preview
        this._showPhotoPreview(dataUrl);
    }

    /**
     * Show the captured photo preview with download/share options.
     */
    _showPhotoPreview(dataUrl) {
        const ov = this.els.photoOv;
        if (!ov) return;

        ov.innerHTML = '';
        ov.style.display = '';

        const inner = this._el('div', 'ar-tryon-photo-inner');

        // Photo image
        const img = this._el('img', 'ar-tryon-photo-img');
        img.src = dataUrl;
        img.alt = 'AR Try-On capture';
        inner.appendChild(img);

        // Actions bar
        const actions = this._el('div', 'ar-tryon-photo-actions');

        // Download button
        const dlBtn = this._el('a', 'ar-tryon-photo-action-btn');
        dlBtn.href = dataUrl;
        dlBtn.download = `ar-tryon-${Date.now()}.png`;
        dlBtn.innerHTML = `${ICONS.download}<span>Save</span>`;
        actions.appendChild(dlBtn);

        // Close button
        const closeBtn = this._el('button', 'ar-tryon-photo-action-btn');
        closeBtn.type = 'button';
        closeBtn.innerHTML = `${ICONS.close}<span>Close</span>`;
        closeBtn.addEventListener('click', () => {
            ov.style.display = 'none';
            ov.innerHTML = '';
        });
        actions.appendChild(closeBtn);

        inner.appendChild(actions);
        ov.appendChild(inner);
    }

    /* ─────────────────────────────────────────────────────────
     *  PUBLIC API — Runtime config updates (used by admin UI)
     * ───────────────────────────────────────────────────────── */

    /**
     * Update AR config at runtime. Changes apply to the very next render frame.
     * Used by the admin calibration UI to provide real-time slider feedback.
     *
     * @param {Object} cfg - Partial config object
     */
    updateConfig(cfg) {
        if (cfg.modelUrl !== undefined)    this.config.modelUrl = cfg.modelUrl;
        if (cfg.scaleFactor !== undefined) this.config.scaleFactor = cfg.scaleFactor;
        if (cfg.offsetX !== undefined)     this.config.offsetX = cfg.offsetX;
        if (cfg.offsetY !== undefined)     this.config.offsetY = cfg.offsetY;
        if (cfg.offsetZ !== undefined)     this.config.offsetZ = cfg.offsetZ;
        if (cfg.rotationX !== undefined) {
            this.config.rotationX = cfg.rotationX;
            if (this.modelGroup) {
                this.modelGroup.rotation.x = cfg.rotationX * Math.PI / 180;
            }
        }
        if (cfg.rotationY !== undefined) {
            this.config.rotationY = cfg.rotationY;
            if (this.modelGroup) {
                this.modelGroup.rotation.y = cfg.rotationY * Math.PI / 180;
            }
        }
        if (cfg.rotationZ !== undefined) {
            this.config.rotationZ = cfg.rotationZ;
            if (this.modelGroup) {
                this.modelGroup.rotation.z = cfg.rotationZ * Math.PI / 180;
            }
        }
    }

    /**
     * Hot-swap the 3D model at runtime without restarting the AR session.
     *
     * @param {string} newModelUrl - URL to the new .glb/.gltf file
     * @returns {Promise<void>}
     */
    async swapModel(newModelUrl) {
        if (!newModelUrl) return;
        this.config.modelUrl = newModelUrl;
        this._modelReady = false;

        // Remove current model from scene
        if (this.glassesScene && this.modelGroup) {
            this.modelGroup.remove(this.glassesScene);
            this.glassesScene.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
            this.glassesScene = null;
        }

        // Load new model
        if (!this.modelGroup) return; // Scene not initialized yet

        const loader = new GLTFLoader();
        return new Promise((resolve) => {
            loader.load(
                newModelUrl,
                (gltf) => {
                    this.glassesScene = gltf.scene;

                    const clone = this.glassesScene.clone();
                    clone.position.set(0, 0, 0);
                    clone.rotation.set(0, 0, 0);
                    clone.scale.set(1, 1, 1);
                    clone.updateMatrixWorld(true);

                    const bbox = new THREE.Box3().setFromObject(clone);
                    const size = new THREE.Vector3();
                    bbox.getSize(size);
                    this.modelWidth = Math.max(size.x, 0.001);

                    this.glassesScene.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.side = THREE.DoubleSide;
                            child.material.depthWrite = true;
                            child.renderOrder = 2;
                        }
                    });

                    this.modelGroup.add(this.glassesScene);

                    // Apply rotation
                    this.modelGroup.rotation.set(
                        this.config.rotationX * Math.PI / 180,
                        this.config.rotationY * Math.PI / 180,
                        this.config.rotationZ * Math.PI / 180
                    );

                    this._modelReady = true;
                    console.log('[AR Try-On] Model swapped successfully:', newModelUrl);
                    resolve();
                },
                undefined,
                (err) => {
                    console.error('[AR Try-On] Error swapping model:', err);
                    resolve();
                }
            );
        });
    }

    /* ─────────────────────────────────────────────────────────
     *  FULL CLEANUP
     * ───────────────────────────────────────────────────────── */
    destroy() {
        this.deactivate();
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  AUTO-INITIALIZATION
 *  Find all containers with the class 'ar-tryon-container' and instantiate.
 * ═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ar-tryon-container').forEach((container) => {
        container._arTryOnInstance = new ARTryOn(container);
    });
});

// Expose on window for admin JS access (non-module scripts)
window.ARTryOnEngine = ARTryOn;

// Export for programmatic use
export { ARTryOn, OneEuroFilter };
