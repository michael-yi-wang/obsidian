const container = this.container;
let currentYear = moment().year();

const NOTE_COLOR = "#00cc44"; // Green color for existing notes

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

function renderCalendar(year) {
  container.innerHTML = "";

  const calendarWrapper = document.createElement("div");
  calendarWrapper.style.backgroundColor = "#1e1e2f";
  calendarWrapper.style.border = "1px solid #444";
  calendarWrapper.style.borderRadius = "12px";
  calendarWrapper.style.padding = "16px";
  calendarWrapper.style.boxShadow = "0 4px 8px rgba(0,0,0,0.25)";
  calendarWrapper.style.display = "flex";
  calendarWrapper.style.flexDirection = "column";
  calendarWrapper.style.alignItems = "center";
  calendarWrapper.style.maxWidth = "fit-content";
  calendarWrapper.style.margin = "0 auto";
  calendarWrapper.style.transform = "scale(1)";
  calendarWrapper.style.transformOrigin = "top left";

  container.appendChild(calendarWrapper);

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "center";
  header.style.alignItems = "center";
  header.style.marginBottom = "12px";
  header.style.gap = "1em";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "◀";
  prevBtn.onclick = () => {
    currentYear--;
    renderCalendar(currentYear);
  };

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "▶";
  nextBtn.onclick = () => {
    currentYear++;
    renderCalendar(currentYear);
  };

  const yearLabel = document.createElement("h2");
  yearLabel.textContent = currentYear;

  header.appendChild(prevBtn);
  header.appendChild(yearLabel);
  header.appendChild(nextBtn);
  calendarWrapper.appendChild(header);

  const calendarGrid = document.createElement("div");
  calendarGrid.style.display = "grid";
  calendarGrid.style.gridTemplateColumns = "repeat(4, auto)";
  calendarGrid.style.gap = "24px 16px";
  calendarGrid.style.justifyItems = "center";
  calendarWrapper.appendChild(calendarGrid);

  const data = getData(year);

  for (let month = 0; month < 12; month++) {
    const monthStart = moment(`${year}-${month + 1}-01`);
    const daysInMonth = monthStart.daysInMonth();

    const monthBlock = document.createElement("div");
    monthBlock.style.width = "140px";
    monthBlock.style.display = "flex";
    monthBlock.style.flexDirection = "column";
    monthBlock.style.alignItems = "center";

    const monthLabel = document.createElement("h3");
    monthLabel.textContent = monthStart.format("MMM");
    monthLabel.style.fontSize = "0.9em";
    monthLabel.style.textAlign = "center";
    monthLabel.style.marginBottom = "4px";
    monthBlock.appendChild(monthLabel);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, 14px)";
    grid.style.gridAutoRows = "14px";
    grid.style.gap = "1px";
    grid.style.justifyContent = "start";

    ["S", "M", "T", "W", "T", "F", "S"].forEach(d => {
      const day = document.createElement("div");
      day.textContent = d;
      day.style.textAlign = "center";
      day.style.fontWeight = "bold";
      day.style.fontSize = "10px";
      day.style.lineHeight = "12px";
      day.style.width = "14px";
      day.style.height = "14px";
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
      cell.style.width = "14px";
      cell.style.height = "14px";
      cell.style.borderRadius = "3px";
      cell.style.backgroundColor = entry ? NOTE_COLOR : "#2a2a2a";
      cell.style.cursor = entry ? "pointer" : "default";

      const isToday = dateStr === moment().format("YYYY-MM-DD");
      if (isToday) {
        cell.style.boxShadow = "inset 0 0 6px rgba(255, 255, 255, 0.8)";
        cell.style.border = "1px solid white";
      }

      if (entry) {
        const popout = document.createElement("div");
        popout.style.position = "absolute";
        popout.style.zIndex = "9999";
        popout.style.backgroundColor = "#1e1e2f";
        popout.style.border = "1px solid #888";
        popout.style.borderRadius = "6px";
        popout.style.padding = "8px 10px";
        popout.style.fontSize = "0.75em";
        popout.style.color = "#eee";
        popout.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
        popout.style.pointerEvents = "none";
        popout.style.display = "none";
        popout.innerHTML = `
          <strong>📝 ${entry.title}</strong><br>
          📅 ${moment(dateStr).format("MMM D, YYYY")}
        `;

        document.body.appendChild(popout);

        cell.addEventListener("mouseenter", e => {
          const rect = cell.getBoundingClientRect();
          popout.style.left = `${rect.right + 6}px`;
          popout.style.top = `${rect.top - 4}px`;
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
    calendarGrid.appendChild(monthBlock);
  }

  const legend = document.createElement("div");
  legend.style.marginTop = "12px";
  legend.style.textAlign = "center";
  legend.style.display = "flex";
  legend.style.justifyContent = "center";
  legend.style.gap = "12px";

  const item = document.createElement("div");
  item.style.display = "flex";
  item.style.alignItems = "center";
  item.style.gap = "6px";
  item.style.fontSize = "0.85em";

  const swatch = document.createElement("div");
  swatch.style.width = "14px";
  swatch.style.height = "14px";
  swatch.style.borderRadius = "3px";
  swatch.style.backgroundColor = NOTE_COLOR;

  const label = document.createElement("span");
  label.textContent = "Entry";

  item.appendChild(swatch);
  item.appendChild(label);
  legend.appendChild(item);

  calendarWrapper.appendChild(legend);
}

renderCalendar(currentYear);
