import { TimerRegistry, StudioAudio, announce } from '../shared/studio-core.js';

const CONFIG = {
  trialsPerLevel: 6,
  requiredCorrect: 5,
  maxLevel: 3,
  feedbackDelay: 900,
};

const TOKENS = [
  { shape: 'rose', tone: 'ivory', symbol: '✦', label: 'ivory rose' },
  { shape: 'rose', tone: 'amethyst', symbol: '✦', label: 'amethyst rose' },
  { shape: 'lily', tone: 'ivory', symbol: '❖', label: 'ivory lily' },
  { shape: 'lily', tone: 'amethyst', symbol: '❖', label: 'amethyst lily' },
];

const RULES = {
  shape: { title: 'ALIGN BY BLOOM', left: 'Rose', right: 'Lily', value: token => token.shape },
  tone: { title: 'ALIGN BY TONE', left: 'Ivory', right: 'Amethyst', value: token => token.tone },
};

class AlignGame {
  constructor(root) {
    this.root = root;
    this.timers = new TimerRegistry();
    this.audio = new StudioAudio();
    this.level = 1; this.trial = 0; this.correct = 0; this.streak = 0;
    this.rule = 'shape'; this.token = null; this.acceptingInput = false; this.ended = false;
    this.els = {
      intro: root.querySelector('[data-screen="intro"]'),
      play: root.querySelector('[data-screen="play"]'),
      complete: root.querySelector('[data-screen="complete"]'),
      cue: root.querySelector('[data-rule-cue]'), token: root.querySelector('[data-token]'),
      left: root.querySelector('[data-choice="left"]'), right: root.querySelector('[data-choice="right"]'),
      progress: root.querySelector('[data-progress]'), status: root.querySelector('[data-status]'),
      audioToggle: root.querySelector('[data-audio-toggle]'),
    };
    this.bind();
  }

  bind() {
    this.root.querySelector('[data-start]').addEventListener('click', () => this.start());
    this.root.querySelector('[data-restart]').addEventListener('click', () => this.restart());
    this.els.left.addEventListener('click', () => this.choose('left'));
    this.els.right.addEventListener('click', () => this.choose('right'));
    this.els.audioToggle.addEventListener('click', () => this.toggleAudio());
    this.onKeyDown = event => {
      if (!this.acceptingInput) return;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') this.choose('left');
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') this.choose('right');
    };
    document.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('pagehide', () => this.destroy(), { once: true });
  }

  async start() {
    await this.audio.unlock();
    this.show('play'); this.nextTrial();
  }

  restart() {
    this.timers.clear(); this.level = 1; this.trial = 0; this.correct = 0; this.streak = 0; this.ended = false;
    this.show('play'); this.nextTrial();
  }

  nextTrial() {
    if (this.ended) return;
    if (this.trial >= CONFIG.trialsPerLevel) { this.finishLevel(); return; }
    this.trial += 1;
    this.rule = this.pickRule();
    this.token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const rule = RULES[this.rule];
    this.els.cue.textContent = rule.title;
    this.els.left.querySelector('strong').textContent = rule.left;
    this.els.right.querySelector('strong').textContent = rule.right;
    this.els.token.dataset.shape = this.token.shape;
    this.els.token.dataset.tone = this.token.tone;
    this.els.token.querySelector('[data-symbol]').textContent = this.token.symbol;
    this.els.token.setAttribute('aria-label', this.token.label);
    this.els.status.textContent = 'Choose the matching garden gate.';
    this.els.progress.textContent = `Level ${this.level} · ${this.trial} of ${CONFIG.trialsPerLevel} · Flow ${this.streak}`;
    this.clearFeedback(); this.acceptingInput = true;
    announce(`${rule.title}. ${this.token.label}. Choose ${rule.left} or ${rule.right}.`);
  }

  pickRule() {
    if (this.level === 1) return 'shape';
    if (this.level === 2) return 'tone';
    return Math.random() < 0.5 ? 'shape' : 'tone';
  }

  choose(side) {
    if (!this.acceptingInput || this.ended) return;
    this.acceptingInput = false;
    const rule = RULES[this.rule];
    const expected = rule.value(this.token);
    const selected = side === 'left' ? rule.left.toLowerCase() : rule.right.toLowerCase();
    const correct = selected === expected;
    const choice = side === 'left' ? this.els.left : this.els.right;
    choice.classList.add(correct ? 'is-correct' : 'is-wrong');
    this.els.token.classList.add(correct ? 'is-aligned' : 'is-misaligned');
    if (correct) {
      this.correct += 1; this.streak += 1; this.audio.tone(523.25);
      this.els.status.textContent = 'Aligned beautifully.'; announce('Correct. Aligned beautifully.');
    } else {
      this.streak = 0; this.audio.tone(196, 0.55, 0.04);
      this.els.status.textContent = `The ${this.token.label} belongs at the ${expected} gate.`;
      announce(this.els.status.textContent);
    }
    this.timers.after(() => this.nextTrial(), CONFIG.feedbackDelay);
  }

  finishLevel() {
    if (this.correct >= CONFIG.requiredCorrect) {
      if (this.level === CONFIG.maxLevel) { this.complete(); return; }
      this.level += 1; this.trial = 0; this.correct = 0;
      this.els.status.textContent = this.level === 2 ? 'The garden shifts. Now align by tone.' : 'Hold the cue gently—the rule may change.';
      announce(this.els.status.textContent);
      this.timers.after(() => this.nextTrial(), 1500);
    } else {
      this.trial = 0; this.correct = 0; this.streak = 0;
      this.els.status.textContent = 'Let the rule settle, then begin this passage again.';
      announce(this.els.status.textContent);
      this.timers.after(() => this.nextTrial(), 1600);
    }
  }

  complete() {
    this.ended = true; this.acceptingInput = false; this.timers.clear(); this.audio.tone(659.25, 1.2, 0.07);
    this.show('complete'); announce('Practice complete. Garden aligned.');
  }

  clearFeedback() {
    [this.els.left, this.els.right].forEach(el => el.classList.remove('is-correct', 'is-wrong'));
    this.els.token.classList.remove('is-aligned', 'is-misaligned');
  }

  toggleAudio() {
    const enabled = this.els.audioToggle.getAttribute('aria-pressed') !== 'true';
    this.els.audioToggle.setAttribute('aria-pressed', String(enabled));
    this.els.audioToggle.textContent = enabled ? 'Sound on' : 'Sound off';
    this.audio.setEnabled(enabled); if (enabled) this.audio.unlock();
  }

  show(name) {
    this.root.querySelectorAll('[data-screen]').forEach(screen => { screen.hidden = screen.dataset.screen !== name; });
  }

  destroy() {
    this.ended = true; this.acceptingInput = false; this.timers.clear(); this.audio.close();
    document.removeEventListener('keydown', this.onKeyDown);
  }
}

new AlignGame(document.querySelector('[data-align-game]'));
