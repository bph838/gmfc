import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  createH1,
  createParagraph,
  fetchContextArea,
} from "@framework/dom";
import { loadScript } from "@framework/utils";

import data from "@data/pages/calendar.json";

setupMenuCommands("page-calendar");
loadScript(
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.20/index.global.min.js",
  () => {
    renderCalendar(data);
    console.log("sd");
    if (data.calendarevents) 
      renderExternalCalendar(data.calendarevents);
  },
);

function renderCalendar(data) {
    
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  
  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const sectionsdiv = createDiv(contentarea,"sections");
  createH1(sectionsdiv, "Events Calendar", "mt-4 mb-3");
  createParagraph(
    sectionsdiv,
    "Stay updated with our latest events and activities by subscribing to the <span><a href='/calendar.ics'>calendar</a></span>",
  );
  createDiv(sectionsdiv, null, "calendar");
}

function renderExternalCalendar(url) {
  console.log("Render");
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      firstDay: 1,
      events: url,
    });
    calendar.render();
  
}
