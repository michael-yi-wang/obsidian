# Calendar Heatmap for Obsidian

This `CalendarHotMap.js` script is an advanced Obsidian DataViewJS visualization that renders an interactive, GitHub-style heatmap of your note-taking activity. It supports dual modes for tracking Calendar Notes (Daily, Weekly, Monthly, Annual) and Knowledge Base contributions with a fully responsive design.

## Features

- **Dual View Modes:**
    - **📅 Calendar Notes:** Tracks your Daily, Weekly, Monthly, and Annual notes (green theme).
    - **🧠 Knowledge Base:** Tracks note creation across your entire vault or specific folders (blue theme).
- **Navigation Controls:**
    - **Quarterly View:** View three months at a time for a better overview.
    - **Quarter Switch:** Quickly jump between Q1, Q2, Q3, and Q4.
    - **Yearly Toggle:** Navigate between years easily.
    - **"Today" Button:** Instantly jump back to the current date and quarter.
    - **Mobile Optimization:** Automatically switches to a clean single-month view on mobile devices with dedicated navigation.
- **Smart Interaction:**
    - **Interactive Tooltips:** Hover over any day, week number, month title, or year to see note previews.
    - **Selection Menu:** If multiple notes exist on the same day, a menu appears allowing you to choose which one to open.
    - **Click Navigation:** Direct click support for Daily, Weekly, Monthly, and Annual notes.
    - **State Persistence:** Remembers your last selected mode (Calendar vs. KB) even after you close Obsidian.
- **Visual Polish:**
    - **Adaptive Legend:** Shows activity levels dynamically based on the current mode.
    - **Unified Styling:** Consistent highlighting for all note types with centered text and polished visuals.
    - **High Readability:** Optimized font sizes and cell spacing for both desktop and mobile.

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
    // Path to your Calendar Notes folders
    dailyNotesPath: '"Calendar Notes/Daily Notes"', 
    weeklyNotesPath: '"Calendar Notes/Weekly Notes"',
    monthlyNotesPath: '"Calendar Notes/Monthly Notes"',
    annualNotesPath: '"Calendar Notes/Annual Notes"',
    
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
3. File name (if formatted as `YYYY-MM-DD` for daily notes).
4. File creation date (cday) as a fallback.

### Note Types Support
- **Daily Notes:** Highlighted on the specific day.
- **Weekly Notes:** Highlighted on the Week Number column.
- **Monthly Notes:** Highlighted on the Month Title.
- **Annual Notes:** Highlighted on the Year display.

## Customization

### Themes
You can modify the `STYLES` object to change the background, text, or accent colors. The `dailyColors` and `kbColors` arrays control the 5-level intensity gradient for each mode.

### Persistent Settings
The script uses `localStorage` to save your `mode` selection. To reset it, simply switch modes using the UI buttons, and it will remember that state for your next session.
