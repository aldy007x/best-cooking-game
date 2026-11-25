# Dapur Kilat — game masak kilat

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/aldy007x/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/aldy007x/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Dapur Kilat** (Lightning Kitchen) is an original fast-paced cooking game:
run a small Indonesian street-food kitchen through a 2½-minute shift.
Orders land on the board with a countdown — grab ingredients from the
counter, chop them on the talenan, cook them on the kompor, assemble the
dish on the plate exactly as ordered, and serve it at the window before the
customer walks away. Serve fast for bonus coins, chain serves into a combo,
and don't let anything burn.

## How to play

- **Mouse / keyboard:** click an ingredient on the counter (or keys 1–6),
  click a station slot to chop or cook it, click the plate to add a ready
  item, click the serve window (or Space) when the plate matches an order.
- **T** throws away what you carry (or clears the plate), **R** starts a new
  shift, **M** toggles sound. Sounds are synthesised live with Web Audio —
  no audio files are shipped.
- Four original recipes: Burger Kilat, Omelet Ceria, Sandwich Sore and
  Sarapan Kilat. Orders expire, dishes can burn, and the rush grows as the
  shift goes on.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network — `game/` is plain static files.

## Layout

- `game/` — the game itself: `index.html` plus `src/` modules, one job each
  (`config`, `state`, `logic`, `render`, `audio`, `input`, `shots`, `main`).
- `screenshots/` — 4 real renders of the game, taken in a desktop browser.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with `vendor/makefun-game.ts`.
- `serve.ts` — a tiny static server for local play-testing.

---

Entered on [make.fun](https://make.fun/?ref=aldy007x&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards
