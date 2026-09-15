// Slides the playhead in assets/timeline.svg so it tracks today's date.
// No dependencies, no network. Node 20+.

import { readFile, writeFile } from "node:fs/promises";

// Must stay in sync with the axis drawn in assets/timeline.svg:
// x = AXIS_X0 at Jan 2023, advancing AXIS_PX_MONTH per month.
const AXIS_X0 = 278;
const AXIS_PX_MONTH = 12.85;
const AXIS_MIN = 278;
const AXIS_MAX = 972;

const START = "  <!-- PH:START -->";
const END = "  <!-- PH:END -->";

function playheadX(now = new Date()) {
  const months =
    (now.getFullYear() - 2023) * 12 + now.getMonth() + (now.getDate() - 1) / 30;
  const x = AXIS_X0 + months * AXIS_PX_MONTH;
  return Math.min(AXIS_MAX, Math.max(AXIS_MIN, x));
}

function playheadSvg(x) {
  const r = (n) => Number(n.toFixed(1));
  return [
    START,
    "  <g>",
    `    <rect class="gl" x="${r(x - 3.5)}" y="46" width="7" height="168" fill="#f0567a" opacity=".28"/>`,
    `    <rect x="${r(x - 0.8)}" y="46" width="1.6" height="168" fill="#f0567a"/>`,
    `    <path d="M${r(x - 7.5)} 40h15l-7.5 9z" fill="#f0567a"/>`,
    `    <text class="s" x="${r(x)}" y="232" font-size="10" letter-spacing="2" fill="#f0567a" text-anchor="middle">NOW</text>`,
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
