<img src="assets/banner.svg" alt="Ali Tleis, Web Application Developer (AI Integration), MIT Lincoln Laboratory, Boston MA" width="100%">

I build AI systems that have to work inside real constraints. Right now that means an LLM-backed search layer over Apache Solr at **MIT Lincoln Laboratory**, a federally funded DoD research lab operated by MIT. Before that, I built my first PC at 15 and never stopped taking things apart.

📍 Boston, MA &nbsp;·&nbsp; 🎓 Northeastern, CS + Sociology, Aug 2028 &nbsp;·&nbsp; 🔒 DoD clearance investigation in progress

🌐 [alitleis.dev](https://alitleis.dev) &nbsp;·&nbsp; 💼 [LinkedIn](https://www.linkedin.com/in/ali-tleis-091800247/) &nbsp;·&nbsp; ✉️ [Tleis.a@northeastern.edu](mailto:Tleis.a@northeastern.edu)

## 🎞️ Experience

<img src="assets/timeline.svg" alt="Experience timeline: MIT Lincoln Laboratory Jun 2026 to present, Top Choice Realty Jun to Sep 2025, Robert DeFalco Realty Jun to Sep 2023" width="100%">

### MIT Lincoln Laboratory &nbsp;·&nbsp; Web Application Developer (AI Integration) Co-op
`Jun 2026 – Present` `Lexington, MA`

- Own design and implementation of an **LLM-backed search layer** over the Laboratory's Apache Solr index. Authored the technical proposal and drove it through engineering review ahead of schedule.
- Engineered retrieval logic in **Java** that ranks and narrows candidate documents before the model is ever invoked: **70% faster queries** and **40% fewer tokens** per request.
- Built the ingestion layer on **Norconex**, handling authenticated access, JavaScript-rendered pages, and mixed document formats.
- Delivered a working end-to-end prototype and demoed it to the group, putting SharePoint, internal documentation, and the public Laboratory site behind **one search interface**.

### Top Choice Realty &nbsp;·&nbsp; Frontend Developer Intern
`Jun 2025 – Sep 2025` `Staten Island, NY`

- Architected reusable **React/TypeScript** component patterns to standardize dashboard and intake workflows.
- Refactored **MongoDB** schema design to enforce consistency across client and agent records, eliminating duplicate entries.
- Built **Python and C#** pipelines syncing distributed MongoDB records across virtualized environments: **30% less manual reconciliation time**.

### Robert DeFalco Realty &nbsp;·&nbsp; Computer Technician Intern
`Jun 2023 – Sep 2023` `Staten Island, NY`

- Developed **PowerShell** automation for provisioning and deployment across **20+ systems**, standardizing Windows and Linux configurations.

## 🎚️ Stack

<img src="assets/stack.svg" alt="Stack by layer. Languages: Java, Python, TypeScript, JavaScript, C#, C++, SQL, PowerShell. Frameworks: React, Next.js, Node.js/Express, Tailwind CSS. Data and search: PostgreSQL, MySQL, MongoDB, Apache Solr. Infrastructure and tools: Docker, Linux, Git, Fly.io, OpenCV, Gemini API." width="100%">

## 🚀 Projects

### 🎬 Eternal2x &nbsp;·&nbsp; DaVinci Resolve Smart Upscale
[Site](https://eternal2x.com) &nbsp;·&nbsp; [Code](https://github.com/Alitleis123/Eternal2x.com) &nbsp;·&nbsp; `Python` `Lua` `OpenCV` `FFmpeg`

A Resolve plugin that decodes footage through OpenCV's FFmpeg backend and scores **every frame for motion** using tile-based analysis. High-motion frames get grouped into segments, cut with markers, and upscaled 2x with Optical Flow interpolation; static segments use Nearest instead, so the render doesn't waste time on frames nobody is looking at. Ships as a one-click Windows and macOS installer with an auto-updater.

### 🧩 Better Canvas
[Code](https://github.com/Alitleis123/Better-Canvas) &nbsp;·&nbsp; `Chrome MV3` `Firefox` `JavaScript`

The most feature-complete extension for Instructure Canvas: 30+ appearance controls, 12 preset themes, dark mode that reaches **inside iframes** like SpeedGrader, plus color-blind and reduced-motion modes. Every Canvas API call rides your existing session, so nothing leaves the domain. No accounts, no telemetry, no paywall.

### 🤖 Eternal Summary
[Site](https://alitleis123.github.io/Eternal-Summary/) &nbsp;·&nbsp; [Code](https://github.com/Alitleis123/Eternal-Summary) &nbsp;·&nbsp; `Chrome MV3` `Node/Express` `Docker` `Fly.io` `Gemini API`

A background service worker and injected content scripts pull live page text for one-click AI summaries. A containerized Node/Express proxy on Fly.io fronts the Gemini API, scoping host permissions to the backend origin and keeping credentials in runtime secrets rather than the extension bundle.

## 📼 Now

<!-- NOW:START -->
- 🔨 [`AliTleis.dev`](https://github.com/Alitleis123/AliTleis.dev) · Redesign site: new palette, search, tighter layout · today
- 🔨 [`Better-Canvas`](https://github.com/Alitleis123/Better-Canvas) · Better Canvas 3.1: design tokens, instant settings, lifecycle fixes · 25d ago
<!-- NOW:END -->

---

<sub>⚡ This page edits itself. A [GitHub Action](.github/workflows/refresh-profile.yml) runs [`refresh-profile.mjs`](scripts/refresh-profile.mjs) daily. It rewrites the **Now** block from my recent pushes and slides the **NOW** playhead on the timeline to today's date. The graphics are hand-written SVG: no image hosts, no third-party badge services, and all motion stops under `prefers-reduced-motion`.</sub>
