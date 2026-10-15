// Slides the playhead in assets/timeline.svg so it tracks today's date.
// No dependencies, no network. Node 20+.

import { readFile, writeFile } from "node:fs/promises";

// Must stay in sync with the axis drawn in assets/timeline.svg:
// x = AXIS_X0 at Jan 2023, advancing AXIS_PX_MONTH per month.
const AXIS_X0 = 414;
const AXIS_PX_MONTH = 8;
const AXIS_MIN = 414;
const AXIS_MAX = 846;

const START = "  <!-- PH:START -->";
const END = "  <!-- PH:END -->";

function playheadX(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthStart = Date.UTC(year, month, 1);
  const monthEnd = Date.UTC(year, month + 1, 1);
  const daysInMonth = (monthEnd - monthStart) / 86400000;
  const months = (year - 2023) * 12 + month + (now.getUTCDate() - 1) / daysInMonth;
  const x = AXIS_X0 + months * AXIS_PX_MONTH;
  return Math.min(AXIS_MAX, Math.max(AXIS_MIN, x));
}

function playheadSvg(x) {
  const r = (n) => Number(n.toFixed(1));
  return [
    START,
    '  <g id="playhead">',
    `    <path d="M${r(x)} 102V330" stroke="#f2a93b" stroke-width="2"/>`,
    `    <path d="M${r(x - 8)} 93h16l-8 10z" fill="#f2a93b"/>`,
    '    <rect x="742" y="8" width="114" height="32" rx="3" fill="#f2a93b"/>',
    '    <text class="mono" x="799" y="33" font-size="28" fill="#101012" text-anchor="middle">NOW</text>',
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
