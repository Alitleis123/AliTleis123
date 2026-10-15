// Slides the playhead in assets/timeline.svg so it tracks today's date.
// No dependencies, no network. Node 20+.

import { readFile, writeFile } from "node:fs/promises";

// Month offsets from Jan 2023 and their x positions in assets/timeline.svg.
// Working months get room for readable clips. Empty gaps are compressed.
const AXIS_STOPS = [
  [0, 64],    // Jan 2023
  [5, 96],    // Jun 2023, Robert DeFalco Realty starts
  [8, 286],   // Sep 2023, Robert DeFalco Realty ends
  [29, 314],  // Jun 2025, Top Choice Realty starts
  [32, 514],  // Sep 2025, Top Choice Realty ends
  [41, 542],  // Jun 2026, MIT Lincoln Laboratory starts
  [48, 844],  // Jan 2027, planned co-op end
  [54, 856],  // Jul 2027, end of the drawn axis
];

const START = "  <!-- PH:START -->";
const END = "  <!-- PH:END -->";

function playheadX(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthStart = Date.UTC(year, month, 1);
  const monthEnd = Date.UTC(year, month + 1, 1);
  const daysInMonth = (monthEnd - monthStart) / 86400000;
  const months = (year - 2023) * 12 + month + (now.getUTCDate() - 1) / daysInMonth;
  if (months <= AXIS_STOPS[0][0]) return AXIS_STOPS[0][1];
  for (let i = 1; i < AXIS_STOPS.length; i++) {
    const [endMonth, endX] = AXIS_STOPS[i];
    if (months <= endMonth) {
      const [startMonth, startX] = AXIS_STOPS[i - 1];
      return startX + (months - startMonth) / (endMonth - startMonth) * (endX - startX);
    }
  }
  return AXIS_STOPS.at(-1)[1];
}

function playheadSvg(x) {
  const r = (n) => Number(n.toFixed(1));
  const badgeX = Math.min(778, Math.max(64, x - 43));
  return [
    START,
    '  <g id="playhead">',
    `    <path d="M${r(x)} 63V205" stroke="#f2a93b" stroke-width="1.5"/>`,
    `    <path d="M${r(x - 5)} 59h10l-5 6z" fill="#f2a93b"/>`,
    `    <rect class="current-pill" x="${r(badgeX)}" y="8" width="86" height="34" rx="17" fill="#302314" stroke="#f2a93b" stroke-opacity=".65"/>`,
    `    <text class="mono" data-readable="true" x="${r(badgeX + 43)}" y="35" font-size="28" fill="#fbe3b6" text-anchor="middle">NOW</text>`,
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
