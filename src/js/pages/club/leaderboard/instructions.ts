import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  createOrderedList,
  createListItem,
} from "@framework/dom";

import data from "@data/pages/club/leaderboard/instructions.json";
import drivers from "@lapmonitor/drivers/drivers.json";
import { logger } from "@framework/logger";

setupMenuCommands("page-clubleaderboard-instructions");
renderLeaderboardInstuctions(data);
renderFinish();

function renderLeaderboardInstuctions(data: { content: any }) {
  logger.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  renderBreadcrumbs(contentarea);
  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section: any) => {
      logger.log(section);
      renderSection(sectionsdiv, section, "", "", drivers);
    });
  }
}

function renderBreadcrumbs(parent: HTMLElement) {
  let elNav = document.createElement("nav");
  elNav.setAttribute("aria-label", "breadcrumb");
  parent.appendChild(elNav);

  let homeUrl = "/"; //http://localhost:8080";
  let clubUrl = homeUrl + "club/";
  let leaderboardUrl = clubUrl + "leaderboard/";

  let ol = createOrderedList(elNav, "breadcrumb section");
  createListItem(ol, "breadcrumb-item", `<a href="${homeUrl}">Home</a>`);
  //createListItem(ol, "breadcrumb-item", `<a href="${clubUrl}">Club</a>`);
  createListItem(
    ol,
    "breadcrumb-item",
    `<a href="${leaderboardUrl}">leaderboard</a>`,
  );
}
