/* ═══════════════════════════════════════════════════════════════════════════
 *  ONE EURO FILTER
 *  Adaptive low-pass filter — industry standard for AR tracking noise.
 *  Slow movement → aggressive smoothing (no jitter).
 *  Fast movement → responsive follow (no lag).
 *  Reference: http://cristal.univ-lille.fr/~casiez/1euro/
 * ═══════════════════════════════════════════════════════════════════════════ */

export class OneEuroFilter {
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
