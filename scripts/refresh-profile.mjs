// Refresh the editing session's UTC date stamp. Reel time stays independent.
// No dependencies, no network. Node 20+.

import { readFile, writeFile } from "node:fs/promises";

const START = "  <!-- SESSION:START -->";
const END = "  <!-- SESSION:END -->";

function sessionDate(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function sessionSvg(date) {
  const label = `SESSION ${date.replaceAll("-", ".")}`;
  // Geist Mono outlines are in the SVG. Raw GitHub CSP blocks fonts.
  const glyphs = [...label].map((char, i) =>
    `<use href="#letter-m-${char.codePointAt(0)}" x="${i * 650}"/>`).join("");
  return [
    START,
    `  <g id="session-date" data-date="${date}" aria-label="${label}" fill="#a09c94">`,
    `    <g transform="translate(646 27) scale(.012 -.012)">${glyphs}</g>`,
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
const next = svg.slice(0, from) + sessionSvg(sessionDate()) + svg.slice(to + END.length);
if (next === svg) {
  console.log("Session date is current.");
} else {
  await writeFile(path, next);
  console.log("Session date refreshed.");
}
