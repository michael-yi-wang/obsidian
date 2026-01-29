const container = this.container;
container.innerHTML = "";

// --- Configuration ---
const DAILY_NOTES_FOLDER = '"Notes"'; // Target your Notes folder
const YEAR_CELL_SIZE = "20px";
const YEAR_GAP_SIZE = "2px";

// Heatmap Colors (Shades of Green)
const COLORS = [
  "#2a2a2a", // 0 entries
  "#0e4429", // 1 entry
  "#006d32", // 2 entries
  "#26a641", // 3 entries
  "#39d353"  // 4+ entries
];

let currentDate = moment();

// --- Data Fetching ---
function getData(year) {
  let data = {};
  let pages;
  
  try {
     pages = dv.pages(DAILY_NOTES_FOLDER);
  } catch (e) {
     console.error("CalendarHotMap: Error fetching pages", e);
     return {};
  }

  if (!pages || pages.length === 0) {
      console.warn("CalendarHotMap: No pages found. Check DAILY_NOTES_FOLDER.");
  }

  // Helper to safely parse various date formats (Luxon, string, JS Date)
  const parseDate = (input) => {
      if (!input) return null;
      if (moment.isMoment(input)) return input;
      if (input.toJSDate) return moment(input.toJSDate()); // Luxon (Dataview default)
      if (input instanceof Date) return moment(input);
      return moment(input); // String or Timestamp
  };

  pages.forEach(p => {
    let d = null;
    
    // 1. Priority: 'created' frontmatter property
    if (p.created) {
        d = parseDate(p.created);
    } 
    // 2. Fallback: 'date' frontmatter property
    else if (p.date) {
        d = parseDate(p.date);
    } 
    // 3. Fallback: Filename (YYYY-MM-DD)
    else {
        d = moment(p.file.name, "YYYY-MM-DD", true);
    }
    
    // Validate date and check year
    if (d && d.isValid() && d.year() === year) {
      const key = d.format("YYYY-MM-DD");
      if (!data[key]) data[key] = [];
      data[key].push({
        file: p.file.path,
        title: p.file.name,
        date: key
      });
    }
  });

  return data;
}

// --- Rendering ---
function renderCalendar() {
  container.innerHTML = "";
  
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.width = "fit-content"; 
  wrapper.style.margin = "0 auto";
  wrapper.style.backgroundColor = "#1e1e2f";
  wrapper.style.borderRadius = "12px";
  wrapper.style.padding = "20px";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.color = "#eee";
  
  container.appendChild(wrapper);

  // Header
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "center";
  header.style.alignItems = "center";
  header.style.marginBottom = "20px";
  header.style.gap = "15px";

  const prevBtn = createNavButton("◀", () => {
    currentDate.subtract(1, 'years');
    renderCalendar();
  });

  const title = document.createElement("h2");
  title.style.margin = "0";
  title.style.fontSize = "1.8em";
  title.style.minWidth = "80px";
  title.style.textAlign = "center";
  title.textContent = currentDate.format("YYYY");

  const nextBtn = createNavButton("▶", () => {
    currentDate.add(1, 'years');
    renderCalendar();
  });

  const todayBtn = createNavButton("Today", () => {
      currentDate = moment();
      renderCalendar();
  });
  todayBtn.style.marginLeft = "10px";

  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(nextBtn);
  header.appendChild(todayBtn);
  wrapper.appendChild(header);

  // Year Grid: Fixed 3 columns, grouped in the center
  const yearGrid = document.createElement("div");
  yearGrid.style.display = "grid";
  yearGrid.style.gridTemplateColumns = "repeat(3, auto)";
  yearGrid.style.gap = "30px";
  yearGrid.style.justifyContent = "center";
  yearGrid.style.width = "fit-content";
  
  const data = getData(currentDate.year());

  for (let m = 0; m < 12; m++) {
    const monthContainer = document.createElement("div");
    monthContainer.style.display = "flex";
    monthContainer.style.flexDirection = "column";
    monthContainer.style.alignItems = "center";

    const monthLabel = document.createElement("div");
    monthLabel.textContent = moment().month(m).format("MMMM");
    monthLabel.style.marginBottom = "8px";
    monthLabel.style.fontWeight = "bold";
    monthLabel.style.fontSize = "0.9em";
    monthLabel.style.color = "#ccc";

    const grid = createMonthGrid(currentDate.year(), m, data);
    
    monthContainer.appendChild(monthLabel);
    monthContainer.appendChild(grid);
    yearGrid.appendChild(monthContainer);
  }
  
  wrapper.appendChild(yearGrid);
  renderLegend(wrapper);
}

function createNavButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.style.padding = "4px 12px";
    btn.style.cursor = "pointer";
    btn.style.border = "1px solid #444";
    btn.style.backgroundColor = "#2a2a3a";
    btn.style.color = "#fff";
    btn.style.borderRadius = "4px";
    btn.onclick = onClick;
    return btn;
}

function createMonthGrid(year, month, data) {
    const monthStart = moment({ year: year, month: month, day: 1 });
    const daysInMonth = monthStart.daysInMonth();
    const startDay = monthStart.day(); // 0=Sun

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `repeat(7, ${YEAR_CELL_SIZE})`;
    grid.style.gridAutoRows = YEAR_CELL_SIZE;
    grid.style.gap = YEAR_GAP_SIZE;

    // Padding
    for (let i = 0; i < startDay; i++) {
        grid.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = moment({ year: year, month: month, day: day }).format("YYYY-MM-DD");
        const entries = data[dateStr] || [];
        const count = entries.length;

        const cell = document.createElement("div");
        const colorIndex = Math.min(count, COLORS.length - 1);
        cell.style.backgroundColor = COLORS[colorIndex];
        cell.style.borderRadius = "2px";
        cell.style.cursor = count > 0 ? "pointer" : "default";
        
        // Display Day Number
        cell.textContent = day;
        cell.style.fontSize = "9px";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
        cell.style.color = count > 0 ? "#fff" : "#666"; // Brighter text if entry exists

        // Highlight Today
        if (dateStr === moment().format("YYYY-MM-DD")) {
             cell.style.boxShadow = "inset 0 0 0 1px #fff";
        }

        if (count > 0) {
            cell.onmouseenter = (e) => showTooltip(e, entries, dateStr);
            cell.onmouseleave = hideTooltip;
            cell.onclick = (e) => {
                e.stopPropagation();
                hideTooltip();
                app.workspace.openLinkText(entries[0].file, "/", false);
            };
        } else {
            cell.title = dateStr; 
        }

        grid.appendChild(cell);
    }
    return grid;
}

function renderLegend(parent) {
    const legend = document.createElement("div");
    legend.style.display = "flex";
    legend.style.justifyContent = "center";
    legend.style.alignItems = "center";
    legend.style.gap = "8px";
    legend.style.marginTop = "25px";
    legend.style.fontSize = "0.8em";
    legend.style.color = "#888";

    legend.appendChild(document.createTextNode("Less "));
    COLORS.forEach(color => {
        const swatch = document.createElement("div");
        swatch.style.width = "12px";
        swatch.style.height = "12px";
        swatch.style.backgroundColor = color;
        swatch.style.borderRadius = "2px";
        legend.appendChild(swatch);
    });
    legend.appendChild(document.createTextNode(" More"));
    parent.appendChild(legend);
}

// --- Tooltip System ---
let tooltip = document.getElementById("calendar-heatmap-tooltip");
if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "calendar-heatmap-tooltip";
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = "9999";
    tooltip.style.backgroundColor = "#1e1e2f";
    tooltip.style.border = "1px solid #555";
    tooltip.style.padding = "8px 12px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.display = "none";
    tooltip.style.pointerEvents = "none";
    tooltip.style.color = "#eee";
    tooltip.style.fontSize = "12px";
    tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
    document.body.appendChild(tooltip);
}

function showTooltip(e, entries, dateStr) {
    const rect = e.target.getBoundingClientRect();
    tooltip.style.display = "block";
    tooltip.innerHTML = `<strong>${moment(dateStr).format("MMM D, YYYY")}</strong>` + 
                       entries.map(en => `<div style="margin-top:2px">📝 ${en.title}</div>`).join("");
    
    // Position
    tooltip.style.top = `${rect.bottom + 8}px`;
    tooltip.style.left = `${rect.left}px`;
    
    const tipRect = tooltip.getBoundingClientRect();
    if (tipRect.right > window.innerWidth) {
        tooltip.style.left = `${window.innerWidth - tipRect.width - 20}px`;
    }
}

function hideTooltip() {
    tooltip.style.display = "none";
}

renderCalendar();