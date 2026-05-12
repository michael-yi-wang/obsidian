# Git-Style Heatmap for Obsidian

A DataviewJS visualization that renders a full-year, GitHub-style contribution heatmap of your Obsidian vault. Each cell represents one day; colour intensity reflects how many notes were created on that day, as recorded in the `created` frontmatter property.

## Features

- **Full-year grid** — 52/53 week columns × 7 day rows, identical to GitHub's contribution graph.
- **`created`-based** — reads the `created` date from each note's frontmatter; notes without `created` are ignored.
- **Year navigation** — prev/next arrows and a **Today** button; the selected year is persisted in `localStorage`.
- **5-level colour scale** — empty → dark green → bright green, with configurable thresholds.
- **Hover tooltips** — shows the date, note count, and up to 6 note titles.
- **Click to open** — single note opens directly; multiple notes on the same day show a selection menu.
- **Stats bar** — Total Notes, Active Days, Longest Streak, Current Streak, Best Day.
- **Horizontal scroll** — safe to embed in narrow sidebars or reading panes.

## Prerequisites

1. **Obsidian** desktop app.
2. **Dataview** plugin installed and enabled (Community Plugins).
3. Notes must have a `created` property in their frontmatter (see below).

## Frontmatter format

```yaml
---
created: 2025-03-14
---
```

Supported value types: ISO date string (`YYYY-MM-DD`), ISO datetime string, Obsidian date objects, or Luxon DateTime objects returned by Dataview.

## Installation

1. Copy `Git-Style-Heatmap.js` into your vault at:
   ```
   DataViewJS/Git-Style-Heatmap/Git-Style-Heatmap.js
   ```
2. In any note, add a `dataviewjs` block:

   ````markdown
   ```dataviewjs
   dv.view("DataViewJS/Git-Style-Heatmap")
   ```
   ````

## Configuration

Edit the `CONFIG` object at the top of `Git-Style-Heatmap.js`:

```javascript
const CONFIG = {
    // null  → search entire vault
    // set   → e.g. '"Notes/Knowledge Base"' to limit to a folder
    searchPath: null,

    // Visual sizing
    cellSize: 13,   // px width/height of each day cell
    cellGap:  3,    // px gap between cells

    // Colour scale (index 0 = empty, index 4 = most active)
    colors: [
        "#161b22",  // 0 notes
        "#0e4429",  // 1–2 notes
        "#006d32",  // 3–5 notes
        "#26a641",  // 6–9 notes
        "#39d353",  // 10+ notes
    ],

    // Minimum note count to reach each colour level
    thresholds: [0, 1, 3, 6, 10],
};
```

### Limiting scope

Set `searchPath` to a quoted Dataview folder path to restrict which notes are counted:

```javascript
searchPath: '"Notes/Journal"',
```

Leave it as `null` to include every note in the vault that has a `created` property.
