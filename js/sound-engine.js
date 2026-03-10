/**
 * Sound Engine - Web Audio API (Typing Speed)
 */
class SoundEngine {
    constructor() {
        this.enabled = this.loadPref();
        this.ctx = null;
        this.master = null;
        this.init();
    }

    init() {
        if (this.ctx) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.connect(this.ctx.destination);
            this.master.gain.value = this.enabled ? 0.4 : 0;
        } catch (e) { /* no audio */ }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    toggle() {
        this.enabled = !this.enabled;
        this.savePref();
        if (this.master) this.master.gain.value = this.enabled ? 0.4 : 0;
        return this.enabled;
    }

    tone(freq, dur, type = 'sine', env = {}) {
        if (!this.ctx || !this.master) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        const g = this.ctx.createGain();
        g.connect(this.master);
        const a = env.a || 0.01, d = env.d || 0.05, s = env.s || 0.3;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(1, now + a);
        g.gain.linearRampToValueAtTime(s, now + a + d);
        g.gain.linearRampToValueAtTime(0, now + dur);
        osc.connect(g);
        osc.start(now);
        osc.stop(now + dur);
    }

    play(type) {
        if (!this.enabled || !this.ctx) return;
        try {
            switch (type) {
                case 'key': this.tone(800, 0.04, 'sine', { a: 0.005, d: 0.02, s: 0.2 }); break;
                case 'correct': this.tone(523, 0.1, 'sine', { a: 0.01, d: 0.06, s: 0.5 }); break;
                case 'wrong': this.tone(200, 0.15, 'sawtooth', { a: 0.01, d: 0.1, s: 0.3 }); break;
                case 'tick': this.tone(600, 0.03, 'square', { a: 0.005, d: 0.02, s: 0.15 }); break;
                case 'warning':
                    this.tone(440, 0.12, 'sine', { a: 0.01, s: 0.4 });
                    setTimeout(() => this.tone(440, 0.12, 'sine'), 150);
                    break;
                case 'complete':
                    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.2, 'sine', { a: 0.02, s: 0.5 }), i * 120));
                    break;
                case 'newbest':
                    [659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'sine', { a: 0.01, s: 0.6 }), i * 100));
                    break;
                case 'grade_s':
                    [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => this.tone(f, 0.15, 'sine', { a: 0.01, s: 0.6 }), i * 80));
                    break;
            }
        } catch (e) { /* ignore */ }
    }

    savePref() { try { localStorage.setItem('sfx_enabled', this.enabled); } catch (e) {} }
    loadPref() { try { return localStorage.getItem('sfx_enabled') !== 'false'; } catch (e) { return true; } }
}

window.sfx = new SoundEngine();
