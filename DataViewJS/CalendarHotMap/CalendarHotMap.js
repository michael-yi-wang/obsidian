const container = this.container;
container.innerHTML = "";

// --- Configuration ---
const CONFIG = {
    dailyNotesPath: '"Calendar Notes/Daily Notes"', // Target your Daily Notes folder
    kbPath: '"Notes/Knowledge Base"', // Target your Knowledge Base folder; set to null to exclude Daily Notes
    cellBoxSize: 26, // Increased from 22 for better readability
    cellGap: 2,      // Reduced gap between cells
};

// --- State ---
const savedMode = localStorage.getItem("chm-active-mode") || "daily";
let state = {
    year: moment().year(),
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
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            gap: 16px;
            flex-wrap: wrap;
        }

        .chm-title-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: nowrap;
            justify-content: center;
        }

        .chm-mode-switch {
            display: flex;
            background: rgba(0,0,0,0.3);
            padding: 4px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.05);
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
            grid-template-columns: 28px repeat(7, ${CONFIG.cellBoxSize}px);
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
            justify-content: flex-end;
            padding-right: 6px;
            font-weight: 700;
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
            background: #1e1e2e;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            padding: 8px;
            z-index: 20000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            display: none;
            min-width: 200px;
            max-width: 350px;
        }
        .chm-selection-item {
            padding: 12px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: 0.2s;
            font-size: 1rem;
            color: #c0caf5;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .chm-selection-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
    `;
    document.head.appendChild(style);
}

// --- Data Logic ---
function getData(year, mode) {
    let pages;
    let path = "";
    if (mode === 'daily') {
        path = CONFIG.dailyNotesPath;
    } else {
        path = CONFIG.kbPath ? CONFIG.kbPath : `-"${CONFIG.dailyNotesPath.replace(/"/g, '')}"`;
    }
    try { pages = dv.pages(path); } catch (e) { return {}; }
    let data = {};
    const parseDate = (input) => {
        if (!input) return null;
        if (moment.isMoment(input)) return input;
        if (input.toJSDate) return moment(input.toJSDate()); 
        if (input instanceof Date) return moment(input);
        return moment(input); 
    };
    pages.forEach(p => {
        let d = null;
        if (p.created) d = parseDate(p.created);
        else if (p.date) d = parseDate(p.date);
        else if (mode === 'daily') d = moment(p.file.name, "YYYY-MM-DD", true);
        else if (p.file.cday) d = moment(p.file.cday);
        if (d && d.isValid() && d.year() === year) {
            const key = d.format("YYYY-MM-DD");
            if (!data[key]) data[key] = [];
            data[key].push({ file: p.file.path, title: p.file.name, date: key });
        }
    });
    return data;
}

// --- Rendering ---
function render() {
    const isMobile = app.isMobile;
    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "chm-wrapper";
    wrapper.style.minHeight = isMobile ? "auto" : "960px";
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
    modeSwitch.appendChild(createBtn('daily', '📅 Daily Notes'));
    modeSwitch.appendChild(createBtn('kb', '🧠 Knowledge Base'));

    const navGroup = document.createElement("div");
    navGroup.className = "chm-title-group";
    const addControls = (label, currentVal, onPrev, onNext) => {
        const prevBtn = document.createElement("button");
        prevBtn.className = "chm-nav-btn";
        prevBtn.innerHTML = "‹";
        prevBtn.onclick = onPrev;
        const display = document.createElement("div");
        display.className = label === 'year' ? "chm-year-display" : "chm-month-display";
        display.textContent = currentVal;
        const nextBtn = document.createElement("button");
        nextBtn.className = "chm-nav-btn";
        nextBtn.innerHTML = "›";
        nextBtn.onclick = onNext;
        navGroup.appendChild(prevBtn);
        navGroup.appendChild(display);
        navGroup.appendChild(nextBtn);
    };

    addControls('year', state.year, () => { state.year--; render(); }, () => { state.year++; render(); });
    if (isMobile) {
        addControls('month', moment().month(state.month).format("MMM"), 
            () => { state.month--; if (state.month < 0) { state.month = 11; state.year--; } render(); }, 
            () => { state.month++; if (state.month > 11) { state.month = 0; state.year++; } render(); }
        );
    }
    const todayBtn = document.createElement("button");
    todayBtn.className = "chm-nav-btn chm-today-btn";
    todayBtn.innerHTML = "Today";
    todayBtn.onclick = () => { state.year = moment().year(); state.month = moment().month(); render(); };
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
    subHeader.textContent = state.mode === 'daily' ? "Daily Notes Heatmap" : "Knowledge Base Heatmap";
    wrapper.appendChild(subHeader);

    const mainGrid = document.createElement("div");
    mainGrid.className = "chm-main-grid";
    if (isMobile) mainGrid.style.gridTemplateColumns = "1fr";

    const data = getData(state.year, state.mode);
    const colors = state.mode === 'daily' ? STYLES.dailyColors : STYLES.kbColors;
    const monthsToRender = isMobile ? [state.month] : [0,1,2,3,4,5,6,7,8,9,10,11];

    monthsToRender.forEach(m => {
        const monthCard = document.createElement("div");
        monthCard.className = "chm-month-card";
        const title = document.createElement("div");
        title.className = "chm-month-title";
        title.textContent = moment().month(m).format("MMMM");
        monthCard.appendChild(title);
        monthCard.appendChild(createMonth(state.year, m, data, colors));
        mainGrid.appendChild(monthCard);
    });
    wrapper.appendChild(mainGrid);
    
    const totalEntries = Object.values(data).reduce((acc, curr) => acc + curr.length, 0);
    const footer = document.createElement("div");
    footer.style.textAlign = "center";
    footer.style.marginTop = "25px";
    footer.style.color = "#565f89";
    footer.style.fontSize = "1rem";
    footer.innerHTML = `Total Entries: <b>${totalEntries}</b>`;
    wrapper.appendChild(footer);

    const legend = document.createElement("div");
    legend.className = "chm-legend";
    if (state.mode === 'daily') {
        const createLegendItem = (color, label) => {
            const item = document.createElement("div");
            item.className = "chm-legend-item";
            const box = document.createElement("div");
            box.className = "chm-legend-box";
            box.style.background = color;
            item.appendChild(box);
            const text = document.createElement("span");
            text.textContent = label;
            item.appendChild(text);
            return item;
        };
        legend.appendChild(createLegendItem(STYLES.dailyColors[0], "No Note"));
        legend.appendChild(createLegendItem(STYLES.dailyColors[4], "Note Created"));
    } else {
        const labelLess = document.createElement("span");
        labelLess.textContent = "Less";
        legend.appendChild(labelLess);
        STYLES.kbColors.forEach(c => {
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

function createMonth(year, month, data, colors) {
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
        }
        grid.appendChild(wk);
    };

    addWeekNum(start);
    for(let i=0; i<startDay; i++) grid.appendChild(document.createElement("div"));
    let cellCount = startDay;
    for(let d=1; d<=daysInMonth; d++) {
        const date = moment({year, month, day: d});
        const dateStr = date.format("YYYY-MM-DD");
        const entries = data[dateStr] || [];
        const count = entries.length;
        const cell = document.createElement("div");
        cell.className = "chm-cell";
        cell.textContent = d;
        if (count > 0) {
            cell.classList.add("active");
            cell.style.backgroundColor = colors[Math.min(count, colors.length - 1)];
            cell.onmouseenter = (e) => showTooltip(e, entries, dateStr);
            cell.onmouseleave = hideTooltip;
            cell.onclick = (e) => {
                e.stopPropagation();
                if (entries.length === 1) app.workspace.openLinkText(entries[0].file, "/", false);
                else showSelectionMenu(e, entries);
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

function showTooltip(e, entries, dateStr) {
    const t = document.getElementById("chm-tooltip");
    if(!t) return;
    t.innerHTML = `<div style="font-weight:800; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px; color:${STYLES.accent}">${moment(dateStr).format("MMM D, YYYY")}</div>` +
                  entries.slice(0, 8).map(x => `<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px;">• ${x.title}</div>`).join("");
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

function showSelectionMenu(e, entries) {
    const m = document.getElementById("chm-selection-menu");
    if(!m) return;
    m.innerHTML = "";
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
