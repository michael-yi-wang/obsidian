const container = this.container;
container.innerHTML = "";

// --- Configuration ---
const CONFIG = {
    dailyNotesPath: '"Calendar Notes/Daily Notes"', // Target your Daily Notes folder
    weeklyNotesPath: '"Calendar Notes/Weekly Notes"',
    monthlyNotesPath: '"Calendar Notes/Monthly Notes"',
    annualNotesPath: '"Calendar Notes/Annual Notes"',
    kbPath: '"Notes/Knowledge Base"', // Target your Knowledge Base folder; set to null to exclude Daily Notes
    cellBoxSize: 26, // Increased from 22 for better readability
    cellGap: 2,      // Reduced gap between cells
};

// --- State ---
const savedMode = localStorage.getItem("chm-active-mode") || "daily";
let state = {
    year: moment().year(),
    quarter: moment().quarter(),
    month: moment().month(), 
    mode: savedMode 
};

// --- Theme & Styles ---
const STYLES = {
    bg: "#1e1e2e", 
    text: "#c0caf5",
    accent: "#7aa2f7",
    
    dailyColors: ["rgba(255, 255, 255, 0.05)", "#0f4b3e", "#10b981", "#059669", "#34d399"],
    kbColors: ["rgba(255, 255, 255, 0.05)", "#1e3a8a", "#3b82f6", "#2563eb", "#60a5fa"]
};

// Inject Custom CSS
const cssId = "calendar-heatmap-styles";
if (!document.getElementById(cssId)) {
    const style = document.createElement("style");
    style.id = cssId;
    style.innerHTML = `
        .chm-wrapper {
            background: ${STYLES.bg};
            border-radius: 12px;
            padding: 20px;
            font-family: var(--font-interface);
            color: ${STYLES.text};
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            border: 1px solid rgba(255,255,255,0.08);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        
        .chm-header {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            margin-bottom: 20px;
            gap: 16px;
        }

        .chm-title-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: nowrap;
            justify-content: center;
            grid-column: 2;
        }

        .chm-mode-switch {
            display: flex;
            background: rgba(0,0,0,0.3);
            padding: 4px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.05);
            grid-column: 1;
            justify-self: start;
        }

        @media (max-width: 600px) {
            .chm-header {
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .chm-mode-switch {
                justify-self: center;
                width: 100%;
                justify-content: center;
            }
        }
        
        .chm-btn {
            background: transparent;
            border: none;
            color: #787c99;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 1rem;
            font-weight: 600;
        }
        .chm-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .chm-btn.active { background: #3b4261; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

        .chm-year-display, .chm-month-display {
            font-size: 1.6rem;
            font-weight: 700;
            color: #fff;
            min-width: 50px;
            text-align: center;
        }
        .chm-month-display { min-width: 75px; }

        .chm-nav-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: #a9b1d6;
            min-width: 36px;
            height: 36px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
            font-size: 1.3rem;
            padding: 0;
            line-height: 1;
        }
        .chm-nav-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }

        .chm-today-btn {
            padding: 0 14px;
            width: auto;
            min-width: 75px;
            font-size: 0.95rem;
            font-weight: 700;
            white-space: nowrap;
        }

        /* Responsive Grid Layout */
        .chm-main-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 12px; /* Reduced gap between months */
            width: 100%;
            justify-items: center;
            flex-grow: 1;
        }

        .chm-month-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 250px; /* Adjusted for larger cells */
            width: 100%;
        }

        .chm-month-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #a9b1d6;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            height: 24px;
        }

        .chm-month-grid {
            display: grid;
            grid-template-columns: 32px repeat(7, ${CONFIG.cellBoxSize}px);
            grid-template-rows: auto repeat(6, ${CONFIG.cellBoxSize}px); 
            gap: ${CONFIG.cellGap}px;
        }

        .chm-cell {
            width: ${CONFIG.cellBoxSize}px;
            height: ${CONFIG.cellBoxSize}px;
            border-radius: 4px;
            font-size: 12px; /* Larger font */
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.3);
            font-weight: 700;
            user-select: none;
            box-sizing: border-box;
        }

        .chm-cell.active { color: #fff; cursor: pointer; }
        .chm-cell.active:hover { transform: scale(1.25); z-index: 2; box-shadow: 0 4px 8px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.5); }
        .chm-cell.today { border: 2px solid ${STYLES.accent}; box-shadow: 0 0 6px ${STYLES.accent}40; }

        .chm-header-cell {
            width: ${CONFIG.cellBoxSize}px;
            font-size: 12px;
            text-align: center;
            color: #565f89;
            font-weight: 800;
            margin-bottom: 6px;
        }
        
        .chm-week-col {
            font-size: 11px;
            color: #414868;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            width: 100%;
            box-sizing: border-box;
        }

        .chm-tooltip {
            position: fixed;
            background: #16161e;
            border: 1px solid #2f354b;
            padding: 12px;
            border-radius: 8px;
            font-size: 1rem;
            color: #fff;
            z-index: 10000;
            box-shadow: 0 8px 16px rgba(0,0,0,0.5);
            pointer-events: none;
            display: none;
            min-width: 160px;
        }

        .chm-legend {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 20px; 
            gap: 16px;
            font-size: 1rem;
            color: #787c99;
        }
        .chm-legend-box { width: 16px; height: 16px; border-radius: 4px; }
        .chm-legend-item { display: flex; align-items: center; gap: 8px; }

        .chm-selection-menu {
            position: fixed;
            background: #16161e;
            border: 1px solid #2f354b;
            border-radius: 8px;
            padding: 12px;
            z-index: 20000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            display: none;
            min-width: 200px;
            max-width: 350px;
        }
        .chm-selection-item {
            padding: 10px 14px;
            border-radius: 6px;
            cursor: pointer;
            transition: 0.2s;
            font-size: 1rem;
            color: #c0caf5;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
        }
        .chm-selection-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .chm-selection-item:last-child { margin-bottom: 0; }

        .chm-has-note {
            background-color: var(--chm-note-bg) !important;
            color: #fff !important;
            cursor: pointer;
            box-shadow: 0 0 8px var(--chm-note-shadow);
            border-radius: 4px;
            padding: 2px 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: max-content;
            transition: transform 0.2s;
            box-sizing: border-box;
        }
        .chm-has-note:hover {
            transform: scale(1.1);
            z-index: 10;
            filter: brightness(1.2);
        }
    `;
    document.head.appendChild(style);
}

// --- Data Logic ---
function getData(year, mode) {
    let result = { daily: {}, weekly: {}, monthly: {}, annual: null };
    
    // Helper to parse dates safely
    const toMoment = (date) => {
        if (!date) return null;
        if (moment.isMoment(date)) return date;
        if (date.toJSDate) return moment(date.toJSDate()); // Handle Luxon/Dataview
        return moment(date);
    };

    // Helper to process pages
    const processPages = (path, format, targetObj, keyFn) => {
        let pages;
        try { pages = dv.pages(path); } catch (e) { return; }
        pages.forEach(p => {
            const d = moment(p.file.name, format, true);
            if (d.isValid() && d.year() === year) {
                const key = keyFn(d);
                if (key !== null) targetObj[key] = p.file.path;
            }
        });
    };

    if (mode === 'daily') {
        // Daily Notes
        let pages;
        try { pages = dv.pages(CONFIG.dailyNotesPath); } catch (e) {}
        if (pages) {
            pages.forEach(p => {
                let d = moment(p.file.name, "YYYY-MM-DD", true);
                if (!d.isValid() && p.date) d = toMoment(p.date);
                
                if (d && d.isValid() && d.year() === year) {
                    const key = d.format("YYYY-MM-DD");
                    if (!result.daily[key]) result.daily[key] = [];
                    result.daily[key].push({ file: p.file.path, title: p.file.name, date: key });
                }
            });
        }

        // Weekly Notes (Key: Week Number)
        processPages(CONFIG.weeklyNotesPath, ["YYYY-[W]WW", "gggg-[W]ww"], result.weekly, d => d.week());

        // Monthly Notes (Key: Month Index 0-11)
        processPages(CONFIG.monthlyNotesPath, "YYYY-MM", result.monthly, d => d.month());

        // Annual Note
        try { 
            const annualPages = dv.pages(CONFIG.annualNotesPath);
            annualPages.forEach(p => {
                if (p.file.name === String(year)) result.annual = p.file.path;
            });
        } catch (e) {}

    } else {
        // Knowledge Base
        let path = CONFIG.kbPath ? CONFIG.kbPath : `-"${CONFIG.dailyNotesPath.replace(/"/g, '')}"`;
        let pages;
        try { pages = dv.pages(path); } catch (e) { return result; }
        pages.forEach(p => {
            let d = p.created ? toMoment(p.created) : (p.date ? toMoment(p.date) : toMoment(p.file.cday));
            if (d && d.isValid() && d.year() === year) {
                const key = d.format("YYYY-MM-DD");
                if (!result.daily[key]) result.daily[key] = [];
                result.daily[key].push({ file: p.file.path, title: p.file.name, date: key });
            }
        });
    }
    return result;
}

// --- Rendering ---
function render() {
    const isMobile = app.isMobile;
    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "chm-wrapper";
    wrapper.style.minHeight = isMobile ? "auto" : "auto"; 
    container.appendChild(wrapper);

    const header = document.createElement("div");
    header.className = "chm-header";

    const modeSwitch = document.createElement("div");
    modeSwitch.className = "chm-mode-switch";
    const createBtn = (id, label) => {
        const btn = document.createElement("button");
        btn.className = `chm-btn ${state.mode === id ? 'active' : ''}`;
        btn.textContent = label;
        btn.onclick = () => { state.mode = id; localStorage.setItem("chm-active-mode", id); render(); };
        return btn;
    };
    modeSwitch.appendChild(createBtn('daily', '📅 Calendar Notes')); 
    modeSwitch.appendChild(createBtn('kb', '🧠 Knowledge Base'));

    const navGroup = document.createElement("div");
    navGroup.className = "chm-title-group";
    
    // Data Fetching
    const allData = getData(state.year, state.mode);
    const dailyData = allData.daily;
    const colors = state.mode === 'daily' ? STYLES.dailyColors : STYLES.kbColors;

    // Set Dynamic Theme Colors
    const primaryNoteColor = colors[2]; // Use index 2 as the baseline "Note Exists" color
    wrapper.style.setProperty('--chm-note-bg', primaryNoteColor);
    wrapper.style.setProperty('--chm-note-shadow', primaryNoteColor + "40");

    const addControls = (label, currentVal, onPrev, onNext, notePath = null) => {
        const prevBtn = document.createElement("button");
        prevBtn.className = "chm-nav-btn";
        prevBtn.innerHTML = "‹";
        prevBtn.onclick = onPrev;
        
        const display = document.createElement("div");
        display.className = label === 'year' ? "chm-year-display" : "chm-month-display";
        display.textContent = currentVal;
        
        // Annual Note Highlighting & Tooltip
        if (notePath) {
            display.classList.add("chm-has-note");
            display.onclick = (e) => { 
                e.stopPropagation(); 
                hideTooltip(); 
                app.workspace.openLinkText(notePath, "/", false); 
            };
            display.onmouseenter = (e) => showTooltip(e, notePath, "Annual Note: " + currentVal);
            display.onmouseleave = hideTooltip;
        }

        const nextBtn = document.createElement("button");
        nextBtn.className = "chm-nav-btn";
        nextBtn.innerHTML = "›";
        nextBtn.onclick = onNext;
        
        navGroup.appendChild(prevBtn);
        navGroup.appendChild(display);
        navGroup.appendChild(nextBtn);
    };

    // Navigation Logic
    if (isMobile) {
        // Mobile: Month-by-Month Navigation
        addControls('month', moment().month(state.month).format("MMM YYYY"), 
            () => { 
                state.month--; 
                if (state.month < 0) { state.month = 11; state.year--; } 
                render(); 
            }, 
            () => { 
                state.month++; 
                if (state.month > 11) { state.month = 0; state.year++; } 
                render(); 
            }
        );
    } else {
        // Desktop: Year & Quarter Navigation
        addControls('year', state.year, 
            () => { state.year--; render(); }, 
            () => { state.year++; render(); },
            allData.annual
        );

        addControls('month', "Q" + state.quarter, 
            () => { 
                state.quarter--; 
                if (state.quarter < 1) { state.quarter = 4; state.year--; }
                render(); 
            }, 
            () => { 
                state.quarter++; 
                if (state.quarter > 4) { state.quarter = 1; state.year++; }
                render(); 
            }
        );
    }

    const todayBtn = document.createElement("button");
    todayBtn.className = "chm-nav-btn chm-today-btn";
    todayBtn.innerHTML = "Today";
    todayBtn.onclick = () => { 
        state.year = moment().year(); 
        state.quarter = moment().quarter(); 
        state.month = moment().month(); 
        render(); 
    };
    navGroup.appendChild(todayBtn);

    header.appendChild(modeSwitch);
    header.appendChild(navGroup);
    wrapper.appendChild(header);

    const subHeader = document.createElement("div");
    subHeader.style.textAlign = "center";
    subHeader.style.marginBottom = "20px";
    subHeader.style.fontSize = "1.3rem";
    subHeader.style.fontWeight = "bold";
    subHeader.style.color = state.mode === 'daily' ? "#34d399" : "#60a5fa";
    subHeader.textContent = state.mode === 'daily' ? "Calendar Notes Heatmap" : "Knowledge Base Heatmap"; 
    wrapper.appendChild(subHeader);

    const mainGrid = document.createElement("div");
    mainGrid.className = "chm-main-grid";
    if (isMobile) mainGrid.style.gridTemplateColumns = "1fr";

    // Calculate months for the current quarter
    const qStart = (state.quarter - 1) * 3;
    const monthsToRender = isMobile ? [state.month] : [qStart, qStart + 1, qStart + 2];

    monthsToRender.forEach(m => {
        const monthCard = document.createElement("div");
        monthCard.className = "chm-month-card";
        
        const title = document.createElement("div");
        title.className = "chm-month-title";
        title.textContent = moment().month(m).format("MMMM");
        
        // Monthly Note Highlighting & Tooltip
        if (allData.monthly && allData.monthly[m]) {
            title.classList.add("chm-has-note");
            title.onclick = (e) => { 
                e.stopPropagation(); 
                hideTooltip(); 
                app.workspace.openLinkText(allData.monthly[m], "/", false); 
            };
            title.onmouseenter = (e) => showTooltip(e, allData.monthly[m], "Monthly Note: " + title.textContent);
            title.onmouseleave = hideTooltip;
        }

        monthCard.appendChild(title);
        monthCard.appendChild(createMonth(state.year, m, allData, colors));
        mainGrid.appendChild(monthCard);
    });
    wrapper.appendChild(mainGrid);
    
    const totalEntries = Object.values(dailyData).reduce((acc, curr) => acc + curr.length, 0);
    const footer = document.createElement("div");
    footer.style.textAlign = "center";
    footer.style.marginTop = "25px";
    footer.style.color = "#565f89";
    footer.style.fontSize = "1rem";
    footer.innerHTML = `Total Entries: <b>${totalEntries}</b>`;
    wrapper.appendChild(footer);

    const legend = document.createElement("div");
    legend.className = "chm-legend";
    
    const createLegendItem = (color, label, isHighlight = false) => {
        const item = document.createElement("div");
        item.className = "chm-legend-item";
        const box = document.createElement("div");
        box.className = isHighlight ? "chm-has-note" : "chm-legend-box";
        if (!isHighlight) box.style.background = color;
        else {
            box.style.padding = "2px 8px";
            box.style.fontSize = "10px";
            box.textContent = "NOTE";
        }
        item.appendChild(box);
        const text = document.createElement("span");
        text.textContent = label;
        item.appendChild(text);
        return item;
    };

    if (state.mode === 'daily') {
        legend.appendChild(createLegendItem(colors[0], "Empty"));
        legend.appendChild(createLegendItem(colors[1], "Daily Heatmap"));
        legend.appendChild(createLegendItem(null, "W/M/Y Note", true));
    } else {
        const labelLess = document.createElement("span");
        labelLess.textContent = "Less";
        legend.appendChild(labelLess);
        colors.forEach(c => {
            const box = document.createElement("div");
            box.className = "chm-legend-box";
            box.style.background = c;
            legend.appendChild(box);
        });
        const labelMore = document.createElement("span");
        labelMore.textContent = "More";
        legend.appendChild(labelMore);
    }
    wrapper.appendChild(legend);

    initTooltip();
    initSelectionMenu();
}

function createMonth(year, month, allData, colors) {
    const dailyData = allData.daily;
    const weeklyData = allData.weekly;

    const start = moment({year, month, day: 1});
    const daysInMonth = start.daysInMonth();
    const startDay = start.day(); 
    const grid = document.createElement("div");
    grid.className = "chm-month-grid";
    grid.appendChild(document.createElement("div"));
    ["S","M","T","W","T","F","S"].forEach(d => {
        const h = document.createElement("div");
        h.className = "chm-header-cell";
        h.textContent = d;
        grid.appendChild(h);
    });

    const addWeekNum = (date, empty = false) => {
        const wk = document.createElement("div");
        wk.className = "chm-week-col";
        if (!empty && date) {
            const w = date.week();
            wk.textContent = "W" + (w < 10 ? "0" + w : w);
            
            // Weekly Note Highlighting & Tooltip
            if (weeklyData && weeklyData[w]) {
                wk.classList.add("chm-has-note");
                wk.onclick = (e) => { 
                    e.stopPropagation(); 
                    hideTooltip(); 
                    app.workspace.openLinkText(weeklyData[w], "/", false); 
                };
                wk.onmouseenter = (e) => showTooltip(e, weeklyData[w], "Weekly Note: Week " + w);
                wk.onmouseleave = hideTooltip;
            }
        }
        grid.appendChild(wk);
    };

    addWeekNum(start);
    for(let i=0; i<startDay; i++) grid.appendChild(document.createElement("div"));
    let cellCount = startDay;
    for(let d=1; d<=daysInMonth; d++) {
        const date = moment({year, month, day: d});
        const dateStr = date.format("YYYY-MM-DD");
        const entries = dailyData[dateStr] || [];
        const count = entries.length;
        const cell = document.createElement("div");
        cell.className = "chm-cell";
        cell.textContent = d;
        if (count > 0) {
            cell.classList.add("active");
            cell.style.backgroundColor = colors[Math.min(count, colors.length - 1)];
            cell.onmouseenter = (e) => showTooltip(e, entries, moment(dateStr).format("MMM D, YYYY"));
            cell.onmouseleave = hideTooltip;
            cell.onclick = (e) => {
                e.stopPropagation();
                hideTooltip();
                if (entries.length === 1) app.workspace.openLinkText(entries[0].file, "/", false);
                else showSelectionMenu(e, entries, dateStr);
            };
        } else cell.style.backgroundColor = colors[0];
        if (dateStr === moment().format("YYYY-MM-DD")) cell.classList.add("today");
        grid.appendChild(cell);
        cellCount++;
        if (date.day() === 6 && d < daysInMonth) addWeekNum(moment(date).add(1, 'day'));
    }
    while (cellCount < 42) {
        if (cellCount % 7 === 0) addWeekNum(null, true);
        grid.appendChild(document.createElement("div"));
        cellCount++;
    }
    return grid;
}

function initTooltip() {
    if (!document.getElementById("chm-tooltip")) {
        const t = document.createElement("div");
        t.id = "chm-tooltip";
        t.className = "chm-tooltip";
        document.body.appendChild(t);
    }
}

function initSelectionMenu() {
    if (!document.getElementById("chm-selection-menu")) {
        const m = document.createElement("div");
        m.id = "chm-selection-menu";
        m.className = "chm-selection-menu";
        document.body.appendChild(m);
    }
}

function showTooltip(e, entries, title) {
    const t = document.getElementById("chm-tooltip");
    if(!t) return;
    
    let content = "";
    if (Array.isArray(entries)) {
        // Daily Notes List
        content = `<div style="font-weight:800; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px; color:${STYLES.accent}">${title}</div>` +
                  entries.slice(0, 8).map(x => `<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px;">• ${x.title}</div>`).join("");
    } else {
        // Single Note (Weekly/Monthly/Annual)
        content = `<div style="font-weight:800; color:${STYLES.accent}">${title}</div>`;
    }

    t.innerHTML = content;
    t.style.display = "block";
    const rect = e.target.getBoundingClientRect();
    let top = rect.top - t.offsetHeight - 10;
    let left = rect.left - (t.offsetWidth / 2) + (rect.width / 2);
    if (top < 10) top = rect.bottom + 10;
    if (left < 10) left = 10;
    t.style.top = top + "px";
    t.style.left = left + "px";
}

function hideTooltip() {
    const t = document.getElementById("chm-tooltip");
    if(t) t.style.display = "none";
}

function showSelectionMenu(e, entries, dateStr) {
    const m = document.getElementById("chm-selection-menu");
    if(!m) return;
    hideTooltip();
    m.innerHTML = `<div style="font-weight:800; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px; color:${STYLES.accent}">${moment(dateStr).format("MMM D, YYYY")}</div>`;
    
    entries.forEach(entry => {
        const item = document.createElement("div");
        item.className = "chm-selection-item";
        item.textContent = entry.title;
        item.onclick = (evt) => {
            evt.stopPropagation();
            app.workspace.openLinkText(entry.file, "/", false);
            m.style.display = "none";
        };
        m.appendChild(item);
    });
    m.style.display = "block";
    const rect = e.target.getBoundingClientRect();
    let top = rect.bottom + 5;
    let left = rect.left;
    if (top + m.offsetHeight > window.innerHeight) top = rect.top - m.offsetHeight - 5;
    if (left + m.offsetWidth > window.innerWidth) left = window.innerWidth - m.offsetWidth - 10;
    m.style.top = top + "px";
    m.style.left = left + "px";
    const closeHandler = (evt) => { if (!m.contains(evt.target)) { m.style.display = "none"; document.removeEventListener("click", closeHandler); } };
    setTimeout(() => document.addEventListener("click", closeHandler), 0);
}

render();