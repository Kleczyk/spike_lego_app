# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**Polish-language teaching materials** for LEGO® Education SPIKE™ Prime programmed in Python
(firmware "SPIKE 3"). The intended reader is **primary-school teachers with no programming
background**, so all UI text, code comments, and explanations are in Polish and deliberately
jargon-light.

Deliverables:

- **The "kompendium" web app** (this Vite + React project) — a tabbed page with five tabs:
  **Start** (program basics + glossary), **Mapa modułów** (searchable API tree with a rich detail
  panel: param tables, examples, "Zaawansowane" section), **Plac zabaw** (animated simulators for
  drive steering, single motor, and every sensor — each dictates a live copyable code line),
  **Bloki** (a Blockly workspace, Polish locale, that generates a complete SPIKE 3 Python program
  live), **Przepisy** (searchable "Chcę, żeby robot…" cookbook of complete programs).
- `SPIKE_Prime_Python_sciaga.docx` / `.pdf` — "ściąga" (cheat sheet). Binary; not generated from
  the app. Edit the `.docx`; the `.pdf` is its exported copy. The PDF is also the source for the
  parameter types/ranges/defaults encoded in `src/data/api.js` (verified against
  tuftsceeo.github.io/SPIKEPythonDocs; note: the docs prose has typos `CANCELED`/`BREAK` — the real
  firmware constants are `CANCELLED`/`BRAKE`).

## Commands

- `npm install` — install dependencies (React 18, Vite 5, `qrcode.react`, `blockly`; no test
  framework, no linter).
- `npm run dev` — dev server with HMR at http://localhost:5173.
- `npm run build` — production build to `dist/`; `npm run preview` serves that build locally.
- `docker compose up --build` — build the multi-stage image (node build → nginx) and serve at
  **http://localhost:6767** (container `spike-kompendium`).
- `cloudflared tunnel --url http://localhost:6767` — quick public link (trycloudflare.com) for
  sharing the running container.

## Project structure

```
src/
├── main.jsx                  # entry: mounts <App/>, imports styles/global.css
├── App.jsx                   # sticky header + tab bar (useState; ids:
│                             #   start|mapa|plac|bloki|przepisy; the bloki tab hides the footer
│                             #   and adds the sp-root--bloki class for full-height layout)
├── hooks/useCopy.js          # [copied, copy] — clipboard + 1.6 s "Skopiowano!" state
├── components/               # shared: Code, ParamTable, Advanced, MiniTable, LiveLine,
│                             #   AuthorPanel (fullscreen "O autorze" portal overlay; photo in
│                             #   public/, QR code via qrcode.react, styles in author.css)
├── data/                     # ★ SINGLE SOURCE OF TRUTH for all content
│   ├── api.js                # the API tree + node constructors (p/fn/cst/funcs/consts)
│   ├── constants.js          # STOP_FLAGS, DIRECTIONS, STATUSES, ACC accent map, STOP_OPTS
│   ├── recipes.js            # RECIPES + RECIPE_CATS (cookbook)
│   └── glossary.js           # GLOSSARY cards for the Start tab
├── features/
│   ├── start/StartTab.jsx
│   ├── map/                  # MapTab, TreeNode, DetailPanel, treeUtils (nodeVisual/matches)
│   ├── playground/           # PlaygroundTab + DriveSim, MotorSim, DistanceSim, ColorSim,
│   │                         #   ForceSim, MotionSim
│   ├── blocks/               # BlocksTab (Blockly workspace, PL locale) + spikeDefs (BLOCK_DEFS/
│   │                         #   TOOLBOX), spikeTheme, pyGen (generateProgram/lintProgram),
│   │                         #   pyHelpers — custom block set that emits SPIKE 3 Python
│   └── recipes/              # RecipesTab, RecipeCard
└── styles/                   # global.css (base + shared components), map.css, playground.css,
                              #   recipes.css, blocks.css, author.css (each imported by the
                              #   component/tab that uses it)
```

**To change content, edit `src/data/*`, not components.** Rendering is generic.

- `API` (in `data/api.js`) is a tree of nodes, each with `kind`:
  `group | pkg | mod | folder | fn | const | note`. Build nodes with the constructors:
  - `fn(name, sig, desc, opts)` — `opts`: `{ aw, returns, params, example }`. `params` is a list of
    `p(name, type, default, desc, adv)` rows; `adv: true` rows render only when "⚙️ Zaawansowane"
    is expanded. `example` is a `Code`-compatible lines array.
  - `cst(name, path, desc)`; `funcs(path, list)` / `consts(path, list)` wrap lists into
    "Funkcje"/"Stałe" folders and **auto-derive each child's `path`** from the parent `path` string —
    so the `path` you pass must match the module's real dotted name.
  - `mod`/`pkg` nodes carry an `emoji` used as the tree icon (`treeUtils.nodeVisual`).
  - `DetailPanel` renders the shared tables from `data/constants.js` whenever a function's params
    include `stop`/`direction` or its `returns` mentions "status".
- `RECIPES` — entries `{ id, cat, emoji, accent, title, keywords, intro, code, note?, adv? }`;
  `RECIPE_CATS` defines the filter chips. `GLOSSARY` — `{ term, emoji, def }`.

Shared components: `Code` (lines array of strings or `{ t, c }` with syntax class `kw`/`cmt`/`fn`;
indentation preserved via `white-space:pre` — don't remove it), `ParamTable`, `Advanced`
(collapsible ⚙️ panel), `MiniTable`, `LiveLine` (the dark "dictated command" bar under simulators).

**Plac zabaw simulators** are pure CSS/transform animations driven by sliders; each renders its
current call in a `LiveLine`. The steering math in `DriveSim` is the core teaching point:
`s = steer/100`; if `s ≥ 0` slow the right wheel (`r = speed*(1−2s)`), else slow the left
(`l = speed*(1+2s)`).

Polish quote marks inside JS strings must be `„…”` (U+201E/U+201D) — an ASCII `"` as the closing
quote terminates the string and breaks the build.

## Design system

One visual language across the whole app — keep it consistent when editing:

- **Fonts:** Fredoka (headings), Nunito (body), JetBrains Mono (code) — Google Fonts `@import` at
  the top of `styles/global.css`.
- **Class prefix:** every class is `sp-…`.
- **Palette** lives in `:root` CSS custom properties — paper background `--bg:#F4F1E9` plus a
  **meaning-coded accent set**: `--motor` amber (single motors), `--drive` blue (driving/movement),
  `--sense` sage-green (sensors), `--neutral`, `--yellow`, and the dark `--code-bg`/`--code-ink`
  for code blocks. Each accent has a soft variant (`--motor-soft`, etc.).
- **Accent-by-section pattern:** a `<section>` sets `--accent` and `--accent-soft` inline
  (`style={{ "--accent": "var(--motor)", ... }}`); its children then reference `var(--accent)`.
  The color carries semantic meaning, so match the accent to the topic (motor/drive/sense), don't
  pick freely.
- Responsive breakpoints and the `prefers-reduced-motion` block (in `playground.css`) — preserve.

## Content conventions (the SPIKE Prime API model)

These mirror the official SPIKE 3 Python API and must stay accurate:

- **Importable modules:** `motor`, `motor_pair`, `color_sensor`, `distance_sensor`, `force_sensor`,
  `color_matrix`, `device`, `color`, `orientation`, `runloop`. **Packages:** `hub` (`port`,
  `button`, `light`, `light_matrix`, `motion_sensor`, `sound`) and `app` (`bargraph`, `display`,
  `linegraph`, `music`, `sound`).
- **Async/`await`:** movement and wait calls are awaitable; programs run via `runloop.run(main())`
  where `main` is `async def`. The guide explains `await` as "wait until the robot finishes."
- **Units & ranges to keep correct:** velocity in degrees/sec (small motor ±660, medium ±1110,
  large ±1050); steering −100…100; ports A–F; `distance()` in mm (−1 = no reading); `force()`
  0–100 dN; reflection 0–100%; times in ms; `tilt_angles()` in decidegrees; `acceleration`/
  `deceleration` 1–10000 (default 1000); stop flags COAST/BRAKE/HOLD/CONTINUE/SMART_COAST/
  SMART_BRAKE = 0–5; movement status constants include `CANCELLED` (double L).
- Footers credit LEGO® Education SPIKE™ Prime and mark the material as unofficial — keep that.
