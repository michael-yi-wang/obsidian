# Calendar Heatmap for Obsidian

This `CalendarHotMap.js` script is an Obsidian DataViewJS visualization that renders a **GitHub-style yearly heatmap** of your notes. It helps you track your daily note-taking activity, habits, or journal entries in a clean, interactive calendar view.

## Features

- **Yearly Overview:** Displays a full year of activity in a structured 4x3 grid (3 months per row).
- **Heatmap coloring:** Days are colored in shades of green based on the number of notes created that day (darker green = more notes).
- **Interactive Tooltips:** Hover over any day to see a list of notes created on that date.
- **Click to Open:** Click on a day to instantly open the first corresponding note.
- **Responsive Layout:** The calendar centers itself and adapts to the width of your note.
- **Day Numbers:** Each cell displays the day of the month for easy reading.

## Prerequisites

To use this script, you need:

1. **Obsidian** (The note-taking app).
2. **Dataview Plugin** installed and enabled.
3. **Frontmatter in your notes:** The script primarily looks for a `created` property in your note's frontmatter (YAML header).

### Example Frontmatter

Your notes should have a header like this:

```yaml
---
created: 2026-01-29
tags: [journal, daily]
---
```

- **Priority 1:** `created` property (e.g., `2026-01-29`).
- **Priority 2:** `date` property (fallback if `created` is missing).
- **Priority 3:** The file name itself, if it is in `YYYY-MM-DD` format (e.g., `2026-01-29.md`).

## Installation

1. Copy the code from `CalendarHotMap.js`.
2. Create a new note in Obsidian (or use an existing one).
3. Insert a DataviewJS block:

    ````javascript
    ```dataviewjs
    // Paste the code here, or use dv.view() to load it from a file
    dv.view("Path/To/CalendarHotMap")
    ```
    ````

## Customization

You can configure the script by editing the constants at the top of the file:

### 1. Target Folder

By default, the script searches for notes in the `"Notes"` folder. To change this to your specific folder (e.g., "Daily Notes" or "Journal"), update this line:

```javascript
// Change "Notes" to your desired folder path
const DAILY_NOTES_FOLDER = '"My Daily Journal"';

// Or set it to "" to search your entire vault
const DAILY_NOTES_FOLDER = "";
```

### 2. Cell Size

To change the size of the day squares:

```javascript
const YEAR_CELL_SIZE = "20px"; // Increase or decrease as needed
```

### 3. Colors

You can modify the `COLORS` array to change the heatmap theme (e.g., to blue or purple shades):

```javascript
const COLORS = [
  "#2a2a2a", // 0 entries (Empty)
  "#0e4429", // Level 1
  "#006d32", // Level 2
  "#26a641", // Level 3
  "#39d353"  // Level 4+
];
```
