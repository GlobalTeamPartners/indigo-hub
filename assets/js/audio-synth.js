/**
 * Indigo Metaphysics Academy — Web Audio API Synthesizer
 * Pure code sound engine: 432Hz / 528Hz Solfeggio harmonics & haptic UI audio
 */

class IndigoAudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
    this.oscillators = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft high-frequency crystal bell (432Hz or 528Hz)
  playChime(freq = 528) {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Subtle UI click tick
  playTick() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Toggle ambient 432Hz cosmic drone
  toggleAmbient(buttonEl) {
    this.init();

    if (this.isAmbientPlaying) {
      if (this.ambientGain) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          this.oscillators.forEach(o => { try { o.stop(); } catch(e){} });
          this.oscillators = [];
        }, 1000);
      }
      this.isAmbientPlaying = false;
      if (buttonEl) buttonEl.innerHTML = '🎵 Звук: Выкл';
    } else {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.06, now + 2.0);

      // 432Hz root + 528Hz transformation fifth
      const freqs = [432, 528, 216, 648];
      this.oscillators = freqs.map((f, i) => {
        const osc = this.ctx.createOscillator();
        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);

        if (panner) {
          panner.pan.value = (i - 1.5) * 0.4;
          osc.connect(panner);
          panner.connect(this.ambientGain);
        } else {
          osc.connect(this.ambientGain);
        }
        osc.start(now);
        return osc;
      });

      this.ambientGain.connect(this.ctx.destination);
      this.isAmbientPlaying = true;
      if (buttonEl) buttonEl.innerHTML = '🔊 432Hz Медитация: Вкл';
      this.playChime(528);
    }
  }
}

window.indigoAudio = new IndigoAudioEngine();
