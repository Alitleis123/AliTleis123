// Refreshes the two live parts of this profile:
//   1. the "Now" block in README.md, from recent public push activity
//   2. the playhead in assets/timeline.svg, so it tracks today's date
// No dependencies. Node 20+ global fetch only.

import { readFile, writeFile } from "node:fs/promises";

const USER = process.env.GH_USER ?? "Alitleis123";
const WINDOW_DAYS = 30;
const MAX_REPOS = 3;
const MAX_LOOKUPS = 8;
const SELF = `${USER}/${USER}`.toLowerCase();

const START = "<!-- NOW:START -->";
const END = "<!-- NOW:END -->";

const headers = {
  accept: "application/vnd.github+json",
  "user-agent": `${USER}-profile-now`,
};
if (process.env.GITHUB_TOKEN) {
  headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const cutoff = new Date(Date.now() - WINDOW_DAYS * 86_400_000);

async function api(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, body: await res.json() };
}

function ago(date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

// Which repos did we push to inside the window? The events feed is NOT reliably
// ordered by date, so scan every event rather than stopping at the first old one.
async function pushedRepos() {
  const repos = new Map();

  for (let page = 1; page <= 3; page++) {
    const { ok, body } = await api(
      `https://api.github.com/users/${USER}/events/public?per_page=100&page=${page}`,
    );
    if (!ok || body.length === 0) break;

    for (const event of body) {
      if (event.type !== "PushEvent") continue;

      const at = new Date(event.created_at);
      if (at < cutoff) continue;
      if (event.repo.name.toLowerCase() === SELF) continue;

      const seen = repos.get(event.repo.name);
      if (!seen || at > seen) repos.set(event.repo.name, at);
    }
    if (body.length < 100) break;
  }
  return repos;
}

// The events payload carries no commit list, so ask each repo directly.
async function commitsFor(repo) {
  const { ok, body } = await api(
    `https://api.github.com/repos/${repo}/commits?since=${cutoff.toISOString()}&per_page=100`,
  );
  if (!ok || !Array.isArray(body) || body.length === 0) return null;

  const mine = body.filter(
    (c) => c.author?.login?.toLowerCase() === USER.toLowerCase(),
  );
  // Fall back to every commit if the author link doesn't resolve to the account.
  const commits = mine.length > 0 ? mine : body;

  return {
    count: commits.length,
    at: new Date(commits[0].commit.author.date),
    subject: commits[0].commit.message.split("\n")[0].trim(),
  };
}

function render(entries) {
  if (entries.length === 0) {
    return "> 🔒 Heads-down on work that lives in a private repo.";
  }

  // Repo + latest commit subject only. Raw commit counts undersell the work.
  return entries
    .slice(0, MAX_REPOS)
    .map((e) => {
      const short = e.repo.split("/")[1];
      const subject =
        e.subject.length > 72 ? `${e.subject.slice(0, 69)}...` : e.subject;
      return `- 🔨 [\`${short}\`](https://github.com/${e.repo}) · ${subject} · ${ago(e.at)}`;
    })
    .join("\n");
}

// --- timeline playhead -------------------------------------------------
// Keeps assets/timeline.svg honest: the marker slides as real time passes.
// Must stay in sync with the axis drawn in that file.
const AXIS_X0 = 278;      // x of Jan 2023
const AXIS_PX_MONTH = 12.85;
const AXIS_MIN = 278;
const AXIS_MAX = 972;

function playheadX(now = new Date()) {
  const months =
    (now.getFullYear() - 2023) * 12 +
    now.getMonth() +
    (now.getDate() - 1) / 30;
  const x = AXIS_X0 + months * AXIS_PX_MONTH;
  return Math.min(AXIS_MAX, Math.max(AXIS_MIN, x));
}

function playheadSvg(x) {
  const r = (n) => Number(n.toFixed(1));
  return [
    "  <!-- PH:START -->",
    "  <g>",
    `    <rect class="gl" x="${r(x - 3.5)}" y="46" width="7" height="168" fill="#f0567a" opacity=".28"/>`,
    `    <rect x="${r(x - 0.8)}" y="46" width="1.6" height="168" fill="#f0567a"/>`,
    `    <path d="M${r(x - 7.5)} 40h15l-7.5 9z" fill="#f0567a"/>`,
    `    <text class="s" x="${r(x)}" y="232" font-size="10" letter-spacing="2" fill="#f0567a" text-anchor="middle">NOW</text>`,
    "  </g>",
    "  <!-- PH:END -->",
  ].join("\n");
}

async function refreshPlayhead() {
  const svgPath = new URL("../assets/timeline.svg", import.meta.url);
  const svg = await readFile(svgPath, "utf8");

  const a = svg.indexOf("  <!-- PH:START -->");
  const b = svg.indexOf("  <!-- PH:END -->");
  if (a === -1 || b === -1 || b < a) {
    throw new Error("Could not find PH markers in assets/timeline.svg");
  }

  const next =
    svg.slice(0, a) + playheadSvg(playheadX()) + svg.slice(b + "  <!-- PH:END -->".length);

  if (next === svg) {
    console.log("Playhead already in position.");
  } else {
    await writeFile(svgPath, next);
    console.log("Playhead moved.");
  }
}

await refreshPlayhead();

const candidates = [...(await pushedRepos()).entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, MAX_LOOKUPS);

const entries = [];
for (const [repo] of candidates) {
  const stats = await commitsFor(repo);
  if (stats) entries.push({ repo, ...stats });
}
entries.sort((a, b) => b.at - a.at);

const path = new URL("../README.md", import.meta.url);
const readme = await readFile(path, "utf8");

const from = readme.indexOf(START);
const to = readme.indexOf(END);
if (from === -1 || to === -1 || to < from) {
  throw new Error(`Could not find ${START} / ${END} markers in README.md`);
}

const body = render(entries);
const next =
  readme.slice(0, from + START.length) + "\n" + body + "\n" + readme.slice(to);

if (next === readme) {
  console.log("Now block already up to date.");
} else {
  await writeFile(path, next);
  console.log("Now block updated:\n" + body);
}
