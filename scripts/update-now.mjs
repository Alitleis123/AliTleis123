// Regenerates the "Now" block in README.md from recent public push activity.
// No dependencies — Node 20+ global fetch only.

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
    return "_Heads-down on work that lives in a private repo. Public commits show up here._";
  }

  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const lines = entries.slice(0, MAX_REPOS).map((e) => {
    const short = e.repo.split("/")[1];
    const subject =
      e.subject.length > 72 ? `${e.subject.slice(0, 69)}...` : e.subject;
    return `- [\`${short}\`](https://github.com/${e.repo}) — ${subject} · ${ago(e.at)}`;
  });

  return [
    `**Last ${WINDOW_DAYS} days** — ${plural(total, "commit")} across ${plural(entries.length, "repo")}`,
    "",
    ...lines,
  ].join("\n");
}

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
