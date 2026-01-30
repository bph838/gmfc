/**
 * Sets up click handlers for navbar links to:
 * 1. Mark the clicked link as active.
 * 2. Close the Bootstrap navbar collapse menu.
 * 3. Smoothly scroll to the corresponding section on the page.
 *
 * Expects each nav-link to have a `data-menu` attribute matching the ID of its target section.
 */

import { setPageTitle } from "../framework/utils";
import { initCopyrightYear, initMenuName } from "./initpage";
const { SITE_TITLE } = require("../constants");

export function setupMenuCommands(activeClass = "page-home") {
  console.info("setupMenuCommands");
  const navbarCollapseEl = document.querySelector(".navbar-collapse");
  if (!navbarCollapseEl) return;

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (page === activeClass) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  let title = getPageTitle(activeClass);
  if(title.length>0)
    setPageTitle(title);

  initCopyrightYear();
  initMenuName(SITE_TITLE);
}

function getPageTitle(activeClass) {
  let title = "";
  switch (activeClass) {
    case "page-home":
      title = `${SITE_TITLE}`;
      break;
    case "page-calendar":
      title = `${SITE_TITLE} -  Calendar`;
      break;
    case "page-news":
      title = `${SITE_TITLE} -  News`;
      break;
    case "page-gallery":
      title = `${SITE_TITLE} -  Gallery`;
      break;
    case "page-aboutus":
      title = `${SITE_TITLE} -  About Us`;
      break;
    case "page-clubrules":
      title = `${SITE_TITLE} -  Club Rules`;
      break;
    case "page-clubmerch":
      title = `${SITE_TITLE} -  Merch`;
      break;
    case "page-clubmember":
      title = `${SITE_TITLE} -  Members`;
      break;
    case "page-leaderboard":
      title = `${SITE_TITLE} -  Leaderboard`;
      break;
  }
  return title;
}
