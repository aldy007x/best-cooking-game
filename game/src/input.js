// Dapur Kilat — input: mouse clicks and keyboard, mapped onto the rules.

import { INGREDIENT_ORDER, LAYOUT } from './config.js';
import {
  addToPlate, collectFromStation, pickIngredient, placeOnStation,
  restart, servePlate, startShift, trashHand,
} from './logic.js';
import { sfx } from './audio.js';
import {
  binRect, muteButtonRect, plateRect, restartButtonRect, serveRect,
  startButtonRect, stationSlotRect, trashRect,
} from './render.js';

function inside(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w
    && point.y >= rect.y && point.y <= rect.y + rect.h;
}

// One click at canvas coordinates (already scaled to the 1280x800 view).
export function handleClick(state, point) {
  if (inside(point, muteButtonRect())) {
    state.muted = !state.muted;
    return true;
  }
  if (state.screen === 'title') {
    if (inside(point, startButtonRect())) {
      startShift(state);
      sfx.click();
      return true;
    }
    return false;
  }
  if (state.screen === 'over') {
    if (inside(point, restartButtonRect())) {
      restart(state);
      sfx.click();
      return true;
    }
    return false;
  }

  // Ingredient bins on the counter.
  for (let i = 0; i < INGREDIENT_ORDER.length; i += 1) {
    if (inside(point, binRect(i))) {
      const ok = pickIngredient(state, INGREDIENT_ORDER[i]);
      if (ok) sfx.pick();
      else sfx.wrong();
      return true;
    }
  }
  // Chopping board and stove slots.
  for (const station of ['board', 'stove']) {
    for (let i = 0; i < 2; i += 1) {
      if (inside(point, stationSlotRect(station, i))) {
        const slots = station === 'board' ? state.board : state.stove;
        const slot = slots[i];
        let ok;
        if (slot.item && (slot.done || slot.burnt)) ok = collectFromStation(state, station, i);
        else if (slot.item) ok = collectFromStation(state, station, i);
        else ok = placeOnStation(state, station, i);
        if (ok) {
          if (slot.item === null && state.hand) sfx.ready();
          else sfx.click();
        } else sfx.wrong();
        return true;
      }
    }
  }
  // Plate: add the carried ready item.
  if (inside(point, plateRect())) {
    const ok = addToPlate(state);
    if (ok) sfx.plate();
    else sfx.wrong();
    return true;
  }
  // Serve window.
  if (inside(point, serveRect())) {
    const ok = servePlate(state);
    if (ok) sfx.serve();
    else sfx.wrong();
    return true;
  }
  // Trash can in the hand tray.
  if (inside(point, trashRect())) {
    const ok = trashHand(state);
    if (ok) sfx.click();
    else sfx.wrong();
    return true;
  }
  void LAYOUT;
  return false;
}

// One key press. Returns true when the key did something.
export function handleKey(state, key) {
  const lower = key.toLowerCase();
  if (lower === 'm') {
    state.muted = !state.muted;
    return true;
  }
  if (state.screen === 'title' && (key === 'Enter' || key === ' ')) {
    startShift(state);
    sfx.click();
    return true;
  }
  if (state.screen === 'over' && lower === 'r') {
    restart(state);
    sfx.click();
    return true;
  }
  if (state.screen !== 'play') return false;
  const binIndex = INGREDIENT_ORDER.findIndex((id) => {
    const def = { roti: '1', daging: '2', telur: '3', tomat: '4', selada: '5', keju: '6' }[id];
    return def === key;
  });
  if (binIndex >= 0) {
    const ok = pickIngredient(state, INGREDIENT_ORDER[binIndex]);
    if (ok) sfx.pick();
    else sfx.wrong();
    return true;
  }
  if (key === ' ' || lower === 'enter') {
    const ok = servePlate(state);
    if (ok) sfx.serve();
    else sfx.wrong();
    return true;
  }
  if (lower === 't') {
    const ok = trashHand(state);
    if (ok) sfx.click();
    return true;
  }
  if (lower === 'r') {
    restart(state);
    sfx.click();
    return true;
  }
  return false;
}

// Convert a browser mouse event into view coordinates (the canvas is scaled
// to fit the window, so the raw offset is not the game coordinate).
export function eventPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1280,
    y: ((event.clientY - rect.top) / rect.height) * 800,
  };
}

export function layoutOf() {
  return LAYOUT;
}
