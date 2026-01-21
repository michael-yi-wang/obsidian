const container = this.container;
let currentDate = moment(); // Tracks the currently viewed month and year

const NOTE_COLOR = "#00cc44"; // Green color for existing notes
const CELL_SIZE = "40px"; // Increased size for monthly view
const GAP_SIZE = "4px";

/* PUT YOUR DAILY NOTES FOLDER HERE */
const DAILY_NOTES_FOLDER = '"Daily Notes"'; 

function getData(year) {
  let data = {};
  // Query pages from the daily notes folder
  const pages = dv.pages(DAILY_NOTES_FOLDER);

  pages.forEach(p => {
    // specific logic to find the date of the file
    // Assumes file name is YYYY-MM-DD or date property exists
    let d = moment(p.file.name, "YYYY-MM-DD", true);
    if (!d.isValid() && p.date) {
        d = moment(p.date.toString(), "YYYY-MM-DD");
    }
    
    if (d.isValid() && d.year() === year) {
      const key = d.format("YYYY-MM-DD");
      data[key] = {
        file: p.file.path,
        date: key,
        title: p.file.name
      };
    }
  });

  return data;
}

function renderCalendar(date) {
  const year = date.year();
  const month = date.month(); // 0-indexed

  container.innerHTML = "";

  const calendarWrapper = document.createElement("div");
  calendarWrapper.style.backgroundColor = "#1e1e2f";
  calendarWrapper.style.border = "1px solid #444";
  calendarWrapper.style.borderRadius = "12px";
  calendarWrapper.style.padding = "24px";
  calendarWrapper.style.boxShadow = "0 4px 8px rgba(0,0,0,0.25)";
  calendarWrapper.style.display = "flex";
  calendarWrapper.style.flexDirection = "column";
  calendarWrapper.style.alignItems = "center";
  calendarWrapper.style.maxWidth = "fit-content";
  calendarWrapper.style.margin = "0 auto";
  
  container.appendChild(calendarWrapper);

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "center";
  header.style.alignItems = "center";
  header.style.marginBottom = "20px";
  header.style.gap = "1.5em";
  header.style.width = "100%";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "◀";
  prevBtn.style.padding = "4px 12px";
  prevBtn.onclick = () => {
    currentDate.subtract(1, 'months');
    renderCalendar(currentDate);
  };

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "▶";
  nextBtn.style.padding = "4px 12px";
  nextBtn.onclick = () => {
    currentDate.add(1, 'months');
    renderCalendar(currentDate);
  };

  const titleLabel = document.createElement("h2");
  titleLabel.textContent = date.format("MMMM YYYY");
  titleLabel.style.margin = "0";
  titleLabel.style.minWidth = "200px";
  titleLabel.style.textAlign = "center";

  header.appendChild(prevBtn);
  header.appendChild(titleLabel);
  header.appendChild(nextBtn);
  calendarWrapper.appendChild(header);

  // Fetch data for the relevant year
  const data = getData(year);

  // Render Single Month
  const monthStart = moment(date).startOf('month');
  const daysInMonth = monthStart.daysInMonth();

  const monthBlock = document.createElement("div");
  monthBlock.style.display = "flex";
  monthBlock.style.flexDirection = "column";
  monthBlock.style.alignItems = "center";

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(7, ${CELL_SIZE})`;
  grid.style.gridAutoRows = CELL_SIZE;
  grid.style.gap = GAP_SIZE;
  grid.style.justifyContent = "center";

  ["S", "M", "T", "W", "T", "F", "S"].forEach(d => {
    const day = document.createElement("div");
    day.textContent = d;
    day.style.textAlign = "center";
    day.style.fontWeight = "bold";
    day.style.fontSize = "14px";
    day.style.lineHeight = CELL_SIZE; // Center text vertically
    day.style.width = CELL_SIZE;
    day.style.height = CELL_SIZE;
    day.style.color = "#ccc";
    grid.appendChild(day);
  });

  const startDay = monthStart.day();
  for (let i = 0; i < startDay; i++) {
    const pad = document.createElement("div");
    grid.appendChild(pad);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = moment(`${year}-${month + 1}-${day}`, "YYYY-M-D");
    const dateStr = dateObj.format("YYYY-MM-DD");
    const entry = data[dateStr];

    const cell = document.createElement("div");
    cell.style.width = CELL_SIZE;
    cell.style.height = CELL_SIZE;
    cell.style.borderRadius = "6px";
    cell.style.backgroundColor = entry ? NOTE_COLOR : "#2a2a2a";
    cell.style.cursor = entry ? "pointer" : "default";
    cell.style.display = "flex";
    cell.style.justifyContent = "center";
    cell.style.alignItems = "center";
    cell.style.fontSize = "12px";
    cell.textContent = day; 
    cell.style.color = entry ? "#fff" : "#666"; // Contrast text

    const isToday = dateStr === moment().format("YYYY-MM-DD");
    if (isToday) {
      cell.style.boxShadow = "inset 0 0 0 2px rgba(255, 255, 255, 0.9)";
      cell.style.fontWeight = "bold";
    }

    if (entry) {
      const popout = document.createElement("div");
      popout.style.position = "absolute";
      popout.style.zIndex = "9999";
      popout.style.backgroundColor = "#1e1e2f";
      popout.style.border = "1px solid #888";
      popout.style.borderRadius = "6px";
      popout.style.padding = "8px 10px";
      popout.style.fontSize = "0.85em";
      popout.style.color = "#eee";
      popout.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
      popout.style.pointerEvents = "none";
      popout.style.display = "none";
      popout.style.whiteSpace = "nowrap";
      popout.innerHTML = `
        <strong>📝 ${entry.title}</strong><br>
        📅 ${moment(dateStr).format("MMM D, YYYY")}
      `;

      document.body.appendChild(popout);

      cell.addEventListener("mouseenter", e => {
        const rect = cell.getBoundingClientRect();
        popout.style.left = `${rect.right + 10}px`;
        popout.style.top = `${rect.top}px`;
        popout.style.display = "block";
      });

      cell.addEventListener("mouseleave", () => {
        popout.style.display = "none";
      });

      cell.onclick = () => {
        popout.remove();
        app.workspace.openLinkText(entry.file, "/", false);
      };
    }

    grid.appendChild(cell);
  }

  monthBlock.appendChild(grid);
  calendarWrapper.appendChild(monthBlock);

  // Legend
  const legend = document.createElement("div");
  legend.style.marginTop = "20px";
  legend.style.textAlign = "center";
  legend.style.display = "flex";
  legend.style.justifyContent = "center";
  legend.style.gap = "12px";

  const item = document.createElement("div");
  item.style.display = "flex";
  item.style.alignItems = "center";
  item.style.gap = "8px";
  item.style.fontSize = "0.9em";

  const swatch = document.createElement("div");
  swatch.style.width = "18px";
  swatch.style.height = "18px";
  swatch.style.borderRadius = "4px";
  swatch.style.backgroundColor = NOTE_COLOR;

  const label = document.createElement("span");
  label.textContent = "Entry";

  item.appendChild(swatch);
  item.appendChild(label);
  legend.appendChild(item);

  calendarWrapper.appendChild(legend);
}

renderCalendar(currentDate);