# Publications Feature — Design Spec
**Date:** 2026-05-21  
**Status:** Approved

---

## Overview

Add a Publications section to the portfolio across two surfaces:

1. **Home page section** — a Beacon/Spotlight highlight block below the existing "Who I am." about section, linking to individual papers and to the full publications panel.
2. **Publications panel** — a full IDE panel (new tab, sidebar folder, mobile nav item) using an Annotated Index layout.

---

## Publications Data

Three papers from the resume:

| # | Title | Venue | Location | Year | DOI/Link |
|---|-------|-------|----------|------|----------|
| 01 | Dependence Minimization for Multi-Label Classification: An Alternative to Human Labeling | CogMI 2025 | Pittsburgh, PA | 2025 | `10.1109/CogMI67134.2025.00027` |
| 02 | Prompts and Thoughts: Can Your Cyber Curriculum Meet the Job Skills | CogMI 2025 | Pittsburgh, PA | 2025 | `10.1109/CogMI67134.2025.00039` |
| 03 | Task-Aligned Contrastive Learning for Filtering Noise in Multi-Label Text Classification | IntelliSys 2026 | Amsterdam, Netherlands | 2026 | Pending DOI |

Papers 1 & 2 link to their DOI URLs: `https://doi.org/10.1109/CogMI67134.2025.00027` and `https://doi.org/10.1109/CogMI67134.2025.00039`. Paper 3 displays `// pending DOI` with no link.

Abstracts for the publications page are placeholder dummy text for now — one short paragraph per paper describing the gist of the research.

---

## Navigation Changes

### Title bar tabs
Add a new tab between `projects/` and `skills`:
```
★  publications/    (data-target="panel-publications")
```
Icon: `★` (amber `#f0a832`), consistent with the amber color scheme used for the publications folder.

### Sidebar file explorer
Add a `publications` subfolder under `alex_metzger/`, positioned between `projects/` and `skills.json`. The folder label is amber (`#f0a832`). Each paper is a `.tex` file with `∫` icon in yellow (`#DCDCAA`):

```
▾ 📁 publications          ← amber folder
    ∫ mlc_classification.tex    → scrolls to paper 01
    ∫ cyber_curriculum.tex      → scrolls to paper 02
    ∫ contrastive_learning.tex  → scrolls to paper 03
```

Clicking a file item switches to `panel-publications` and scrolls to the corresponding paper card (using `data-scroll` like the projects folder).

### Mobile bottom nav
Add a new button between `projects/` and `skills`:
```
★  pubs
(data-target="panel-publications")
```
Color: amber on active state. The résumé link already exists in the title bar pill on mobile — it stays there. The mobile nav will have 6 items total (about.me, projects/, pubs, skills, contact, résumé). The items flex-shrink naturally; at ≤560px labels already drop to 9px via the existing `.mnav-label` rule, which keeps all 6 readable.

### Keyboard shortcut
`5` key → `panel-publications`. Added to the existing `shortcuts` object in `script.js`.

### Status bar label
`tabNames['panel-publications'] = 'publications/'` added to the `tabNames` map.

---

## Home Page Section

Inserted as a new `<section>` inside `#panel-home`, directly after `.about-section` (the "Who I am." block).

### Visual design — Beacon/Spotlight

```
┌───────────────────────────────────────────────┐
│ // research output                            │
│                                               │
│ Peer-Reviewed           ┌────────────────┐    │
│ Publications.           │      3         │    │
│                         │  papers        │    │
│                         │  published     │    │
│                         └────────────────┘    │
│                                               │
│  ▏ CogMI 2025  ·  Pittsburgh, PA             │
│    Dependence Minimization for…               │
│    ↗ DOI: 10.1109/…00027                     │
│                                               │
│  ▏ CogMI 2025  ·  Pittsburgh, PA             │
│    Prompts and Thoughts: Can Your…            │
│    ↗ DOI: 10.1109/…00039                     │
│                                               │
│  ▏ IntelliSys 2026  ·  Amsterdam, NL         │
│    Task-Aligned Contrastive Learning…         │
│    // pending DOI                             │
│                                               │
│ ─────────────────────────────────────────── │
│ → View all publications     // 2 IEEE · 1 … │
└───────────────────────────────────────────────┘
```

**Details:**
- Background: `--panel-bg` (`#13161f`) with a subtle amber radial glow (`rgba(240,168,50,0.05)`) top-right, consistent with the hero's blue glow treatment.
- Eyebrow: `// research output` in `--font-mono`, `--accent` color.
- Heading: `Peer-Reviewed` + `Publications.` in `--font-display` (Fraunces), `Publications.` in italic light weight colored `--amber`.
- Counter: large `3` in `--font-display` weight 700, colored `--accent` (`#5ba3f5`); label `papers published` in `--font-mono` uppercase dim. The counter block floats top-right within the section header row.
- Papers: vertical list with a 3px colored accent bar on the left edge (gradient per paper: blue→teal / amber→orange / teal→green). Each item has: venue chip (teal for CogMI, amber for IntelliSys), location, paper title in body font weight 600, DOI link in `--accent` or `// pending DOI` in `--py-cmt`.
- Footer: thin top border, `→ View all publications` link (switches to `panel-publications`), `// 2 IEEE · 1 IntelliSys · 1 pending` note in `--py-cmt`.
- Section background: `--panel-bg` to differentiate from the `--panel-bg2` about section above it.

**Mobile (≤860px):** Counter block moves below the heading (flex column). Paper list stays vertical — no grid changes needed.  
**Mobile (≤560px):** Heading font-size reduces via `clamp` or explicit override matching other panel headings.

---

## Publications Panel

New `<section class="panel" id="panel-publications">` added after `#panel-contact`.

### Visual design — Annotated Index

**Panel header** (shared `.panel-header` class):
- Eyebrow: `★ publications/` in `--font-mono`, `--amber`
- Title: `Research & Publications.` in `--font-display` (`Publications.` italic/light in `--amber`)
- Subtitle: "Peer-reviewed work in multi-label classification, NLP, and cybersecurity AI."

**Paper list:**

Each paper entry is a two-column grid:

```
┌──────────┬──────────────────────────────────────────────┐
│  01      │  [ CogMI 2025 ]  Pittsburgh, PA              │
│  2025    │                                               │
│          │  Dependence Minimization for Multi-Label…    │
│          │                                               │
│          │  // We propose a dependence minimization…    │
│          │                                               │
│          │  DOI: 10.1109/…00027 ↗    Read Paper →      │
└──────────┴──────────────────────────────────────────────┘
```

- Left column (fixed ~64px): paper number in `--amber` `--font-mono`, year pill (small bordered chip in `--panel-card`)
- Border between columns: `1px solid --panel-border`
- Right body: venue chip (teal for CogMI, amber for IntelliSys) + location in dim mono; paper title in `--font-display` 1.35rem weight 700 `--text-h`; abstract paragraph in `--text-dim` 0.9rem prefixed with `// ` in `--py-cmt` color; DOI link in `--accent` + "Read Paper →" in `--py-kw`
- Hover: subtle `rgba(91,163,245,0.03)` background on the whole row
- Each entry separated by `1px solid --panel-border`

**Mobile (≤860px):** Left column collapses to a horizontal strip above the body (same treatment as `.proj-meta` on mobile — `flex-direction: row`, number + year side by side, border-bottom instead of border-right).

**Mobile (≤560px):** Abstract font-size can stay at 0.9rem; title reduces slightly via existing panel heading rules.

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Add tab, sidebar folder + 3 file items, `#panel-publications` section, home beacon section, mobile nav item |
| `style.css` | Add `.pub-beacon-*` styles (home section), `.pub-annot-*` styles (panel), `.icon-pub` color, mobile overrides |
| `script.js` | Add `panel-publications` to `tabNames`, shortcuts, `setupReveal`, tree item wiring |

No new files. No server-side changes. No new dependencies.

---

## Constraints

- Pure HTML/CSS/JS — no build step, no framework.
- All new CSS classes namespaced with `pub-` to avoid collisions with existing rules.
- Must not break existing panel switching, keyboard shortcuts, or scroll-reveal on other panels.
- `prefers-reduced-motion` already handled globally — no extra work needed.
- Accessibility: new panel gets `aria-labelledby`, sidebar items get correct `data-target` and focus handling via existing tree-item styles, mobile nav item mirrors existing pattern.
