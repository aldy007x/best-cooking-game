// Dapur Kilat — configuration: canvas size, layout, ingredients, recipes, timings.
// Everything the other modules need to agree on lives here, in one place.

export const VIEW = { width: 1280, height: 800 };

export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 3;
export const ORDER_MIN_SECONDS = 28;
export const ORDER_MAX_SECONDS = 42;
export const ORDER_SPAWN_GAP_SECONDS = 6;
export const CHOP_SECONDS = 2.2;
export const COOK_SECONDS = 3.0;
export const BURN_SECONDS = 6.0;
export const COMBO_WINDOW_SECONDS = 12;

// Ingredient catalogue. `prep` says what the raw item needs before it can
// go on a plate: 'none' (straight on), 'chop' (talenan) or 'cook' (kompor).
export const INGREDIENTS = {
  roti:   { id: 'roti',   name: 'Roti',   prep: 'none', color: '#e8b25a', dark: '#9a6b1e', key: '1' },
  daging: { id: 'daging', name: 'Daging', prep: 'cook', color: '#b4552d', dark: '#6e2f16', key: '2' },
  telur:  { id: 'telur',  name: 'Telur',  prep: 'cook', color: '#f7e08a', dark: '#a8871f', key: '3' },
  tomat:  { id: 'tomat',  name: 'Tomat',  prep: 'chop', color: '#d9382b', dark: '#7e1a10', key: '4' },
  selada: { id: 'selada', name: 'Selada', prep: 'chop', color: '#58b368', dark: '#276b33', key: '5' },
  keju:   { id: 'keju',   name: 'Keju',   prep: 'chop', color: '#f2c230', dark: '#96700a', key: '6' },
};

export const INGREDIENT_ORDER = ['roti', 'daging', 'telur', 'tomat', 'selada', 'keju'];

// A recipe is a dish name plus the READY items it needs, one of each.
// `need` lists ingredient ids; the plate must hold exactly those, prepared.
export const RECIPES = [
  { id: 'burger',   name: 'Burger Kilat',   need: ['roti', 'daging', 'tomat', 'selada'], coins: 18 },
  { id: 'omelet',   name: 'Omelet Ceria',   need: ['telur', 'keju', 'tomat'],            coins: 14 },
  { id: 'sandwich', name: 'Sandwich Sore',  need: ['roti', 'keju', 'tomat', 'selada'],   coins: 15 },
  { id: 'sarapan',  name: 'Sarapan Kilat',  need: ['roti', 'telur', 'keju'],             coins: 12 },
];

// Coins for a dish, plus a time bonus for serving early and a combo bonus.
export function dishCoins(recipe, orderSecondsLeft, combo) {
  const early = Math.max(0, Math.round(orderSecondsLeft / 5));
  return recipe.coins + early + Math.min(combo, 5) * 2;
}

// Fixed screen layout, shared by the renderer and the click handler.
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 60 },
  board: { x: 16, y: 72, w: 640, h: 128 },
  menu: { x: 672, y: 72, w: 592, h: 128 },
  bins: { x: 16, y: 216, w: 1248, h: 118 },
  stations: { y: 352, h: 168 },
  boardStation: { x: 16, y: 352, w: 300, h: 168 },
  stoveStation: { x: 332, y: 352, w: 300, h: 168 },
  plateStation: { x: 648, y: 352, w: 300, h: 168 },
  serveStation: { x: 964, y: 352, w: 300, h: 168 },
  hand: { x: 16, y: 536, w: 1248, h: 96 },
  help: { x: 16, y: 648, w: 1248, h: 136 },
};

export const BIN_WIDTH = 196;
export const BIN_GAP = 12;
export const SLOT_WIDTH = 132;

// Deterministic random numbers (mulberry32) so a screenshot seed replays.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickFrom(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
