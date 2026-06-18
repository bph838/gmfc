import {
  createDiv,
  fetchContextArea,
  renderFinish,
  createOrderedList,
  createListItem,
} from "@framework/dom";

export function renderRulesBreadcrumb(parent: HTMLElement) {
  let elNav = document.createElement("nav");
  elNav.setAttribute("aria-label", "breadcrumb");
  parent.appendChild(elNav);

  let homeUrl = "";
  let rulesUrl = homeUrl + "/club/rules/";

  let ol = createOrderedList(elNav, "breadcrumb section");
  createListItem(ol, "breadcrumb-item", `<a href="${rulesUrl}">Back</a>`);
}
