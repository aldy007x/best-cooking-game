// Dapur Kilat — boot: canvas, loop, input wiring, screenshot scenes.
// A plain ES module game: no build step, no network, keyboard and mouse.

import { VIEW } from './config.js';
import { newState } from './state.js';
import { tick } from './logic.js';
import { render } from './render.js';
import { ensureAudio, setMuted, sfx } from './audio.js';
import { eventPoint, handleClick, handleKey } from './input.js';
import { buildShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '1') || 1;
const shot = params.get('shot');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}

const state = newState(seed);
let frozen = false;
let last = performance.now();
let lastTickSecond = -1;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!frozen && state.screen === 'play') {
    tick(state, dt);
    const whole = Math.floor(state.timeLeft);
    if (whole !== lastTickSecond) {
      lastTickSecond = whole;
      if (whole <= 10 && whole > 0) sfx.tick();
    }
  }
  render(ctx, state);
  if (!frozen) requestAnimationFrame(frame);
}

function announce(message) {
  const status = document.getElementById('status');
  if (status) status.textContent = message;
}

canvas.addEventListener('pointerdown', (event) => {
  ensureAudio();
  setMuted(state.muted);
  const before = state.message;
  handleClick(state, eventPoint(canvas, event));
  if (state.message !== before) announce(state.message);
});

window.addEventListener('keydown', (event) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  ensureAudio();
  setMuted(state.muted);
  const before = state.message;
  handleKey(state, event.key);
  if (state.message !== before) announce(state.message);
});

window.addEventListener('resize', fitCanvas);
fitCanvas();
setMuted(state.muted);
announce(state.message);

if (shot) {
  // Screenshot mode: play the real game forward, then freeze one frame.
  buildShot(state, shot);
  frozen = true;
  render(ctx, state);
} else {
  requestAnimationFrame(frame);
}
