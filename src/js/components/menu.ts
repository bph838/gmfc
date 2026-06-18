/**
 * Sets up click handlers for navbar links to:
 * 1. Mark the clicked link as active.
 * 2. Close the Bootstrap navbar collapse menu.
 * 3. Smoothly scroll to the corresponding section on the page.
 *
 * Expects each nav-link to have a `data-menu` attribute matching the ID of its target section.
 */

import { initCopyrightYear, initMenuName } from "./initpage";
import {
  createUnOrderedList,
  createListItem,
  createLink,
  emptyDiv,
} from "@framework/dom";
//import { getLongMonthName, fetchJson } from "@framework/utils";

import { SITE_TITLE } from "@components/constants";
import galleryYears from "@data/generated/years.json";
import menujson from "@data/generated/menu.json";

export function setupMenuCommands(activeClass = "page-home") {
  const navbarCollapseEl = document.querySelector(".navbar-collapse");
  if (!navbarCollapseEl) return;

  const navLinks = document.querySelectorAll<HTMLElement>(".nav-link");
  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (page === activeClass) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  initCopyrightYear();
  initMenuName(SITE_TITLE);
  initMenuNews();
  initGalleryYears();
  checkItemsForSale();
}

function initMenuNews() {
  if (!menujson) return;

  const el = document.getElementById("nav-news-menu");
  if (!el) return;
  el.classList.add("dropdown");

  let menuEl = null;
  const elOl = document.getElementById("nav-news-menu-ol");
  if (!elOl) {
    menuEl = createUnOrderedList(el, "dropdown-menu", "nav-news-menu-ol");
  } else {
    menuEl = elOl;
    emptyDiv(menuEl);
  }

  menujson.forEach((year) => {
    let yearText = year.year.toString();
    let yearUrl = `/news/${year.year}/`;

    const liYear = createListItem(menuEl, "nav-item ");
    const aYear = createLink(
      liYear,
      yearUrl,
      "dropdown-item",
      yearText,
      "_self",
    );
  });
}

function initGalleryYears() {
  console.log("Gallery Year menu");
  const el = document.getElementById("nav-gallery-menu");
  if (!el) return;
  el.classList.add("dropdown");

  let menuEl = null;
  const elOl = document.getElementById("nav-gallery-menu-ol");
  if (!elOl) {
    menuEl = createUnOrderedList(el, "dropdown-menu", "nav-gallery-menu-ol");
  } else {
    menuEl = elOl;
    emptyDiv(menuEl);
  }

  //order the year desc
  galleryYears.sort((a: number, b: number) => b - a);

  galleryYears.forEach((year: { toString: () => any }) => {
    let yearText = year.toString();
    let yearUrl = `/gallery/${year}/`;

    const liYear = createListItem(menuEl, "nav-item ");
    const aYear = createLink(
      liYear,
      yearUrl,
      "dropdown-item",
      yearText,
      "_self",
    );
  });
}

function checkItemsForSale() {
  let saleUrl = "/data/pages/club/selling/generated/_index.json";

  /*
  fetchJson(saleUrl).then((selling_items: any[]) => {
    if (!selling_items || selling_items.length === 0) {
      removeElement("clubsellingitemsmenu");
      removeElement("clubsellingitemsdiv");
    }
    let found = 0;
    selling_items.forEach((element: { expires: string | number | Date }) => {
      const expires = new Date(element.expires);
      const now = new Date();
      if (expires > now) found++;
    });
    if (found === 0) {
      removeElement("clubsellingitemsmenu");
      removeElement("clubsellingitemsdiv");
    }
  });
  */
}

function removeElement(id: string) {
  const ele = document.getElementById(id);
  if (ele) ele.remove();
}
