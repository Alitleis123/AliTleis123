// Updates the career NOW marker independently of the 21-second reel playhead.
// No dependencies, no network. Node 20+.

import { readFile, writeFile } from "node:fs/promises";

// The first work clip is the current co-op, June 2026 through January 2027.
// Calendar progress uses this clip's ruler. Reel playback has its own clock.
const COOP_START_MONTH = 41;
const COOP_END_MONTH = 48;
const CLIP_START_X = 222;
const CLIP_END_X = 308;

const START = "  <!-- PH:START -->";
const END = "  <!-- PH:END -->";

function playheadX(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthStart = Date.UTC(year, month, 1);
  const monthEnd = Date.UTC(year, month + 1, 1);
  const daysInMonth = (monthEnd - monthStart) / 86400000;
  const months = (year - 2023) * 12 + month + (now.getUTCDate() - 1) / daysInMonth;
  const fraction = Math.min(1, Math.max(0,
    (months - COOP_START_MONTH) / (COOP_END_MONTH - COOP_START_MONTH)));
  return CLIP_START_X + fraction * (CLIP_END_X - CLIP_START_X);
}

function playheadSvg(x) {
  const r = (n) => Number(n.toFixed(1));
  return [
    START,
    '  <g id="career-now" aria-label="Calendar progress within the Lincoln Laboratory co-op">',
    `    <path d="M${r(x)} 423v10" stroke="#ededea" stroke-width="1.5"/>`,
    `    <path d="M${r(x - 3)} 431h6l-3 5z" fill="#ededea"/>`,
    `    <g class="anim now-pulse" fill="#ededea" transform="translate(${r(x - 23.4)} 419) scale(.026 -.026)" aria-label="NOW" data-readable="true" data-font-size="26">`,
    '      <use href="#letter-m-78"/><use href="#letter-m-79" x="600"/><use href="#letter-m-87" x="1200"/>',
    '    </g>',
    "  </g>",
    END,
  ].join("\n");
}

const path = new URL("../assets/timeline.svg", import.meta.url);
const svg = await readFile(path, "utf8");

const from = svg.indexOf(START);
const to = svg.indexOf(END);
if (from === -1 || to === -1 || to < from) {
  throw new Error(`Could not find ${START} / ${END} markers in assets/timeline.svg`);
}

const next = svg.slice(0, from) + playheadSvg(playheadX()) + svg.slice(to + END.length);

if (next === svg) {
  console.log("Playhead already in position.");
} else {
  await writeFile(path, next);
  console.log("Playhead moved.");
}
