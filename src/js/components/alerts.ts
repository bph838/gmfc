import { fetchJson, shakeContainer, getTimeParts } from "@framework/utils";

interface Alert {
  date_from: string | number | Date;
  date_to: string | number | Date;
  title: string;
  hash: string;
  type: string;
  message: string;
}

const ALERTS_URL = "/data/site/alerts.json";

// Fetches site alerts and renders the ones currently within their date range.
export async function renderAlerts() {
  console.log("Rendering alerts");

  const data: Alert[] = await fetchJson(ALERTS_URL);
  if (!data || data.length === 0) {
    console.log("No alerts to render");
    return;
  }

  const alertsContainer = document.getElementById("alerts-container");
  if (!alertsContainer) {
    console.error("Alerts container not found");
    return;
  }

  let alertsFound = false;
  const now = new Date();

  for (const alert of data) {
    const dateFrom = alert.date_from ? new Date(alert.date_from) : null;
    const dateTo = alert.date_to ? new Date(alert.date_to) : null;

    // Alerts outside their configured date range are skipped entirely.
    if ((dateFrom && now < dateFrom) || (dateTo && now > dateTo)) {
      console.log(`Skipping alert "${alert.title}" due to date range`);
      continue;
    }

    alertsFound = true;
    renderAlert(alertsContainer, alert);
  }

  if (alertsFound) {
    renderAnyCountdowns(alertsContainer);
    showAlertBell();
    bindAlertBell();
  }
}

// Builds and inserts a single alert element. Dismissed alerts are still
// added to the DOM (so the bell can reopen them) but start hidden.
function renderAlert(alertsContainer: HTMLElement, alert: Alert) {
  const showAlert = shouldAlertBeShown(alert.hash);

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${alert.type} show site-alerts`;
  alertDiv.setAttribute("role", "alert");

  // Title/message are set via textContent/createTextNode (not innerHTML)
  // since alert content comes from alerts.json and isn't trusted.
  const title = document.createElement("h4");
  title.textContent = alert.title;
  alertDiv.appendChild(title);
  alertDiv.appendChild(document.createTextNode(alert.message));

  if (!showAlert) alertDiv.style.display = "none";

  alertsContainer.appendChild(alertDiv);
  addClickHandler(alertDiv, alert.hash);
  shakeContainer(alertsContainer);
}

// Lets the user re-show previously dismissed alerts via the navbar bell.
function bindAlertBell() {
  const navbarAlertBell = document.getElementById("navbar-alert");
  if (!navbarAlertBell) return;

  navbarAlertBell.addEventListener("pointerup", () => {
    document.querySelectorAll<HTMLElement>(".site-alerts").forEach((el) => {
      el.style.display = "block";
    });
  });
}

function showAlertBell() {
  const alertNav = document.getElementById("navbar-alert");
  if (alertNav) {
    alertNav.classList.remove("is-hidden");
  }
}

// Dismissal state is persisted per-alert in localStorage, keyed by the
// alert's hash, so a dismissed alert stays hidden across page loads until
// its content (and therefore hash) changes.
function shouldAlertBeShown(hash: string) {
  return !localStorage.getItem(hash);
}

function addClickHandler(el: HTMLDivElement, hash: string) {
  el.addEventListener("pointerup", (e: PointerEvent) => {
    // If the click was on a link (or inside one), do nothing
    const link = (e.target as HTMLElement)?.closest("a");
    if (link) {
      return; // let the link work normally
    }

    console.log(`activated alert click ${hash}`);
    localStorage.setItem(hash, new Date().toISOString());
    el.style.display = "none";
  });
}

// Starts a 1s ticker that updates any `.countdown` spans inside the alerts
// container, e.g.:
// <span class='countdown' data-cd-date='2026-12-25 12:00:00' data-cd-type='days'></span>
function renderAnyCountdowns(alertsContainer: HTMLElement) {
  const elCd = alertsContainer.querySelectorAll<HTMLElement>(".countdown");
  if (elCd.length === 0) return;

  setInterval(() => {
    const now = new Date();
    elCd.forEach((el) => updateCountdown(el, now));
  }, 1000);
}

function updateCountdown(el: HTMLElement, now: Date) {
  const countdownType = el.dataset.cdType?.toLowerCase();
  const dateStr = el.dataset.cdDate;
  if (!dateStr || !countdownType) return;

  const date = new Date(dateStr.replace(" ", "T"));
  if (isNaN(date.getTime())) return;

  const diff = date.getTime() - now.getTime();
  const t = getTimeParts(diff);

  switch (countdownType) {
    case "days":
      el.textContent = `${t.days} days`;
      break;
    case "datetimetoseconds":
      el.textContent =
        t.days > 0
          ? `${t.days} days ${t.hours} hours ${t.minutes} mins ${t.seconds} secs`
          : `${t.hours} hours ${t.minutes} mins ${t.seconds} secs`;
      break;
    case "daystohourstomins":
      el.textContent = formatDaysToMins(t);
      break;
  }
}

// Progressively coarsens the displayed precision as time runs out, e.g.
// "3 days" -> "1 day" -> "5 hours" -> "45 mins".
function formatDaysToMins(t: {
  days: number;
  hours: number;
  minutes: number;
}) {
  if (t.days > 1) return `${t.days} days`;
  if (t.days === 1) return `${t.days} day`;

  if (t.hours > 6) return `${t.hours} hours`;
  if (t.hours > 1) return `${t.hours} hours ${t.minutes} mins`;
  if (t.hours === 1) return `${t.hours} hour ${t.minutes} mins`;
  return `${t.minutes} mins`;
}
