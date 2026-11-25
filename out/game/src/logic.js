// Dapur Kilat — the rules: picking, chopping, cooking, plating and serving.

import {
  BURN_SECONDS, CHOP_SECONDS, COMBO_WINDOW_SECONDS, COOK_SECONDS,
  INGREDIENTS, SHIFT_SECONDS, dishCoins, makeRng,
} from './config.js';
import { matchingOrder, makeOrder, maybeSpawnOrder, recipeOf } from './state.js';

export function setMessage(state, text) {
  state.message = text;
  state.messageAt = state.time;
}

export function startShift(state) {
  state.screen = 'play';
  state.startedAt = state.time;
  setMessage(state, 'Pesanan masuk! Ambil bahan dari konter.');
}

// Take a raw ingredient from its counter bin into the cook's hand.
export function pickIngredient(state, ingredientId) {
  if (state.screen !== 'play' || state.over) return false;
  if (state.hand) { setMessage(state, 'Tangan penuh — letakkan dulu bahan yang dibawa.'); return false; }
  const def = INGREDIENTS[ingredientId];
  if (!def) return false;
  state.hand = { id: ingredientId, ready: def.prep === 'none' };
  setMessage(state, `${def.name} di tangan. ${def.prep === 'chop' ? 'Potong di talenan.' : def.prep === 'cook' ? 'Masak di kompor.' : 'Langsung ke piring.'}`);
  return true;
}

// Put the carried item onto a free slot of a station ('board' or 'stove').
export function placeOnStation(state, station, slotIndex) {
  if (state.screen !== 'play' || state.over) return false;
  if (!state.hand) { setMessage(state, 'Tangan kosong — ambil bahan dulu dari konter.'); return false; }
  const def = INGREDIENTS[state.hand.id];
  const want = station === 'board' ? 'chop' : 'cook';
  if (def.prep !== want) {
    state.shake = 0.35;
    setMessage(state, `${def.name} tidak perlu ${want === 'chop' ? 'dipotong' : 'dimasak'} — ${def.prep === 'none' ? 'langsung ke piring saja.' : def.prep === 'chop' ? 'potong di talenan.' : 'masak di kompor.'}`);
    return false;
  }
  const slots = station === 'board' ? state.board : state.stove;
  const slot = slots[slotIndex];
  if (slot.item) { setMessage(state, 'Slot ini sedang dipakai.'); return false; }
  slot.item = state.hand.id;
  slot.progress = 0;
  slot.done = false;
  slot.burnt = false;
  state.hand = null;
  setMessage(state, `${def.name} sedang ${want === 'chop' ? 'dipotong' : 'dimasak'}…`);
  return true;
}

// Pick a finished item back up from a station slot.
export function collectFromStation(state, station, slotIndex) {
  if (state.screen !== 'play' || state.over) return false;
  const slots = station === 'board' ? state.board : state.stove;
  const slot = slots[slotIndex];
  if (!slot.item) return false;
  if (slot.burnt) {
    slot.item = null; slot.progress = 0; slot.burnt = false;
    setMessage(state, 'Gosong dibuang. Masak lagi, jangan ditinggal!');
    return true;
  }
  if (!slot.done) { setMessage(state, 'Belum selesai — tunggu sampai hijau.'); return false; }
  if (state.hand) { setMessage(state, 'Tangan penuh — letakkan dulu bahan yang dibawa.'); return false; }
  state.hand = { id: slot.item, ready: true };
  slot.item = null; slot.progress = 0; slot.done = false;
  setMessage(state, `${INGREDIENTS[state.hand.id].name} siap — taruh di piring.`);
  return true;
}

// Add the carried ready item to the plate.
export function addToPlate(state) {
  if (state.screen !== 'play' || state.over) return false;
  if (!state.hand) { setMessage(state, 'Tangan kosong — bawa bahan siap saji ke piring.'); return false; }
  if (!state.hand.ready) {
    setMessage(state, `${INGREDIENTS[state.hand.id].name} masih mentah — olah dulu.`);
    return false;
  }
  if (state.plate.includes(state.hand.id)) {
    setMessage(state, `${INGREDIENTS[state.hand.id].name} sudah ada di piring.`);
    return false;
  }
  state.plate.push(state.hand.id);
  const done = state.hand.id;
  state.hand = null;
  const match = matchingOrder(state);
  setMessage(state, match
    ? `Piring cocok dengan pesanan ${match.name} — SAJIKAN!`
    : `${INGREDIENTS[done].name} di piring. Lengkapi sesuai pesanan.`);
  return true;
}

// Throw away what the cook carries, or clear the whole plate.
export function trashHand(state) {
  if (state.hand) { state.hand = null; setMessage(state, 'Bahan dibuang.'); return true; }
  if (state.plate.length > 0) { state.plate = []; setMessage(state, 'Piring dikosongkan.'); return true; }
  return false;
}

// Serve the plate at the window: it must match an open order exactly.
export function servePlate(state) {
  if (state.screen !== 'play' || state.over) return false;
  if (state.plate.length === 0) { setMessage(state, 'Piring kosong — rakit dulu pesanannya.'); return false; }
  const order = matchingOrder(state);
  if (!order) {
    state.shake = 0.35;
    state.combo = 0;
    setMessage(state, 'Piring tidak cocok dengan pesanan mana pun — cek papan!');
    return false;
  }
  const recipe = recipeOf(order);
  const earned = dishCoins(recipe, order.left, state.combo);
  state.coins += earned;
  state.score += earned * 10;
  state.served += 1;
  state.combo += 1;
  state.comboLeft = COMBO_WINDOW_SECONDS;
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = [];
  setMessage(state, `${order.name} tersaji! +${earned} koin${state.combo > 1 ? ` — kombo x${state.combo}!` : ''}`);
  return true;
}

function tickStation(state, slots, needSeconds, dt) {
  for (const slot of slots) {
    if (!slot.item || slot.done) continue;
    slot.progress += dt;
    if (slot.progress >= BURN_SECONDS) {
      slot.burnt = true;
      slot.done = false;
    } else if (slot.progress >= needSeconds) {
      slot.done = true;
    }
  }
}

// Advance the shift by dt seconds: timers, orders, stations, combo, end.
export function tick(state, dt) {
  if (state.screen !== 'play' || state.over) return;
  state.time += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.time);
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
  if (state.comboLeft > 0) {
    state.comboLeft -= dt;
    if (state.comboLeft <= 0) state.combo = 0;
  }
  tickStation(state, state.board, CHOP_SECONDS, dt);
  tickStation(state, state.stove, COOK_SECONDS, dt);
  for (const order of state.orders) order.left -= dt;
  const before = state.orders.length;
  state.orders = state.orders.filter((o) => o.left > 0);
  const lost = before - state.orders.length;
  if (lost > 0) {
    state.missed += lost;
    state.combo = 0;
    setMessage(state, lost === 1 ? 'Satu pesanan hangus — pelanggan pergi!' : `${lost} pesanan hangus — pelanggan pergi!`);
  }
  maybeSpawnOrder(state);
  if (state.timeLeft <= 0) {
    state.over = true;
    state.screen = 'over';
    setMessage(state, `Shift selesai! ${state.served} pesanan tersaji, ${state.coins} koin.`);
  }
}

// A fresh shift with a new seed (used by R / restart button).
export function restart(state) {
  const seed = state.seed + 7919;
  const rng = makeRng(seed);
  state.seed = seed;
  state.rng = rng;
  state.screen = 'play';
  state.time = 0;
  state.timeLeft = SHIFT_SECONDS;
  state.coins = 0;
  state.score = 0;
  state.served = 0;
  state.missed = 0;
  state.combo = 0;
  state.comboLeft = 0;
  state.hand = null;
  state.plate = [];
  state.board = [{ item: null, progress: 0, done: false, burnt: false }, { item: null, progress: 0, done: false, burnt: false }];
  state.stove = [{ item: null, progress: 0, done: false, burnt: false }, { item: null, progress: 0, done: false, burnt: false }];
  state.orders = [];
  state.nextSpawnAt = 1.5;
  state.over = false;
  state.shake = 0;
  state.orders.push(makeOrder(state.rng, 0));
  state.orders.push(makeOrder(state.rng, 0));
  setMessage(state, 'Shift baru! Pesanan masuk — cepat, layani mereka.');
  return state;
}
