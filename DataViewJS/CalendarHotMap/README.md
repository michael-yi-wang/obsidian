# Calendar Heatmap for Obsidian

This `CalendarHotMap.js` script is an advanced Obsidian DataViewJS visualization that renders an interactive, GitHub-style heatmap of your note-taking activity. It supports dual modes for tracking Daily Notes and Knowledge Base contributions with a fully responsive design.

## Features

- **Dual View Modes:**
    - **📅 Daily Notes:** Tracks your daily journal entries (green theme).
    - **🧠 Knowledge Base:** Tracks note creation across your entire vault or specific folders (blue theme).
- **Navigation Controls:**
    - **Yearly/Monthly Toggle:** Navigate between years easily.
    - **"Today" Button:** Instantly jump back to the current date/year.
    - **Mobile Optimization:** Automatically switches to a clean single-month view on mobile devices with dedicated month selectors.
- **Smart Interaction:**
    - **Interactive Tooltips:** Hover over any day to see a preview list of notes.
    - **Selection Menu:** If multiple notes exist on the same day, a menu appears allowing you to choose which one to open.
    - **State Persistence:** Remembers your last selected mode (Daily vs. KB) even after you close Obsidian or navigate away.
- **Visual Polish:**
    - **Adaptive Legend:** Shows activity levels dynamically based on the current mode.
    - **High Readability:** Optimized font sizes and cell spacing for both desktop and mobile.
    - **Stable Layout:** Fixed-frame design on desktop prevents UI "jumping" when switching years.

## Prerequisites

1. **Obsidian** installed.
2. **Dataview Plugin** installed and enabled.
3. **Moment.js** (Standard in Obsidian).

## Installation

1. Create a folder in your vault: `DataViewJS/CalendarHotMap/`.
2. Save the `CalendarHotMap.js` file into that folder.
3. In any Obsidian note, insert the following block:

    ````javascript
    ```dataviewjs
    dv.view("DataViewJS/CalendarHotMap")
    ```
    ````

## Configuration

You can customize the script by editing the `CONFIG` object at the top of `CalendarHotMap.js`:

```javascript
const CONFIG = {
    // Path to your Daily Notes folder
    dailyNotesPath: '"Calendar Notes/Daily Notes"', 
    
    // Path to your Knowledge Base (set to '' to search all non-daily folders)
    kbPath: '"Notes/Knowledge Base"', 
    
    // Size of the date squares
    cellBoxSize: 26,
    
    // Space between squares
    cellGap: 2,      
};
```

### Date Detection Priority
The script detects the date of a note in the following order:
1. `created` property in Frontmatter.
2. `date` property in Frontmatter.
3. File name (if formatted as `YYYY-MM-DD`).
4. File creation date (cday) as a fallback.

## Customization

### Themes
You can modify the `STYLES` object to change the background, text, or accent colors. The `dailyColors` and `kbColors` arrays control the 5-level intensity gradient for each mode.

### Persistent Settings
The script uses `localStorage` to save your `mode` selection. To reset it, simply switch modes using the UI buttons, and it will remember that state for your next session.