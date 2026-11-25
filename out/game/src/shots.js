// Dapur Kilat — screenshot scenes (?shot=...&seed=...).
// Each scene plays the real rules forward from a fresh shift with a simple
// autopilot (take what the oldest order needs, prep it, plate it, serve it),
// then freezes the frame: the picture is what a short game really looks like,
// and the same seed always gives the same frame.

import { INGREDIENTS } from './config.js';
import { addToPlate, collectFromStation, pickIngredient, placeOnStation, servePlate, startShift, tick, trashHand } from './logic.js';
import { matchingOrder } from './state.js';

const STEP = 1 / 30;

// One autopilot move: work on the oldest open order. With allowServe false
// the plate is built but never served, so a frame can show it ready.
function autopilotStep(state, allowServe = true) {
  const order = state.orders[0];
  if (!order) return;
  // 0. Drop what no open order can use: a ready item in hand that no order
  // needs, or a plate no open order can still complete.
  if (state.hand && state.hand.ready && !state.orders.some((o) => o.need.includes(state.hand.id))) {
    trashHand(state);
    return;
  }
  if (!state.hand && state.plate.length > 0
    && !state.orders.some((o) => state.plate.every((id) => o.need.includes(id)))) {
    trashHand(state);
    return;
  }
  // 1. If the plate already matches, serve it (unless held for the shot).
  if (allowServe && matchingOrder(state)) { servePlate(state); return; }
  // 2. If the hand holds a ready item the order needs, plate it.
  if (state.hand && state.hand.ready && order.need.includes(state.hand.id) && !state.plate.includes(state.hand.id)) {
    addToPlate(state);
    return;
  }
  // 3. Collect a finished item from a station (frees a slot for step 4).
  for (const [station, slots] of [['board', state.board], ['stove', state.stove]]) {
    for (let i = 0; i < slots.length; i += 1) {
      if (slots[i].item && slots[i].done && !state.hand) { collectFromStation(state, station, i); return; }
    }
  }
  // 4. If the hand holds a raw item, send it to its station.
  if (state.hand && !state.hand.ready) {
    const prep = INGREDIENTS[state.hand.id].prep;
    const slots = prep === 'chop' ? state.board : state.stove;
    const station = prep === 'chop' ? 'board' : 'stove';
    for (let i = 0; i < slots.length; i += 1) {
      if (!slots[i].item) { placeOnStation(state, station, i); return; }
    }
    return;
  }
  // 5. Pick the next missing ingredient for the oldest order — but only
  // when its station has a free slot, so the hand never deadlocks.
  for (const id of order.need) {
    if (state.plate.includes(id)) continue;
    const busy = [...state.board, ...state.stove].some((s) => s.item === id)
      || (state.hand && state.hand.id === id);
    if (busy) continue;
    const prep = INGREDIENTS[id].prep;
    if (prep !== 'none') {
      const slots = prep === 'chop' ? state.board : state.stove;
      if (slots.every((s) => s.item)) continue;
    }
    pickIngredient(state, id);
    return;
  }
}

function runFor(state, seconds, allowServe = true) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    autopilotStep(state, allowServe);
    tick(state, STEP);
    if (state.screen === 'over') break;
  }
}

// Build the scene named by `shot`, returning the state to render frozen.
export function buildShot(state, shot) {
  startShift(state);
  if (shot === 'kitchen') {
    // A fresh shift: board full, ingredients on the counter, timer full.
    runFor(state, 2);
  } else if (shot === 'assembly') {
    // Mid-assembly: a plate half built, one item still chopping.
    runFor(state, 6);
    if (state.plate.length === 0) runFor(state, 6);
  } else if (shot === 'serve') {
    // A plate that matches an order, glowing and ready to serve: play
    // normally first, then finish a plate with serving held back.
    runFor(state, 18);
    runFor(state, 12, false);
    if (!matchingOrder(state)) runFor(state, 10, false);
  } else if (shot === 'rush') {
    // Late in the shift: timer low, orders on the board, plate mid-build.
    // Serving is held for the last stretch so the board stays busy.
    runFor(state, 118);
    runFor(state, 14, false);
    if (state.orders.length === 0) runFor(state, 6, false);
  } else {
    runFor(state, 6);
  }
  return state;
}

export const SHOT_NAMES = ['kitchen', 'assembly', 'serve', 'rush'];
