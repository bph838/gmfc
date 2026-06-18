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

import data from "@data/pages/club/member/prospective.json";

setupMenuCommands("page-clubmemberprospective");
renderMemberProspective(data);
renderFinish();

function renderMemberProspective(data: { content: any }) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  renderMemberProspectiveBreadcrumb(contentarea);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  data.content.sections?.forEach((section: any) => {
    console.log(section);
    renderSection(sectionsdiv, section);
  });
}

export function renderMemberProspectiveBreadcrumb(parent: HTMLElement) {
  let elNav = document.createElement("nav");
  elNav.setAttribute("aria-label", "breadcrumb");

  parent.appendChild(elNav);

  let homeUrl = "/";
  let memberUrl = homeUrl + "club/member/";

  let ol = createOrderedList(elNav, "breadcrumb section");
  createListItem(ol, "breadcrumb-item", `<a href="${homeUrl}">Home</a>`);
  createListItem(
    ol,
    "breadcrumb-item",
    `<a href="${memberUrl}">Member Options</a>`,
  );
}
