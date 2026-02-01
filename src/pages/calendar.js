import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  createH1,
  createParagraph,
  fetchContextArea,
  createSpan,
} from "@framework/dom";
import { loadScript } from "@framework/utils";

import data from "@data/pages/calendar.json";

setupMenuCommands("page-calendar");
loadScript(
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.20/index.global.min.js",
  () => {
    renderCalendar(data);
    console.log("sd");
    if (data.calendarevents) renderExternalCalendar(data.calendarevents);
  },
);

function renderCalendar(data) {
  console.log("data");
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const sectionsdiv = createDiv(contentarea, "section");
  createH1(sectionsdiv, "Events Calendar", "mt-4 mb-3");
  const para = createParagraph(
    sectionsdiv,
    "Stay updated with our latest events and activities by subscribing to the <span><a href='/calendar.ics'>calendar</a></span>",
  );

  const span = createSpan(
    para,
    "copyurl",
    '<i class="fa-regular fa-copy"></i>',
  );
  span.dataset.copy = "https://www.gmfc.uk/calendar.ics";
  span.dataset.tooltip = "Click to copy";

  createDiv(sectionsdiv, null, "calendar");

  createCopyFunction(span);
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

function createCopyFunction(span) {
  console.log("createCopyFunction");

  // Define the handler function
  const handler = () => {
    const textToCopy = span.dataset.copy;
    if (!textToCopy) return;

    // Use modern Clipboard API
    if (navigator.clipboard) {
      console.log("copy");

      // Change tooltip text      
      span.dataset.tooltip = "Copied!";

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => console.log(`Copied: ${textToCopy}`))
        .catch((err) => console.error("Copy failed:", err));
    }
  };

  // Add click and touch events
  span.addEventListener("click", handler);
  span.addEventListener("touchstart", handler);
}
