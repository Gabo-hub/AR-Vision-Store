import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef
} from 'react';
import { createPortal } from 'react-dom';
import { AREngine } from '@ar-project/engine-core';
import './index.css';

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconAR = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 7a2 2 0 012-2h1.5M22 7a2 2 0 00-2-2h-1.5M2 17a2 2 0 002 2h1.5M22 17a2 2 0 01-2 2h-1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l-2 2m2-2l2 2m-2-2v4" />
        <rect x="7" y="9" width="10" height="7" rx="1" strokeLinecap="round" />
    </svg>
);

const IconClose = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ─── ARTryOnWidget (low-level, manual integration) ────────────────────────────

export const ARTryOnWidget = forwardRef(({
    apiKey,
    modelUrl,
    theme = {},
    config = {},
    onReady,
    onError,
    className = '',
    style = {}
}, ref) => {
    const containerRef = useRef(null);
    const videoRef     = useRef(null);
    const engineRef    = useRef(null);

    const [isInitializing, setIsInitializing] = useState(true);
    const [engineError,    setEngineError]    = useState(null);

    const stopAllTracks = useCallback(() => {
        const vid = videoRef.current;
        if (vid?.srcObject) {
            vid.srcObject.getTracks().forEach(t => { t.stop(); t.enabled = false; });
            vid.srcObject = null;
            vid.load();
        }
    }, []);

    const forceStopEngine = useCallback(async () => {
        console.log('[ARTryOnWidget] forceStopEngine');
        if (engineRef.current) {
            await engineRef.current.stop();
            engineRef.current = null;
        }
        stopAllTracks();
    }, [stopAllTracks]);

    useImperativeHandle(ref, () => ({
        switchCamera: () => engineRef.current?.switchCamera(),
        loadModel:    (url) => engineRef.current?.loadModel(url),
        close:        () => forceStopEngine(),
    }), [forceStopEngine]);

    useEffect(() => {
        let mounted = true;
        let activeEngine = null;

        const initializeEngine = async () => {
            console.log('[ARTryOnWidget] init start');
            try {
                setIsInitializing(true);
                setEngineError(null);

                activeEngine = new AREngine({
                    apiKey,
                    container:    containerRef.current,
                    videoElement: videoRef.current,
                    theme,
                    config
                });

                const safetyTimer = setTimeout(() => {
                    if (mounted) setIsInitializing(false);
                }, 15000);

                await activeEngine.init();
                console.log('[ARTryOnWidget] engine init OK');

                if (!mounted) { activeEngine?.stop(); return; }

                if (modelUrl) {
                    console.log('[ARTryOnWidget] loading model:', modelUrl);
                    await activeEngine.loadModel(modelUrl);
                    console.log('[ARTryOnWidget] model loaded');
                }

                clearTimeout(safetyTimer);

                if (mounted) {
                    engineRef.current = activeEngine;
                    setIsInitializing(false);
                    onReady?.(activeEngine);
                } else {
                    activeEngine?.stop();
                }
            } catch (err) {
                console.error('[ARTryOnWidget] init failed:', err);
                if (mounted) {
                    setEngineError(err.message);
                    setIsInitializing(false);
                    onError?.(err);
                } else {
                    activeEngine?.stop();
                }
            }
        };

        if (apiKey && containerRef.current && videoRef.current) {
            initializeEngine();
        }

        return () => {
            console.log('[ARTryOnWidget] cleanup');
            mounted = false;

            // Stop the engine stored in ref (the final one)
            engineRef.current?.stop();
            engineRef.current = null;

            // Stop the engine from this specific effect run (important for StrictMode)
            activeEngine?.stop();
            activeEngine = null;
        };
    }, [apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Dynamic model hot-swap
    useEffect(() => {
        if (engineRef.current && modelUrl && !isInitializing) {
            engineRef.current.loadModel(modelUrl).catch(err => {
                console.error('[ARTryOnWidget] dynamic loadModel failed:', err);
                onError?.(err);
            });
        }
    }, [modelUrl, isInitializing]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            className={`ar-tryon-wrapper ${className}`}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: theme.backgroundColor || '#000',
                ...style
            }}
        >
            <video
                ref={videoRef}
                style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    zIndex: 1
                }}
                playsInline autoPlay muted
            />

            <div
                ref={containerRef}
                className="ar-canvas-container"
                style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}
            />

            {isInitializing && (
                <div className="ar-loading-overlay">
                    <div className="ar-loading-spinner" />
                    <span>Cargando experiencia AR…</span>
                </div>
            )}

            {engineError && (
                <div className="ar-error-overlay">
                    <h3>Error</h3>
                    <p>{engineError}</p>
                </div>
            )}
        </div>
    );
});

ARTryOnWidget.displayName = 'ARTryOnWidget';

// ─── ARTryOnButton (high-level, plug-and-play) ────────────────────────────────

const IconRefresh = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

export const ARTryOnButton = ({
    apiKey,
    modelUrl,
    productName      = '',
    buttonText       = 'Probar con AR',
    showCameraSwitch = false,
    theme            = {},
    config           = {},
    onReady,
    onError,
    className        = '',
    style            = {},
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const widgetRef           = useRef(null);

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = useCallback(() => setIsOpen(false), []);

    const handleSwitchCamera = useCallback(() => {
        widgetRef.current?.switchCamera();
    }, []);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, handleClose]);

    const modal = isOpen && (
        <div className="ar-modal-overlay" role="dialog" aria-modal="true" aria-label="AR Try-On">
            <div className="ar-modal-backdrop" onClick={handleClose} />

            <div className="ar-modal-container">
                <button
                    className="ar-modal-close"
                    onClick={handleClose}
                    aria-label="Cerrar experiencia AR"
                >
                    <IconClose />
                </button>

                <div className="ar-modal-content">
                    <ARTryOnWidget
                        ref={widgetRef}
                        apiKey={apiKey}
                        modelUrl={modelUrl}
                        theme={theme}
                        config={config}
                        onReady={onReady}
                        onError={onError}
                    />
                </div>

                <div className="ar-modal-footer">
                    <span className="ar-product-name">{productName}</span>
                    <div className="ar-modal-footer-actions">
                        {showCameraSwitch && (
                            <button
                                className="ar-icon-btn"
                                onClick={handleSwitchCamera}
                                aria-label="Cambiar cámara"
                            >
                                <IconRefresh />
                            </button>
                        )}
                        <span className="ar-modal-hint">ESC o ✕ para cerrar</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                className={`ar-tryon-trigger ${className}`}
                style={style}
                onClick={() => setIsOpen(true)}
                aria-haspopup="dialog"
            >
                <IconAR />
                {buttonText}
            </button>

            {typeof document !== 'undefined'
                ? createPortal(modal, document.body)
                : modal
            }
        </>
    );
};

ARTryOnButton.displayName = 'ARTryOnButton';
