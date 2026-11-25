// Dapur Kilat — sounds: tiny synthesised blips from the Web Audio API.
// No audio files are shipped; every sound is built at run time.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

// Created lazily on the first user gesture, so browsers allow it.
export function ensureAudio() {
  if (ctx || typeof window === 'undefined' || !window.AudioContext) return;
  try {
    ctx = new window.AudioContext();
  } catch {
    ctx = null;
  }
}

function tone(freq, seconds, type, gainValue, when = 0) {
  if (!ctx || muted) return;
  try {
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  } catch {
    // Sound is garnish: a failure here must never break the game.
  }
}

function noise(seconds, gainValue, when = 0) {
  if (!ctx || muted) return;
  try {
    const start = ctx.currentTime + when;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1800;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(start);
  } catch {
    // Sound is garnish: a failure here must never break the game.
  }
}

export const sfx = {
  pick() { tone(520, 0.07, 'triangle', 0.12); },
  chop() { noise(0.09, 0.18); tone(180, 0.06, 'square', 0.05); },
  cook() { noise(0.25, 0.05); },
  ready() { tone(660, 0.09, 'sine', 0.14); tone(880, 0.12, 'sine', 0.14, 0.09); },
  plate() { tone(440, 0.08, 'triangle', 0.12); tone(554, 0.1, 'triangle', 0.1, 0.07); },
  serve() { tone(523, 0.12, 'sine', 0.16); tone(659, 0.12, 'sine', 0.16, 0.1); tone(784, 0.2, 'sine', 0.16, 0.2); },
  wrong() { tone(160, 0.18, 'sawtooth', 0.08); },
  expired() { tone(220, 0.25, 'sawtooth', 0.1); tone(175, 0.3, 'sawtooth', 0.1, 0.18); },
  tick() { tone(980, 0.05, 'square', 0.05); },
  click() { tone(700, 0.05, 'triangle', 0.08); },
};
