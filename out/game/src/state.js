// Dapur Kilat — game state: what a shift holds, and how new orders arrive.

import {
  INGREDIENTS, MAX_ORDERS, ORDER_MAX_SECONDS, ORDER_MIN_SECONDS,
  ORDER_SPAWN_GAP_SECONDS, RECIPES, SHIFT_SECONDS, makeRng, pickFrom,
} from './config.js';

let nextOrderId = 1;

// An order ticket: which dish, how long the customer waits, and its state.
export function makeOrder(rng, now) {
  const recipe = pickFrom(rng, RECIPES);
  const wait = ORDER_MIN_SECONDS + rng() * (ORDER_MAX_SECONDS - ORDER_MIN_SECONDS);
  return {
    id: nextOrderId,
    recipeId: recipe.id,
    name: recipe.name,
    need: [...recipe.need],
    coins: recipe.coins,
    total: wait,
    left: wait,
    bornAt: now,
    expired: false,
  };
}

// A station slot: either empty, or holding an item being prepared.
export function emptySlot() {
  return { item: null, progress: 0, done: false, burnt: false };
}

export function newState(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    rng,
    screen: 'title', // 'title' | 'play' | 'over'
    time: 0, // seconds since the shift started
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    score: 0,
    served: 0,
    missed: 0,
    combo: 0,
    comboLeft: 0,
    hand: null, // { id, ready } — the one item the cook carries, or null
    plate: [], // ready ingredient ids currently on the plate
    board: [emptySlot(), emptySlot()], // talenan (chopping) slots
    stove: [emptySlot(), emptySlot()], // kompor (cooking) slots
    orders: [],
    nextSpawnAt: 1.5,
    message: 'Klik MULAI, lalu layani pesanan di papan!',
    messageAt: 0,
    shake: 0, // counts down; while > 0 the view shakes a little
    muted: false,
    over: false,
    startedAt: 0,
  };
  spawnOrder(state);
  spawnOrder(state);
  return state;
}

export function recipeOf(order) {
  return RECIPES.find((r) => r.id === order.recipeId);
}

// Keep up to MAX_ORDERS tickets on the board, one new ticket every few seconds.
export function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return;
  const order = makeOrder(state.rng, state.time);
  nextOrderId += 1;
  state.orders.push(order);
}

export function maybeSpawnOrder(state) {
  if (state.time >= state.nextSpawnAt) {
    spawnOrder(state);
    state.nextSpawnAt = state.time + ORDER_SPAWN_GAP_SECONDS;
  }
}

// The plate matches an order when it holds exactly that dish's items.
export function plateMatchesOrder(plate, order) {
  if (plate.length !== order.need.length) return false;
  const have = [...plate].sort().join(',');
  const want = [...order.need].sort().join(',');
  return have === want;
}

export function matchingOrder(state) {
  for (const order of state.orders) {
    if (plateMatchesOrder(state.plate, order)) return order;
  }
  return null;
}

export function isPrepared(ingredientId) {
  return INGREDIENTS[ingredientId].prep === 'none';
}
