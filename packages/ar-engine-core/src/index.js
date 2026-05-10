import { FaceTracker } from './FaceTracker.js';
import { Renderer } from './Renderer.js';
import { UIManager } from './UIManager.js';

export class AREngine {
    constructor({ apiKey, container, videoElement, theme = {}, config = {} }) {
        this.apiKey = apiKey;
        this.container = container;
        this.videoElement = videoElement;
        this.theme = theme;
        this.config = {
            scaleFactor: 2.5,
            offsetX: 0,
            offsetY: 0,
            offsetZ: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            cameraRes: 640,
            ...config
        };

        this.tracker = null;
        this.renderer = null;
        this.isReady = false;
        this.isDestroyed = false;

        // Validation check
        if (!this.apiKey) {
            throw new Error('[AREngine] Missing API_KEY. Initialization rejected.');
        }
    }

    async init() {
        if (this.isDestroyed) return;
        
        try {
            await this._validateLicense();
            if (this.isDestroyed) return;

            this.renderer = new Renderer();
            this.renderer.init(this.container);
            if (this.isDestroyed) {
                this.renderer.stop();
                this.renderer = null;
                return;
            }

            this.tracker = new FaceTracker({
                cameraRes: this.config.cameraRes,
                onFaceDetected: (results) => {
                    if (!this.isDestroyed) this._onTrackingFrame(results);
                },
                onError: (err) => {
                    if (!this.isDestroyed) console.error('[AREngine] Tracker error:', err);
                }
            });

            await this.tracker.init(this.videoElement);
            
            if (this.isDestroyed) {
                this.tracker.stop();
                this.tracker = null;
                if (this.renderer) {
                    this.renderer.stop();
                    this.renderer = null;
                }
                return;
            }

            this.isReady = true;

        } catch (error) {
            if (!this.isDestroyed) {
                console.error('[AREngine] Initialization failed:', error);
                throw error;
            }
        }
    }

    async loadModel(modelUrl) {
        if (!this.renderer) throw new Error('Renderer not initialized');
        await this.renderer.loadModel(modelUrl, this.config);
    }

    _onTrackingFrame(results) {
        if (!this.isReady || !this.renderer) return;

        const hasFace = !!(results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0);
        const faceData = hasFace ? results.multiFaceLandmarks[0] : null;

        this.renderer.render(faceData, this.videoElement, this.config);
    }

    async switchCamera() {
        if (this.tracker) {
            await this.tracker.switchCamera();
        }
    }

    stop() {
        console.log('[AREngine] stop() called. Cleaning up subsystems...');
        this.isReady = false;
        this.isDestroyed = true;

        if (this.tracker) {
            try {
                this.tracker.stop();
            } catch (e) {
                console.error('[AREngine] Error stopping tracker:', e);
            }
            this.tracker = null;
        }

        if (this.renderer) {
            try {
                this.renderer.stop();
            } catch (e) {
                console.error('[AREngine] Error stopping renderer:', e);
            }
            this.renderer = null;
        }
        
        console.log('[AREngine] stop() complete.');
    }

    async _validateLicense() {
        try {
            const res = await fetch('https://kdffentiktyykabbcqud.supabase.co/functions/v1/validate-license', {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid License or Domain');
            }

            console.log('[AREngine] License validated successfully.');
            return true;
        } catch (err) {
            console.error('[AREngine] License validation error:', err.message);
            throw new Error(`License validation failed: ${err.message}`);
        }
    }

    // ─── STATIC BOOTSTRAP FOR WORDPRESS/CDN ───────────────────────────────────
    
    /**
     * Automatically scans the DOM for buttons with [data-ar-button]
     * and sets up the click listeners to launch the AR modal.
     */
    static bootstrap() {
        const buttons = document.querySelectorAll('[data-ar-button]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const apiKey = btn.getAttribute('data-api-key');
                const modelUrl = btn.getAttribute('data-model-url');
                const productName = btn.getAttribute('data-product-name') || 'AR Try-On';
                
                // Config attributes
                const config = {
                    scaleFactor: parseFloat(btn.getAttribute('data-scale')) || 2.5,
                    offsetX: parseFloat(btn.getAttribute('data-offset-x')) || 0,
                    offsetY: parseFloat(btn.getAttribute('data-offset-y')) || 0,
                    offsetZ: parseFloat(btn.getAttribute('data-offset-z')) || 0,
                };

                AREngine.launchModal({ apiKey, modelUrl, productName, config });
            });
        });
    }

    /**
     * Manually launches the AR modal with a specific configuration.
     */
    static async launchModal({ apiKey, modelUrl, productName, theme = {}, config = {} }) {
        const ui = new UIManager(theme);
        let engine = null;

        const onClose = () => {
            if (engine) engine.stop();
            ui.destroy();
        };

        const { video, container } = ui.createModal({ onClose, productName });
        ui.showLoading(true);

        try {
            engine = new AREngine({ apiKey, container, videoElement: video, theme, config });
            await engine.init();
            await engine.loadModel(modelUrl);
            ui.showLoading(false);
        } catch (err) {
            ui.showError(err.message);
            console.error('[AREngine] Modal launch failed:', err);
        }
    }
}

// Auto-bootstrap if we are in a browser and not being imported as a module
if (typeof window !== 'undefined') {
    window.AREngine = AREngine;
    // We wait for DOMContentLoaded to ensure buttons are present
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AREngine.bootstrap());
    } else {
        AREngine.bootstrap();
    }
}
