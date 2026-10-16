// Refresh the desktop showreel's Boston session date. Reel time is independent.
// The mobile showreel uses a static SESSION 01 label.
// No dependencies, no network. Node 20+.

import { readFile, writeFile } from "node:fs/promises";

const START = "  <!-- SESSION:START -->";
const END = "  <!-- SESSION:END -->";

function sessionDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function sessionSvg(date, x, y, size) {
  const label = `SESSION ${date.replaceAll("-", ".")}`;
  // Geist Mono outlines are in the SVG. Raw GitHub CSP blocks fonts.
  const glyphs = [...label].map((char, i) =>
    `<use href="#letter-m-${char.codePointAt(0)}" x="${i * 650}"/>`).join("");
  return [
    START,
    `  <g id="session-date" data-date="${date}" data-label="${label}" data-font-size="${size}" data-secondary="true" aria-label="${label}" fill="#a09c94">`,
    `    <g transform="translate(${x} ${y}) scale(${size / 1000} ${-size / 1000})">${glyphs}</g>`,
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
const [x, y, size] = ["x", "y", "size"].map((key) =>
  Number(svg.match(new RegExp(`data-session-${key}="([^"]+)"`))[1]));
const next = svg.slice(0, from) + sessionSvg(sessionDate(), x, y, size) + svg.slice(to + END.length);
if (next !== svg) {
  await writeFile(path, next);
}
console.log(next !== svg ? "Session date refreshed." : "Session date is current.");
