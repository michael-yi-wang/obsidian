const container = this.container;
container.textContent = "";

// --- Configuration ---
const CONFIG = {
    dailyNotesPath: '"Calendar Notes/Daily Notes"',
    kbPath:         '"Notes/Knowledge Base"',
    cellSize: 20,
    cellGap: 4,
    // Blue palette for Daily Notes
    dailyColors: ["#161b22", "#1565c0", "#2196f3", "#64b5f6"],
    // Green palette for Knowledge Base
    kbColors:    ["#161b22", "#2e9e3c", "#43d659", "#8eeaa0"],
    thresholds:  [0, 1, 2, 3],
};

// --- State ---
let state = {
    year: parseInt(localStorage.getItem("gsh-year")) || moment().year(),
};

// --- CSS injection (always update so changes take effect on re-render) ---
const cssId = "gsh-styles";
let styleEl = document.getElementById(cssId);
if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = cssId;
    document.head.appendChild(styleEl);
}
styleEl.textContent = `
    .gsh-wrapper {
        background: #0d1117;
        border-radius: 12px;
        padding: 24px;
        font-family: var(--font-interface);
        color: #e6edf3;
        border: 1px solid #21262d;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0 auto;
    }
    .gsh-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
    }
    .gsh-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #39d353;
        letter-spacing: 0.04em;
    }
    .gsh-nav-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .gsh-nav-btn {
        background: #21262d;
        border: 1px solid #30363d;
        color: #8b949e;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        line-height: 1;
        padding: 0;
        transition: background 0.2s, color 0.2s;
    }
    .gsh-nav-btn:hover { background: #30363d; color: #e6edf3; }
    .gsh-year-display {
        font-size: 1.4rem;
        font-weight: 700;
        color: #e6edf3;
        min-width: 56px;
        text-align: center;
    }
    .gsh-today-btn {
        background: #21262d;
        border: 1px solid #30363d;
        color: #8b949e;
        padding: 0 12px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 600;
        transition: background 0.2s, color 0.2s;
    }
    .gsh-today-btn:hover { background: #30363d; color: #e6edf3; }
    .gsh-heatmap-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: 4px;
        text-align: center;
    }
    .gsh-heatmap-inner {
        display: inline-flex;
        flex-direction: column;
        text-align: left;
    }
    .gsh-month-row { display: flex; }
    .gsh-month-label {
        font-size: 11px;
        color: #8b949e;
        font-weight: 600;
        position: absolute;
        top: 2px;
    }
    .gsh-cells-row {
        display: flex;
        flex-direction: row;
    }
    .gsh-weekday-col {
        display: flex;
        flex-direction: column;
        margin-right: 8px;
    }
    .gsh-weekday-label {
        font-size: 11px;
        color: #8b949e;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 4px;
    }
    .gsh-weeks { display: flex; flex-direction: row; }
    .gsh-week-col { display: flex; flex-direction: column; }
    .gsh-cell {
        border-radius: 3px;
        box-sizing: border-box;
        transition: transform 0.1s, filter 0.1s;
    }
    .gsh-cell.gsh-active { cursor: pointer; }
    .gsh-cell.gsh-active:hover {
        transform: scale(1.5);
        z-index: 2;
        filter: brightness(1.35);
        outline: 1px solid rgba(255, 255, 255, 0.45);
    }
    .gsh-cell.gsh-today {
        outline: 1.5px solid #ffffff;
        outline-offset: 1px;
    }
    .gsh-stats {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 24px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #21262d;
    }
    .gsh-stat-item { display: flex; flex-direction: column; }
    .gsh-stat-value {
        font-size: 1.35rem;
        font-weight: 700;
        color: #8b949e;
        line-height: 1.2;
    }
    .gsh-stat-value-daily {
        font-size: 1.35rem;
        font-weight: 700;
        color: #58a6ff;
        line-height: 1.2;
    }
    .gsh-stat-value-kb {
        font-size: 1.35rem;
        font-weight: 700;
        color: #39d353;
        line-height: 1.2;
    }
    .gsh-stat-label {
        font-size: 0.78rem;
        color: #8b949e;
        margin-top: 2px;
    }
    .gsh-legend {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        margin-top: 14px;
        font-size: 11px;
        color: #8b949e;
    }
    .gsh-legend-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .gsh-legend-label {
        min-width: 100px;
        font-size: 11px;
    }
    .gsh-legend-label.daily { color: #58a6ff; }
    .gsh-legend-label.kb    { color: #39d353; }
    .gsh-legend-box { width: 13px; height: 13px; border-radius: 3px; flex-shrink: 0; }
    .gsh-tooltip {
        position: fixed;
        background: #161b22;
        border: 1px solid #30363d;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 0.82rem;
        color: #e6edf3;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        pointer-events: none;
        display: none;
        min-width: 150px;
        max-width: 280px;
    }
    .gsh-tooltip-date {
        font-weight: 700;
        color: #e6edf3;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1px solid #21262d;
    }
    .gsh-tooltip-section { margin-top: 6px; }
    .gsh-tooltip-section-label {
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 2px;
    }
    .gsh-tooltip-section-label.daily { color: #58a6ff; }
    .gsh-tooltip-section-label.kb    { color: #39d353; }
    .gsh-tooltip-count { font-weight: 600; margin-bottom: 2px; }
    .gsh-tooltip-count.daily { color: #58a6ff; }
    .gsh-tooltip-count.kb    { color: #39d353; }
    .gsh-tooltip-note {
        color: #8b949e;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
    }
    .gsh-selection-menu {
        position: fixed;
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 8px;
        z-index: 20000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        display: none;
        min-width: 200px;
        max-width: 360px;
    }
    .gsh-selection-header {
        font-weight: 700;
        color: #e6edf3;
        padding: 6px 10px 8px;
        border-bottom: 1px solid #21262d;
        margin-bottom: 4px;
        font-size: 0.82rem;
    }
    .gsh-selection-category {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 6px 10px 2px;
    }
    .gsh-selection-category.daily { color: #58a6ff; }
    .gsh-selection-category.kb    { color: #39d353; }
    .gsh-selection-item {
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s;
        font-size: 0.82rem;
        color: #e6edf3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .gsh-selection-item:hover { background: #21262d; }
`;

// --- Helpers ---
function el(tag, cls, styles) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (styles) Object.assign(e.style, styles);
    return e;
}

function txt(tag, cls, text, styles) {
    const e = el(tag, cls, styles);
    e.textContent = text;
    return e;
}

// --- Data ---
function extractDate(p, year) {
    let d;
    // Try created frontmatter first
    if (p.created) {
        try {
            if (moment.isMoment(p.created)) d = p.created.clone();
            else if (typeof p.created.toJSDate === "function") d = moment(p.created.toJSDate());
            else d = moment(p.created);
        } catch(e) { d = null; }
    }
    // Fall back to file.day (DataView sets this for date-named files like 2025-01-15.md)
    if (!d || !d.isValid()) {
        try {
            if (p.file && p.file.day) {
                d = moment(p.file.day.toJSDate ? p.file.day.toJSDate() : p.file.day);
            }
        } catch(e) { d = null; }
    }
    if (!d || !d.isValid() || d.year() !== year) return null;
    return d.format("YYYY-MM-DD");
}

function getData(year) {
    const map = {};

    function ensure(key) {
        if (!map[key]) map[key] = { daily: [], kb: [] };
    }

    try {
        dv.pages(CONFIG.dailyNotesPath).forEach(p => {
            const key = extractDate(p, year);
            if (!key) return;
            ensure(key);
            map[key].daily.push({ file: p.file.path, title: p.file.name });
        });
    } catch(e) {}

    try {
        dv.pages(CONFIG.kbPath).forEach(p => {
            const key = extractDate(p, year);
            if (!key) return;
            ensure(key);
            map[key].kb.push({ file: p.file.path, title: p.file.name });
        });
    } catch(e) {}

    return map;
}

function getColorIndex(count) {
    if (count === 0) return 0;
    for (let i = CONFIG.thresholds.length - 1; i >= 1; i--) {
        if (count >= CONFIG.thresholds[i]) return i;
    }
    return 1;
}

function getCellBackground(dailyCount, kbCount, inYear) {
    if (!inYear) return CONFIG.dailyColors[0];
    const dIdx = getColorIndex(dailyCount);
    const kIdx = getColorIndex(kbCount);
    if (dailyCount > 0 && kbCount > 0) {
        // Diagonal split: top-left = daily (blue), bottom-right = KB (green)
        return `linear-gradient(135deg, ${CONFIG.dailyColors[dIdx]} 50%, ${CONFIG.kbColors[kIdx]} 50%)`;
    }
    if (dailyCount > 0) return CONFIG.dailyColors[dIdx];
    if (kbCount > 0)    return CONFIG.kbColors[kIdx];
    return CONFIG.dailyColors[0]; // empty
}

function calcStats(data, year) {
    const jan1 = moment({ year, month: 0, day: 1 });
    const daysInYear = moment({ year }).isLeapYear() ? 366 : 365;
    let totalDaily = 0, totalKB = 0, activeDays = 0, maxDay = 0, maxStreak = 0, curStreak = 0;

    for (let i = 0; i < daysInYear; i++) {
        const dateStr = jan1.clone().add(i, "days").format("YYYY-MM-DD");
        const entry = data[dateStr];
        const dc = entry ? entry.daily.length : 0;
        const kc = entry ? entry.kb.length    : 0;
        const total = dc + kc;
        totalDaily += dc;
        totalKB    += kc;
        if (total > 0) {
            activeDays++;
            maxDay = Math.max(maxDay, total);
            curStreak++;
            maxStreak = Math.max(maxStreak, curStreak);
        } else {
            curStreak = 0;
        }
    }

    let currentStreak = 0;
    const today = moment();
    if (today.year() === year) {
        for (let i = 0; i <= today.dayOfYear() - 1; i++) {
            const dateStr = today.clone().subtract(i, "days").format("YYYY-MM-DD");
            const entry = data[dateStr];
            const total = entry ? (entry.daily.length + entry.kb.length) : 0;
            if (total > 0) currentStreak++;
            else break;
        }
    }

    return { totalDaily, totalKB, activeDays, maxStreak, currentStreak, maxDay };
}

// --- Render ---
function render() {
    container.textContent = "";
    const wrapper = el("div", "gsh-wrapper");
    container.appendChild(wrapper);

    // Header
    const header = el("div", "gsh-header");
    header.appendChild(txt("div", "gsh-title", "Notes Heatmap"));

    const navGroup = el("div", "gsh-nav-group");

    const prevBtn = el("button", "gsh-nav-btn");
    prevBtn.textContent = "‹";
    prevBtn.onclick = () => { state.year--; localStorage.setItem("gsh-year", state.year); render(); };

    const yearDisplay = txt("div", "gsh-year-display", String(state.year));

    const nextBtn = el("button", "gsh-nav-btn");
    nextBtn.textContent = "›";
    nextBtn.onclick = () => { state.year++; localStorage.setItem("gsh-year", state.year); render(); };

    const todayBtn = el("button", "gsh-today-btn");
    todayBtn.textContent = "Today";
    todayBtn.onclick = () => { state.year = moment().year(); localStorage.setItem("gsh-year", state.year); render(); };

    navGroup.append(prevBtn, yearDisplay, nextBtn, todayBtn);
    header.appendChild(navGroup);
    wrapper.appendChild(header);

    // Grid geometry
    const CELL = CONFIG.cellSize;
    const GAP  = CONFIG.cellGap;
    const STEP = CELL + GAP;
    const WEEKDAY_COL_W = 36;
    const MONTH_ROW_H   = 22;

    const year = state.year;
    const gridStart = moment({ year, month: 0,  day: 1 }).startOf("week");
    const gridEnd   = moment({ year, month: 11, day: 31 }).endOf("week");
    const totalWeeks = Math.ceil((gridEnd.diff(gridStart, "days") + 1) / 7);
    const todayStr  = moment().format("YYYY-MM-DD");
    const data      = getData(year);
    const stats     = calcStats(data, year);

    // ── Heatmap ──────────────────────────────────────────────────────────
    const scrollEl = el("div", "gsh-heatmap-scroll");
    const inner    = el("div", "gsh-heatmap-inner");

    // Month labels
    const monthRowEl    = el("div", "gsh-month-row", { paddingLeft: WEEKDAY_COL_W + "px" });
    const monthRowInner = el("div", null, {
        position: "relative",
        height:   MONTH_ROW_H + "px",
        width:    (totalWeeks * STEP) + "px",
    });

    for (let m = 0; m < 12; m++) {
        const mStart     = moment({ year, month: m, day: 1 });
        const weekOffset = Math.floor(mStart.diff(gridStart, "days") / 7);
        const lbl        = txt("div", "gsh-month-label", mStart.format("MMM"), { left: (weekOffset * STEP) + "px" });
        monthRowInner.appendChild(lbl);
    }
    monthRowEl.appendChild(monthRowInner);
    inner.appendChild(monthRowEl);

    // Weekday labels + week columns
    const cellsRow = el("div", "gsh-cells-row");

    const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const SHOW_LABEL    = [false, true, false, true, false, true, false];

    const weekdayCol = el("div", "gsh-weekday-col", { width: WEEKDAY_COL_W + "px" });
    for (let d = 0; d < 7; d++) {
        const lbl = txt("div", "gsh-weekday-label",
            SHOW_LABEL[d] ? WEEKDAY_NAMES[d] : "",
            { height: STEP + "px", lineHeight: CELL + "px" }
        );
        weekdayCol.appendChild(lbl);
    }
    cellsRow.appendChild(weekdayCol);

    const weeksEl = el("div", "gsh-weeks");

    for (let w = 0; w < totalWeeks; w++) {
        const weekCol = el("div", "gsh-week-col", { marginRight: GAP + "px" });

        for (let d = 0; d < 7; d++) {
            const date         = gridStart.clone().add(w * 7 + d, "days");
            const dateStr      = date.format("YYYY-MM-DD");
            const inYear       = date.year() === year;
            const entry        = inYear ? (data[dateStr] || { daily: [], kb: [] }) : { daily: [], kb: [] };
            const dailyEntries = entry.daily;
            const kbEntries    = entry.kb;
            const dailyCount   = dailyEntries.length;
            const kbCount      = kbEntries.length;
            const totalCount   = dailyCount + kbCount;
            const bg           = getCellBackground(dailyCount, kbCount, inYear);

            const cellStyle = {
                width:        CELL + "px",
                height:       CELL + "px",
                marginBottom: GAP  + "px",
                opacity:      inYear ? "1" : "0.18",
            };
            // linear-gradient must use background, not backgroundColor
            if (bg.startsWith("linear-gradient")) cellStyle.background = bg;
            else cellStyle.backgroundColor = bg;

            const cell = el("div", "gsh-cell", cellStyle);

            if (dateStr === todayStr) cell.classList.add("gsh-today");

            if (inYear) {
                if (totalCount > 0) {
                    cell.classList.add("gsh-active");
                    cell.onmouseenter = (e) => showTooltip(e, dailyEntries, kbEntries, date.format("MMM D, YYYY"));
                    cell.onmouseleave = hideTooltip;
                    cell.onclick = (e) => {
                        e.stopPropagation();
                        hideTooltip();
                        const allEntries = [...dailyEntries, ...kbEntries];
                        if (allEntries.length === 1) app.workspace.openLinkText(allEntries[0].file, "/", false);
                        else showSelectionMenu(e, dailyEntries, kbEntries, date.format("MMM D, YYYY"));
                    };
                } else {
                    cell.onmouseenter = (e) => showTooltip(e, [], [], date.format("MMM D, YYYY"));
                    cell.onmouseleave = hideTooltip;
                }
            }

            weekCol.appendChild(cell);
        }
        weeksEl.appendChild(weekCol);
    }

    cellsRow.appendChild(weeksEl);
    inner.appendChild(cellsRow);
    scrollEl.appendChild(inner);
    wrapper.appendChild(scrollEl);

    // ── Stats bar ─────────────────────────────────────────────────────────
    const statsBar = el("div", "gsh-stats");
    const statItems = [
        { label: "Daily Notes",    value: String(stats.totalDaily),   cls: "gsh-stat-value-daily" },
        { label: "KB Notes",       value: String(stats.totalKB),       cls: "gsh-stat-value-kb" },
        { label: "Active Days",    value: String(stats.activeDays),    cls: "gsh-stat-value" },
        { label: "Longest Streak", value: stats.maxStreak + "d",       cls: "gsh-stat-value" },
        { label: "Current Streak", value: stats.currentStreak + "d",   cls: "gsh-stat-value" },
        { label: "Best Day",       value: stats.maxDay > 0 ? stats.maxDay + (stats.maxDay === 1 ? " note" : " notes") : "—", cls: "gsh-stat-value" },
    ];

    statItems.forEach(item => {
        const statEl = el("div", "gsh-stat-item");
        statEl.appendChild(txt("span", item.cls, item.value));
        statEl.appendChild(txt("span", "gsh-stat-label", item.label));
        statsBar.appendChild(statEl);
    });
    wrapper.appendChild(statsBar);

    // ── Legend ────────────────────────────────────────────────────────────
    const legend = el("div", "gsh-legend");

    function makeLegendRow(label, labelCls, colors) {
        const row = el("div", "gsh-legend-row");
        row.appendChild(txt("span", "gsh-legend-label " + labelCls, label));
        row.appendChild(txt("span", null, "Less"));
        colors.forEach((color, i) => {
            const box = el("div", "gsh-legend-box", { backgroundColor: color });
            const tip = i === 0 ? "No notes"
                : i === CONFIG.thresholds.length - 1 ? CONFIG.thresholds[i] + "+ notes"
                : CONFIG.thresholds[i] + "–" + (CONFIG.thresholds[i + 1] - 1) + " notes";
            box.title = tip;
            row.appendChild(box);
        });
        row.appendChild(txt("span", null, "More"));
        return row;
    }

    legend.appendChild(makeLegendRow("Daily Notes",    "daily", CONFIG.dailyColors));
    legend.appendChild(makeLegendRow("Knowledge Base", "kb",    CONFIG.kbColors));
    wrapper.appendChild(legend);

    initTooltip();
    initSelectionMenu();
}

// --- Tooltip ---
function initTooltip() {
    if (!document.getElementById("gsh-tooltip")) {
        const t = el("div", "gsh-tooltip");
        t.id = "gsh-tooltip";
        document.body.appendChild(t);
    }
}

function showTooltip(e, dailyEntries, kbEntries, dateLabel) {
    const t = document.getElementById("gsh-tooltip");
    if (!t) return;
    t.textContent = "";

    t.appendChild(txt("div", "gsh-tooltip-date", dateLabel));

    const totalCount = dailyEntries.length + kbEntries.length;
    if (totalCount === 0) {
        t.appendChild(txt("div", "gsh-tooltip-note", "No notes created"));
    } else {
        if (dailyEntries.length > 0) {
            const sec = el("div", "gsh-tooltip-section");
            sec.appendChild(txt("div", "gsh-tooltip-section-label daily", "Daily Notes"));
            sec.appendChild(txt("div", "gsh-tooltip-count daily", dailyEntries.length + " note" + (dailyEntries.length > 1 ? "s" : "")));
            dailyEntries.slice(0, 3).forEach(entry => sec.appendChild(txt("div", "gsh-tooltip-note", "• " + entry.title)));
            if (dailyEntries.length > 3) {
                const more = txt("div", "gsh-tooltip-note", "+" + (dailyEntries.length - 3) + " more…");
                more.style.color = "#58a6ff";
                sec.appendChild(more);
            }
            t.appendChild(sec);
        }
        if (kbEntries.length > 0) {
            const sec = el("div", "gsh-tooltip-section");
            sec.appendChild(txt("div", "gsh-tooltip-section-label kb", "Knowledge Base"));
            sec.appendChild(txt("div", "gsh-tooltip-count kb", kbEntries.length + " note" + (kbEntries.length > 1 ? "s" : "")));
            kbEntries.slice(0, 3).forEach(entry => sec.appendChild(txt("div", "gsh-tooltip-note", "• " + entry.title)));
            if (kbEntries.length > 3) {
                const more = txt("div", "gsh-tooltip-note", "+" + (kbEntries.length - 3) + " more…");
                more.style.color = "#39d353";
                sec.appendChild(more);
            }
            t.appendChild(sec);
        }
    }

    t.style.display = "block";
    const rect = e.target.getBoundingClientRect();
    let top  = rect.top - t.offsetHeight - 10;
    let left = rect.left - (t.offsetWidth / 2) + (rect.width / 2);
    if (top < 10)  top  = rect.bottom + 10;
    if (left < 10) left = 10;
    if (left + t.offsetWidth > window.innerWidth - 10) left = window.innerWidth - t.offsetWidth - 10;
    t.style.top  = top  + "px";
    t.style.left = left + "px";
}

function hideTooltip() {
    const t = document.getElementById("gsh-tooltip");
    if (t) t.style.display = "none";
}

// --- Selection menu ---
function initSelectionMenu() {
    if (!document.getElementById("gsh-selection-menu")) {
        const m = el("div", "gsh-selection-menu");
        m.id = "gsh-selection-menu";
        document.body.appendChild(m);
    }
}

function showSelectionMenu(e, dailyEntries, kbEntries, dateLabel) {
    const m = document.getElementById("gsh-selection-menu");
    if (!m) return;
    hideTooltip();
    m.textContent = "";

    const totalCount = dailyEntries.length + kbEntries.length;
    m.appendChild(txt("div", "gsh-selection-header", dateLabel + " — " + totalCount + " notes"));

    if (dailyEntries.length > 0) {
        m.appendChild(txt("div", "gsh-selection-category daily", "Daily Notes"));
        dailyEntries.forEach(entry => {
            const item = txt("div", "gsh-selection-item", entry.title);
            item.onclick = (evt) => {
                evt.stopPropagation();
                app.workspace.openLinkText(entry.file, "/", false);
                m.style.display = "none";
            };
            m.appendChild(item);
        });
    }

    if (kbEntries.length > 0) {
        m.appendChild(txt("div", "gsh-selection-category kb", "Knowledge Base"));
        kbEntries.forEach(entry => {
            const item = txt("div", "gsh-selection-item", entry.title);
            item.onclick = (evt) => {
                evt.stopPropagation();
                app.workspace.openLinkText(entry.file, "/", false);
                m.style.display = "none";
            };
            m.appendChild(item);
        });
    }

    m.style.display = "block";
    const rect = e.target.getBoundingClientRect();
    let top  = rect.bottom + 5;
    let left = rect.left;
    if (top  + m.offsetHeight > window.innerHeight)     top  = rect.top - m.offsetHeight - 5;
    if (left + m.offsetWidth  > window.innerWidth - 10) left = window.innerWidth - m.offsetWidth - 10;
    m.style.top  = top  + "px";
    m.style.left = left + "px";

    const closeHandler = (evt) => {
        if (!m.contains(evt.target)) {
            m.style.display = "none";
            document.removeEventListener("click", closeHandler);
        }
    };
    setTimeout(() => document.addEventListener("click", closeHandler), 0);
}

render();
