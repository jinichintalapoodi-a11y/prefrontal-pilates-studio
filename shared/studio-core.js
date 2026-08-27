export class TimerRegistry {
  constructor() { this.ids = new Set(); }
  after(callback, delay) {
    const id = window.setTimeout(() => { this.ids.delete(id); callback(); }, delay);
    this.ids.add(id); return id;
  }
  clear() { this.ids.forEach(window.clearTimeout); this.ids.clear(); }
}

export class StudioAudio {
  constructor() { this.context = null; this.enabled = true; }
  async unlock() {
    if (!this.enabled) return;
    if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)();
    if (this.context.state === 'suspended') await this.context.resume();
  }
  tone(frequency, duration = 0.7, volume = 0.06) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain); gain.connect(this.context.destination);
    oscillator.start(now); oscillator.stop(now + duration);
  }
  setEnabled(enabled) { this.enabled = enabled; if (!enabled) this.close(); }
  close() {
    if (!this.context) return;
    const context = this.context; this.context = null;
    if (context.state !== 'closed') context.close();
  }
}

export function announce(message) {
  const region = document.querySelector('[data-live-region]');
  if (!region) return;
  region.textContent = '';
  window.requestAnimationFrame(() => { region.textContent = message; });
}
