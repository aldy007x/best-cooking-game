// Dapur Kilat — drawing: every pixel of the kitchen, on one canvas.
// Hit areas live here too, so clicks and drawing can never drift apart.

import { BIN_GAP, BIN_WIDTH, INGREDIENTS, INGREDIENT_ORDER, LAYOUT, RECIPES, VIEW } from './config.js';
import { matchingOrder } from './state.js';

export function binRect(index) {
  return {
    x: LAYOUT.bins.x + index * (BIN_WIDTH + BIN_GAP),
    y: LAYOUT.bins.y, w: BIN_WIDTH, h: LAYOUT.bins.h,
  };
}

export function stationSlotRect(station, index) {
  const base = station === 'board' ? LAYOUT.boardStation : LAYOUT.stoveStation;
  return { x: base.x + 14 + index * (132 + 8), y: base.y + 58, w: 132, h: 92 };
}

export function plateRect() {
  const p = LAYOUT.plateStation;
  return { x: p.x + 14, y: p.y + 44, w: p.w - 28, h: 106 };
}

export function serveRect() {
  const s = LAYOUT.serveStation;
  return { x: s.x + 14, y: s.y + 44, w: s.w - 28, h: 106 };
}

export function trashRect() {
  return { x: LAYOUT.hand.x + LAYOUT.hand.w - 150, y: LAYOUT.hand.y + 22, w: 134, h: 52 };
}

export function startButtonRect() {
  return { x: VIEW.width / 2 - 130, y: 560, w: 260, h: 64 };
}

export function restartButtonRect() {
  return { x: VIEW.width / 2 - 130, y: 580, w: 260, h: 64 };
}

export function muteButtonRect() {
  return { x: VIEW.width - 120, y: 12, w: 104, h: 36 };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function fitText(ctx, str, x, y, size, color, maxWidth, weight = '700') {
  let s = size;
  ctx.font = `${weight} ${s}px system-ui, sans-serif`;
  while (s > 10 && ctx.measureText(str).width > maxWidth) {
    s -= 1;
    ctx.font = `${weight} ${s}px system-ui, sans-serif`;
  }
  text(ctx, str, x, y, s, color, weight);
}

// One ingredient, drawn as a simple flat icon at (cx, cy) with radius r.
export function drawIngredient(ctx, id, cx, cy, r) {
  const def = INGREDIENTS[id];
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'roti') {
    ctx.fillStyle = '#e8b25a';
    ctx.beginPath(); ctx.arc(0, 2, r, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c98f3d';
    ctx.fillRect(-r, 0, r * 2, r * 0.28);
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath(); ctx.arc(-r * 0.4, -r * 0.35, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.5, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'daging') {
    ctx.fillStyle = '#8a4a26';
    roundRect(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5); ctx.fill();
    ctx.strokeStyle = '#5e2f16'; ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); ctx.moveTo(-r * 0.7, i * r * 0.35); ctx.lineTo(r * 0.7, i * r * 0.35); ctx.stroke();
    }
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.12, r * 0.22, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'tomat') {
    ctx.fillStyle = '#d9382b';
    ctx.beginPath(); ctx.arc(0, r * 0.08, r * 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath(); ctx.moveTo(0, -r * 0.7); ctx.lineTo(-r * 0.35, -r * 0.2); ctx.lineTo(0, -r * 0.4); ctx.lineTo(r * 0.35, -r * 0.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f08a7e';
    ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.25, r * 0.18, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'selada') {
    ctx.fillStyle = '#58b368';
    for (const [dx, dy] of [[-0.45, 0.15], [0.45, 0.15], [0, -0.3]]) {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#276b33'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.6); ctx.quadraticCurveTo(r * 0.2, 0, 0, r * 0.6); ctx.stroke();
  } else if (id === 'keju') {
    ctx.fillStyle = '#f2c230';
    ctx.beginPath(); ctx.moveTo(-r, r * 0.6); ctx.lineTo(r, r * 0.6); ctx.lineTo(r, -r * 0.1); ctx.lineTo(0, -r * 0.7); ctx.lineTo(-r, -r * 0.1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8930a';
    for (const [dx, dy] of [[-0.4, 0.2], [0.35, 0.3], [0, -0.25]]) {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.14, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  void def;
}


// ---- top bar, order board and menu ----

function drawTopBar(ctx, state) {
  const b = LAYOUT.topBar;
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(b.x, b.y, b.w, b.h);
  text(ctx, '🍳 DAPUR KILAT', 20, 40, 26, '#ffd94d', '800');
  // Shift timer.
  const total = 150;
  const left = Math.ceil(state.timeLeft);
  const frac = Math.max(0, state.timeLeft / total);
  const tx = 330, tw = 420;
  ctx.fillStyle = '#5b4632';
  roundRect(ctx, tx, 18, tw, 24, 12); ctx.fill();
  ctx.fillStyle = frac < 0.2 ? '#e23b2e' : frac < 0.45 ? '#f2a007' : '#58b368';
  if (frac > 0) { roundRect(ctx, tx, 18, Math.max(24, tw * frac), 24, 12); ctx.fill(); }
  text(ctx, `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, tx + tw / 2, 36, 17, '#fff', '800', 'center');
  text(ctx, `🪙 ${state.coins} koin`, 790, 38, 20, '#ffd94d', '800');
  text(ctx, `Skor ${state.score}`, 920, 38, 20, '#fff', '700');
  text(ctx, `✅ ${state.served}`, 1040, 38, 20, '#8fe388', '700');
  if (state.combo > 1) text(ctx, `🔥 x${state.combo}`, 1110, 38, 20, '#ff9d5c', '800');
  const m = muteButtonRect();
  ctx.fillStyle = '#5b4632';
  roundRect(ctx, m.x, m.y, m.w, m.h, 8); ctx.fill();
  text(ctx, state.muted ? '🔇 Suara' : '🔊 Suara', m.x + m.w / 2, m.y + 24, 14, '#fff', '700', 'center');
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const urgency = order.left / order.total;
  ctx.fillStyle = '#fffdf6';
  roundRect(ctx, x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = urgency < 0.3 ? '#e23b2e' : '#d9c39a';
  ctx.lineWidth = urgency < 0.3 ? 3 : 1.5;
  roundRect(ctx, x, y, w, h, 12); ctx.stroke();
  ctx.fillStyle = urgency < 0.3 ? '#e23b2e' : '#8a5a2b';
  roundRect(ctx, x, y, w, 30, 12); ctx.fill();
  ctx.fillRect(x, y + 18, w, 12);
  fitText(ctx, order.name.toUpperCase(), x + 10, y + 21, 15, '#fff', w - 20, '800');
  // Needed items as chips, sized to fit the ticket in one row.
  const n = order.need.length;
  const chipW = (w - 20 - (n - 1) * 4) / n;
  const chipFont = n > 3 ? 10 : 12;
  let cx = x + 10;
  for (const id of order.need) {
    const def = INGREDIENTS[id];
    ctx.fillStyle = '#f3e2c2';
    roundRect(ctx, cx, y + 38, chipW, 22, 11); ctx.fill();
    let s = chipFont;
    ctx.font = `700 ${s}px system-ui, sans-serif`;
    while (s > 9 && ctx.measureText(def.name).width > chipW - 8) {
      s -= 1;
      ctx.font = `700 ${s}px system-ui, sans-serif`;
    }
    ctx.fillStyle = '#5b3a17';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(def.name, cx + chipW / 2, y + 53);
    cx += chipW + 4;
  }
  // Countdown bar.
  ctx.fillStyle = '#eadfc8';
  roundRect(ctx, x + 10, y + 68, w - 20, 12, 6); ctx.fill();
  ctx.fillStyle = urgency < 0.3 ? '#e23b2e' : '#58b368';
  roundRect(ctx, x + 10, y + 68, Math.max(12, (w - 20) * urgency), 12, 6); ctx.fill();
  text(ctx, `${Math.ceil(order.left)} dtk`, x + 10, y + 92, 14, urgency < 0.3 ? '#e23b2e' : '#6b4a26', '800');
  text(ctx, `+${order.coins} koin`, x + w - 10, y + 92, 14, '#8a5a2b', '700', 'right');
}

function drawBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#8a5a2b';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12); ctx.fill();
  text(ctx, 'PAPAN PESANAN', b.x + 12, b.y + 18, 13, '#ffd94d', '800');
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada pesanan…', b.x + 16, b.y + 70, 16, '#fff', '600');
    return;
  }
  const tw = 200, gap = 8;
  state.orders.forEach((order, i) => {
    drawOrderTicket(ctx, order, b.x + 12 + i * (tw + gap), b.y + 26, tw, 94);
  });
}

function drawMenu(ctx) {
  const m = LAYOUT.menu;
  ctx.fillStyle = '#fff3d6';
  roundRect(ctx, m.x, m.y, m.w, m.h, 12); ctx.fill();
  ctx.strokeStyle = '#d9c39a'; ctx.lineWidth = 1.5;
  roundRect(ctx, m.x, m.y, m.w, m.h, 12); ctx.stroke();
  text(ctx, 'MENU — RESEP HARI INI', m.x + 14, m.y + 22, 13, '#8a5a2b', '800');
  RECIPES.forEach((recipe, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = m.x + 14 + col * 292, y = m.y + 34 + row * 44;
    text(ctx, recipe.name, x, y + 16, 15, '#3d2b1f', '800');
    text(ctx, recipe.need.map((id) => INGREDIENTS[id].name).join(' + '), x, y + 36, 12, '#6b4a26', '600');
    text(ctx, `${recipe.coins} koin`, m.x + m.w - 16, y + 16, 13, '#8a5a2b', '800', 'right');
  });
}

// ---- counter bins and stations ----

function drawBins(ctx, state) {
  const b = LAYOUT.bins;
  text(ctx, 'KONTER BAHAN — klik bahan, lalu olah di stasiun', b.x, b.y - 8, 14, '#5b3a17', '800');
  INGREDIENT_ORDER.forEach((id, i) => {
    const r = binRect(i);
    const def = INGREDIENTS[id];
    ctx.fillStyle = '#fffdf6';
    roundRect(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = state.hand && state.hand.id === id ? '#e23b2e' : '#d9c39a';
    ctx.lineWidth = state.hand && state.hand.id === id ? 3 : 1.5;
    roundRect(ctx, r.x, r.y, r.w, r.h, 12); ctx.stroke();
    drawIngredient(ctx, id, r.x + r.w / 2, r.y + 46, 30);
    text(ctx, def.name, r.x + r.w / 2, r.y + 96, 16, '#3d2b1f', '800', 'center');
    text(ctx, `tombol ${def.key} · ${def.prep === 'none' ? 'langsung' : def.prep === 'chop' ? 'potong' : 'masak'}`, r.x + r.w / 2, r.y + 112, 11, '#8a7a5f', '600', 'center');
  });
}

function drawStationSlot(ctx, station, index, slot, label) {
  const r = stationSlotRect(station, index);
  ctx.fillStyle = slot.burnt ? '#3a2a22' : slot.done ? '#dff5d8' : slot.item ? '#fff3d6' : '#efe3c8';
  roundRect(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
  ctx.strokeStyle = slot.done ? '#58b368' : '#c9a86a';
  ctx.lineWidth = slot.done ? 3 : 1.5;
  roundRect(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
  if (slot.item) {
    drawIngredient(ctx, slot.item, r.x + r.w / 2, r.y + 34, 24);
    if (slot.burnt) {
      text(ctx, 'GOSONG!', r.x + r.w / 2, r.y + 76, 14, '#ff8a7a', '800', 'center');
      text(ctx, 'klik untuk buang', r.x + r.w / 2, r.y + 90, 10, '#d8b9a8', '600', 'center');
    } else if (slot.done) {
      text(ctx, 'SELESAI ✓', r.x + r.w / 2, r.y + 76, 14, '#2e7d32', '800', 'center');
      text(ctx, 'klik untuk ambil', r.x + r.w / 2, r.y + 90, 10, '#5b7a4a', '600', 'center');
    } else {
      const need = station === 'board' ? 2.2 : 3.0;
      const frac = Math.min(1, slot.progress / need);
      ctx.fillStyle = '#eadfc8';
      roundRect(ctx, r.x + 12, r.y + 68, r.w - 24, 10, 5); ctx.fill();
      ctx.fillStyle = '#f2a007';
      roundRect(ctx, r.x + 12, r.y + 68, Math.max(10, (r.w - 24) * frac), 10, 5); ctx.fill();
      text(ctx, label, r.x + r.w / 2, r.y + 90, 11, '#6b4a26', '700', 'center');
    }
  } else {
    text(ctx, 'kosong', r.x + r.w / 2, r.y + 52, 14, '#a8906a', '600', 'center');
  }
}

function drawStations(ctx, state) {
  const bs = LAYOUT.boardStation, ss = LAYOUT.stoveStation, ps = LAYOUT.plateStation, vs = LAYOUT.serveStation;
  ctx.fillStyle = '#c98f5f';
  roundRect(ctx, bs.x, bs.y, bs.w, bs.h, 12); ctx.fill();
  ctx.fillStyle = '#5b4632';
  roundRect(ctx, ss.x, ss.y, ss.w, ss.h, 12); ctx.fill();
  ctx.fillStyle = '#fffdf6';
  roundRect(ctx, ps.x, ps.y, ps.w, ps.h, 12); ctx.fill();
  ctx.strokeStyle = '#d9c39a'; ctx.lineWidth = 1.5;
  roundRect(ctx, ps.x, ps.y, ps.w, ps.h, 12); ctx.stroke();
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, vs.x, vs.y, vs.w, vs.h, 12); ctx.fill();

  text(ctx, '🔪 TALENAN — potong', bs.x + 14, bs.y + 26, 15, '#fff', '800');
  text(ctx, '🔥 KOMPOR — masak', ss.x + 14, ss.y + 26, 15, '#fff', '800');
  text(ctx, '🍽️ PIRING', ps.x + 14, ps.y + 26, 15, '#3d2b1f', '800');
  text(ctx, '🛎️ JENDELA SAJI', vs.x + 14, vs.y + 26, 15, '#fff', '800');

  drawStationSlot(ctx, 'board', 0, state.board[0], 'memotong…');
  drawStationSlot(ctx, 'board', 1, state.board[1], 'memotong…');
  drawStationSlot(ctx, 'stove', 0, state.stove[0], 'memasak…');
  drawStationSlot(ctx, 'stove', 1, state.stove[1], 'memasak…');

  // The plate: items laid out in a row, glowing when it matches an order.
  const pr = plateRect();
  const match = matchingOrder(state);
  ctx.fillStyle = match ? '#c8f5c0' : '#f3e2c2';
  ctx.beginPath(); ctx.ellipse(pr.x + pr.w / 2, pr.y + pr.h / 2 + 8, pr.w / 2 - 6, pr.h / 2 - 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = match ? '#2e7d32' : '#c9a86a';
  ctx.lineWidth = match ? 4 : 2;
  ctx.beginPath(); ctx.ellipse(pr.x + pr.w / 2, pr.y + pr.h / 2 + 8, pr.w / 2 - 6, pr.h / 2 - 4, 0, 0, Math.PI * 2); ctx.stroke();
  if (state.plate.length === 0) {
    text(ctx, 'piring kosong', pr.x + pr.w / 2, pr.y + pr.h / 2 + 12, 14, '#a8906a', '600', 'center');
  } else {
    const step = Math.min(64, (pr.w - 40) / state.plate.length);
    state.plate.forEach((id, i) => {
      drawIngredient(ctx, id, pr.x + 34 + i * step, pr.y + pr.h / 2 + 6, 24);
    });
  }
  if (match) {
    text(ctx, 'SIAP SAJI! →', pr.x + pr.w / 2, pr.y - 6, 16, '#2e7d32', '800', 'center');
  }

  // Serve window: a bell and a counter.
  const sr = serveRect();
  ctx.fillStyle = '#fffdf6';
  roundRect(ctx, sr.x, sr.y, sr.w, sr.h, 10); ctx.fill();
  ctx.strokeStyle = match ? '#2e7d32' : '#c9a86a';
  ctx.lineWidth = match ? 4 : 2;
  roundRect(ctx, sr.x, sr.y, sr.w, sr.h, 10); ctx.stroke();
  text(ctx, '🔔', sr.x + sr.w / 2, sr.y + 52, 40, '#3d2b1f', '800', 'center');
  text(ctx, match ? 'SAJIKAN!' : 'sajikan di sini', sr.x + sr.w / 2, sr.y + 86, 15, match ? '#2e7d32' : '#6b4a26', '800', 'center');
}

// ---- hand tray, help bar, screens ----

function drawHand(ctx, state) {
  const h = LAYOUT.hand;
  ctx.fillStyle = '#3d2b1f';
  roundRect(ctx, h.x, h.y, h.w, h.h, 12); ctx.fill();
  text(ctx, 'TANGAN KOKI:', h.x + 16, h.y + 34, 15, '#ffd94d', '800');
  if (state.hand) {
    const def = INGREDIENTS[state.hand.id];
    drawIngredient(ctx, state.hand.id, h.x + 190, h.y + 48, 26);
    text(ctx, `${def.name}${state.hand.ready ? ' (siap)' : ' (mentah)'}`, h.x + 230, h.y + 42, 17, '#fff', '700');
    text(ctx, state.hand.ready ? 'bawa ke piring' : def.prep === 'chop' ? 'bawa ke talenan' : 'bawa ke kompor', h.x + 230, h.y + 68, 13, '#d8c9a8', '600');
  } else {
    text(ctx, 'kosong — klik bahan di konter', h.x + 190, h.y + 54, 16, '#d8c9a8', '600');
  }
  const t = trashRect();
  ctx.fillStyle = '#7a2e22';
  roundRect(ctx, t.x, t.y, t.w, t.h, 10); ctx.fill();
  text(ctx, '🗑 Buang', t.x + t.w / 2, t.y + 33, 15, '#fff', '800', 'center');
  text(ctx, state.message, h.x + 16, h.y + 82, 14, '#ffe9b0', '600');
}

function drawHelp(ctx) {
  const h = LAYOUT.help;
  ctx.fillStyle = '#fff3d6';
  roundRect(ctx, h.x, h.y, h.w, h.h, 12); ctx.fill();
  ctx.strokeStyle = '#d9c39a'; ctx.lineWidth = 1.5;
  roundRect(ctx, h.x, h.y, h.w, h.h, 12); ctx.stroke();
  text(ctx, 'CARA MAIN', h.x + 16, h.y + 26, 14, '#8a5a2b', '800');
  const lines = [
    '1. Klik bahan di konter (atau tombol 1–6).',
    '2. Olah di talenan 🔪 atau kompor 🔥 — jangan sampai gosong!',
    '3. Taruh bahan siap di piring 🍽️ sesuai pesanan di papan.',
    '4. Klik jendela saji 🛎️ (atau Spasi) saat piring cocok — makin cepat, makin banyak koin.',
  ];
  lines.forEach((line, i) => text(ctx, line, h.x + 16, h.y + 48 + i * 18, 14, '#3d2b1f', '600'));
  text(ctx, 'T = buang   •   R = shift baru   •   M = suara', h.x + 16, h.y + 124, 13, '#8a7a5f', '700');
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(40, 26, 14, 0.88)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, '🍳 DAPUR KILAT', VIEW.width / 2, 170, 64, '#ffd94d', '800', 'center');
  text(ctx, 'Game masak kilat: layani pesanan sebelum pelanggan pergi!', VIEW.width / 2, 220, 22, '#fff', '600', 'center');
  const lines = [
    'Ambil bahan dari konter, potong di talenan, masak di kompor,',
    'rakit di piring sesuai pesanan, lalu sajikan di jendela saji.',
    'Shift 2½ menit — pesanan cepat = koin lebih banyak. Kombo menanti!',
  ];
  lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, 300 + i * 32, 19, '#ffe9b0', '600', 'center'));
  const b = startButtonRect();
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  text(ctx, '▶  MULAI SHIFT', b.x + b.w / 2, b.y + 42, 24, '#fff', '800', 'center');
  text(ctx, 'Klik atau tekan Enter', VIEW.width / 2, 660, 15, '#d8c9a8', '600', 'center');
  void state;
}

function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(40, 26, 14, 0.88)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, '⏰ SHIFT SELESAI!', VIEW.width / 2, 180, 54, '#ffd94d', '800', 'center');
  text(ctx, `${state.served} pesanan tersaji  •  ${state.missed} hangus  •  ${state.coins} koin  •  skor ${state.score}`, VIEW.width / 2, 250, 24, '#fff', '700', 'center');
  const verdict = state.served >= 8 ? 'Koki bintang! Dapur ini milikmu. ⭐'
    : state.served >= 4 ? 'Lumayan! Sedikit lagi jadi koki bintang.'
    : 'Latihan lagi — pelanggan lapar menunggu!';
  text(ctx, verdict, VIEW.width / 2, 310, 22, '#ffe9b0', '600', 'center');
  const b = restartButtonRect();
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  text(ctx, '↻  MAIN LAGI  (R)', b.x + b.w / 2, b.y + 42, 24, '#fff', '800', 'center');
}

// ---- main entry ----

export function render(ctx, state) {
  ctx.save();
  if (state.shake > 0) {
    const s = state.shake * 18;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }
  // Kitchen wall and floor.
  ctx.fillStyle = '#f7ead2';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#e8d5ae';
  ctx.fillRect(0, 200, VIEW.width, 8);
  ctx.fillStyle = '#d9b98a';
  for (let x = 0; x < VIEW.width; x += 96) ctx.fillRect(x, 640, 94, 160);
  ctx.fillStyle = '#c9a86a';
  for (let x = 0; x < VIEW.width; x += 96) ctx.fillRect(x + 94, 640, 2, 160);

  drawTopBar(ctx, state);
  drawBoard(ctx, state);
  drawMenu(ctx);
  drawBins(ctx, state);
  drawStations(ctx, state);
  drawHand(ctx, state);
  drawHelp(ctx);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'over') drawOver(ctx, state);
  ctx.restore();
}
