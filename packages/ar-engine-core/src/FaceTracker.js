// @mediapipe/face_mesh@0.4.1633559619 exports FaceMesh as a named property on the module object.
import faceMeshModule from '@mediapipe/face_mesh';
const FaceMeshClass = faceMeshModule?.FaceMesh ?? faceMeshModule?.default?.FaceMesh ?? (typeof window !== 'undefined' ? window.FaceMesh : null);

// ─── WASM SINGLETON ─────────────────────────────────────────────────────────
// The MediaPipe WASM runtime can ONLY be initialized once per page load.
// Calling faceMesh.close() permanently aborts the WASM module — subsequent
// new FaceMesh() calls will crash because the CDN scripts are already loaded
// but now in an aborted state.
//
// Solution: Create one FaceMesh instance at module scope, keep it alive
// forever, and simply stop sending frames when the tracker is inactive.
// ─────────────────────────────────────────────────────────────────────────────
const MP_VERSION = '0.4.1633559619';
let _sharedFaceMesh = null;
let _faceMeshReady = false;
let _faceMeshInitPromise = null;

function getSharedFaceMesh(onResults) {
    if (!_sharedFaceMesh) {
        _sharedFaceMesh = new FaceMeshClass({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${MP_VERSION}/${file}`;
            },
        });

        _sharedFaceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
    }

    // Always update the results callback to the current tracker's handler
    _sharedFaceMesh.onResults(onResults);
    return _sharedFaceMesh;
}

export class FaceTracker {
    constructor({ onFaceDetected, onError, cameraRes = 640 }) {
        this.onFaceDetected = onFaceDetected;
        this.onError = onError;
        this.cameraRes = cameraRes;

        this.stream = null;
        this.video = null;
        this.facingMode = 'user';
        this.isDestroyed = false;
        this.animationFrameId = null;
        this._metadataTimeoutId = null;
        this._faceMesh = null; // reference to shared instance (never closed)
    }

    async init(videoElement) {
        this.video = videoElement;
        this.isDestroyed = false;
        this._metadataTimeoutId = null;

        try {
            if (!FaceMeshClass) {
                throw new Error('[FaceTracker] FaceMesh class could not be loaded. Check @mediapipe/face_mesh import.');
            }

            // Get the shared (singleton) FaceMesh and bind our callback
            this._faceMesh = getSharedFaceMesh((results) => {
                if (!this.isDestroyed && this.onFaceDetected) {
                    this.onFaceDetected(results);
                }
            });

            // Acquire camera stream
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera requires a secure context (HTTPS).');
            }

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: this.cameraRes },
                    height: { ideal: Math.round(this.cameraRes * 0.75) },
                    facingMode: this.facingMode,
                },
                audio: false,
            });

            // Bail if stop() was called while awaiting getUserMedia
            if (this.isDestroyed) {
                console.log('[FaceTracker] Destroyed during getUserMedia. Releasing stream.');
                this.stream.getTracks().forEach(t => t.stop());
                this.stream = null;
                return;
            }

            this.video.srcObject = this.stream;

            // Video may already be ready (e.g. re-init after camera switch)
            if (this.video.readyState >= 2) {
                console.log('[FaceTracker] Video already ready. Starting loop.');
                await this.video.play();
                if (!this.isDestroyed) this._startLoop();
                return;
            }

            return new Promise((resolve, reject) => {
                this.video.onloadedmetadata = async () => {
                    try {
                        if (this.isDestroyed) { resolve(); return; }
                        await this.video.play();
                        if (!this.isDestroyed) this._startLoop();
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                };

                this.video.onerror = () => reject(new Error('Video element error.'));

                // Backup: if metadata event never fires but video is ready
                this._metadataTimeoutId = setTimeout(() => {
                    this._metadataTimeoutId = null;
                    if (!this.video || this.isDestroyed) return;
                    if (this.video.readyState >= 2) {
                        console.warn('[FaceTracker] Metadata event missed — video is ready anyway.');
                        this.video.play()
                            .then(() => { if (!this.isDestroyed) this._startLoop(); resolve(); })
                            .catch(reject);
                    }
                }, 3000);
            });

        } catch (error) {
            if (this.onError) this.onError(error);
            throw error;
        }
    }

    _startLoop() {
        // Cancel any existing loop first (safety)
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        let isProcessing = false;

        const loop = async () => {
            if (this.isDestroyed) return; // ← entry guard

            if (this.video && this._faceMesh && this.video.readyState >= 2 && !isProcessing) {
                isProcessing = true;
                try {
                    await this._faceMesh.send({ image: this.video });
                } catch (err) {
                    if (!this.isDestroyed) {
                        console.warn('[FaceTracker] Inference error:', err);
                    }
                } finally {
                    isProcessing = false;
                }
            }

            // Re-check AFTER the async send — isDestroyed may have flipped during await
            if (!this.isDestroyed) {
                this.animationFrameId = requestAnimationFrame(loop);
            }
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    // Alias for backwards compat (was public before)
    startInferenceLoop() { this._startLoop(); }

    async switchCamera() {
        if (this.isDestroyed) return;

        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';

        // Stop current stream
        if (this.stream) {
            this.stream.getTracks().forEach(t => { t.stop(); t.enabled = false; });
            this.stream = null;
        }

        // Stop inference loop (but don't destroy the tracker)
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Give the OS a moment to release hardware before re-opening
        await new Promise(resolve => setTimeout(resolve, 200));

        this.video.style.transform = this.facingMode === 'user' ? 'scaleX(-1)' : 'none';

        // Re-init with same tracker (preserves shared FaceMesh)
        const prevDestroyed = this.isDestroyed;
        this.isDestroyed = false; // temporarily allow re-init
        await this.init(this.video);
        // isDestroyed restored by init() itself
    }

    stop() {
        if (this.isDestroyed) return;
        this.isDestroyed = true; // ← first, so in-flight rAF callbacks exit

        // Cancel backup metadata timeout
        if (this._metadataTimeoutId !== null) {
            clearTimeout(this._metadataTimeoutId);
            this._metadataTimeoutId = null;
        }

        // Stop inference loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Release camera hardware — stop every track individually
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            this.stream = null;
        }

        // Detach stream from video element so browser releases the camera LED
        // ONLY if it's our stream — avoids race conditions in StrictMode
        if (this.video) {
            this.video.pause();
            if (this.video.srcObject === this.stream) {
                this.video.srcObject = null;
                this.video.src = '';
                try { this.video.load(); } catch (_) { /* ignore */ }
            }
            this.video.onloadedmetadata = null;
            this.video.onplay = null;
            this.video.onpause = null;
            this.video.onerror = null;
            this.video = null;
        }

        // DO NOT call this._faceMesh.close() — it permanently aborts the WASM
        // module. The singleton stays alive for the next session.
        this._faceMesh = null; // just drop our reference
    }
}
