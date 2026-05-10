/**
 * UIManager
 * Handles the creation and management of the AR Modal/Dialog UI for Vanilla JS/WordPress.
 */
export class UIManager {
    constructor(theme = {}) {
        this.theme = theme;
        this.modal = null;
        this.backdrop = null;
        this.container = null;
        this.video = null;
        this.canvasContainer = null;
        this.closeBtn = null;
        this.loadingOverlay = null;
        this.errorOverlay = null;

        UIManager.injectStyles();
    }

    static injectStyles() {
        if (document.getElementById('ar-engine-styles')) return;

        const style = document.createElement('style');
        style.id = 'ar-engine-styles';
        style.innerHTML = `
            :root {
                --ar-primary: #0a0a0a;
                --ar-accent: #4f46e5;
                --ar-accent-glow: rgba(79, 70, 229, 0.45);
                --ar-text: #ffffff;
                --ar-text-muted: rgba(255, 255, 255, 0.55);
                --ar-bg: rgba(5, 5, 15, 0.88);
                --ar-glass: rgba(255, 255, 255, 0.07);
                --ar-glass-border: rgba(255, 255, 255, 0.12);
                --ar-radius: 14px;
                --ar-ease: cubic-bezier(0.4, 0, 0.2, 1);
                --ar-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .ar-modal-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: ar-fade-in 0.25s var(--ar-ease) both;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }

            .ar-modal-backdrop {
                position: absolute;
                inset: 0;
                background: var(--ar-bg);
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
            }

            .ar-modal-container {
                position: relative;
                z-index: 1;
                width: min(95vw, 960px);
                height: min(90vh, 720px);
                background: #050508;
                border-radius: var(--ar-radius);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                border: 1px solid var(--ar-glass-border);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65);
                animation: ar-scale-up 0.38s var(--ar-spring) both;
            }

            .ar-modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                z-index: 20;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: var(--ar-glass);
                backdrop-filter: blur(6px);
                border: 1px solid var(--ar-glass-border);
                color: var(--ar-text);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s var(--ar-ease);
            }

            .ar-modal-close:hover {
                background: rgba(239, 68, 68, 0.55);
                transform: rotate(90deg) scale(1.1);
            }

            .ar-modal-content {
                flex: 1;
                position: relative;
                background: #000;
            }

            .ar-modal-footer {
                padding: 12px 22px;
                background: rgba(0, 0, 0, 0.8);
                border-top: 1px solid var(--ar-glass-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: #fff;
            }

            .ar-product-name {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .ar-loading-overlay {
                position: absolute;
                inset: 0;
                z-index: 10;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #000;
                color: #fff;
                gap: 15px;
            }

            .ar-loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255,255,255,0.1);
                border-top-color: var(--ar-accent);
                border-radius: 50%;
                animation: ar-spin 0.8s linear infinite;
            }

            .ar-error-overlay {
                position: absolute;
                inset: 0;
                z-index: 11;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: rgba(20, 0, 0, 0.9);
                color: #ff4d4d;
                padding: 20px;
                text-align: center;
            }

            @keyframes ar-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes ar-scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes ar-spin { to { transform: rotate(360deg); } }

            @media (max-width: 640px) {
                .ar-modal-container { width: 100%; height: 100%; border-radius: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    createModal({ onClose, productName = 'AR Try-On' }) {
        // Overlay
        this.modal = document.createElement('div');
        this.modal.className = 'ar-modal-overlay';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');

        // Backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'ar-modal-backdrop';
        this.backdrop.onclick = onClose;
        this.modal.appendChild(this.backdrop);

        // Container
        this.container = document.createElement('div');
        this.container.className = 'ar-modal-container';
        if (this.theme.backgroundColor) {
            this.container.style.backgroundColor = this.theme.backgroundColor;
        }

        // Close Button
        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'ar-modal-close';
        this.closeBtn.onclick = onClose;
        this.closeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        this.container.appendChild(this.closeBtn);

        // Content Area
        const content = document.createElement('div');
        content.className = 'ar-modal-content';

        // Video Element
        this.video = document.createElement('video');
        this.video.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; transform:scaleX(-1); z-index:1;';
        this.video.setAttribute('playsinline', '');
        this.video.muted = true;
        this.video.autoplay = true;
        content.appendChild(this.video);

        // Canvas Container
        this.canvasContainer = document.createElement('div');
        this.canvasContainer.className = 'ar-canvas-container';
        this.canvasContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; pointer-events:none;';
        content.appendChild(this.canvasContainer);

        // Loading Overlay
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'ar-loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="ar-loading-spinner"></div>
            <span>Cargando experiencia AR...</span>
        `;
        content.appendChild(this.loadingOverlay);

        this.container.appendChild(content);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'ar-modal-footer';
        footer.innerHTML = `
            <span class="ar-product-name">${productName}</span>
            <div class="ar-modal-footer-actions">
                <span class="ar-modal-hint">Presiona ESC para cerrar</span>
            </div>
        `;
        this.container.appendChild(footer);

        this.modal.appendChild(this.container);
        document.body.appendChild(this.modal);
        
        // Body scroll lock
        document.body.style.overflow = 'hidden';

        return {
            video: this.video,
            container: this.canvasContainer
        };
    }

    showLoading(show) {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        if (this.loadingOverlay) this.loadingOverlay.style.display = 'none';
        
        if (!this.errorOverlay) {
            this.errorOverlay = document.createElement('div');
            this.errorOverlay.className = 'ar-error-overlay';
            this.container.querySelector('.ar-modal-content').appendChild(this.errorOverlay);
        }
        
        this.errorOverlay.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
        `;
        this.errorOverlay.style.display = 'flex';
    }

    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
        document.body.style.overflow = '';
    }
}
