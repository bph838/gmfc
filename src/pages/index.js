import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea } from "@framework/dom";
import { fetchJson } from "@framework/utils";
import data from "@data/pages/index.json";

setupMenuCommands("page-home");
renderIndex(data);
renderAlerts();

function renderIndex(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const div = createDiv(contentarea, "sections");

  if (data.content.sections) {    
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(div, section);
    });
  }
}

function renderAlerts() {
  console.log("Rendering alerts");
  //need to load the alerts from site
  const urlalerts = "/data/alerts.json";

  fetchJson(urlalerts).then((data) => {
    if (!data || !data.alerts || data.alerts.length === 0) {
      console.log("No alerts to render");
      return;
    } 

    const alertsContainer = document.getElementById("alerts-container");
    if (!alertsContainer) {
      console.error("Alerts container not found");
      return;
    }

    data.alerts.forEach((alert) => {
      let now = new Date();
      let dateFrom = alert.date_from ? new Date(alert.date_from) : null;
      let dateTo = alert.date_to ? new Date(alert.date_to) : null;

      //check date range
      if ((dateFrom && now < dateFrom) || (dateTo && now > dateTo)) {
        console.log(`Skipping alert "${alert.title}" due to date range`);
        return; //skip this alert
      } else {
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${alert.type} show`;
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = `
          <strong>${alert.title}</strong> ${alert.message}          
        `;
        alertsContainer.appendChild(alertDiv);
        shakeContainer(alertsContainer);
        return; //only display one
      }
    });
  });
}

function shakeContainer(container) {
  container.classList.add("shake");

  setTimeout(() => {
    container.classList.remove("shake");
  }, 500);    
}
