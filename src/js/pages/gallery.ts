import { setupMenuCommands } from "@components/menu";
import { renderHero, setHeroText } from "@components/hero";
import {
  createDiv,
  fetchContextArea,
  createInput,
  createLabel,
  createSpan,
  createLink,
  renderFinish,
} from "@framework/dom";
import { loadMergedJson } from "@framework/utils";
import data from "@data/pages/gallery/index.json";
import {
  renderGallery,
  setGalleryData,
  getAreVideosIncluded,
} from "@components/gallery";

import galleryYears from "@data/generated/years.json";
import { logger } from "@framework/logger";
setupMenuCommands("page-gallery");
render(data);

function render(data: any) {
  const path = window.location.pathname; // e.g. "/gallery/2026/" or "/gallery/2026/index.html"
  const match = path.match(/^\/gallery\/(\d{4})\/?/);
  const year = match ? Number(match[1]) : null; // null on the plain /gallery/ index

  //If there is a hero image render it
  if (data.content.hero) renderHero(data.content.hero);

  if (!year) {
    renderFullYearPicker();
  } else {
    setHeroText(String(year));
    renderYearGallery(year);
  }
}

function renderYearGallery(year: number) {
  const dataUrl = `/gallery/${year}/gallery_year.json`;
  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const sections = createDiv(contentarea, "sections", "gallery_section_holder");

  (async () => {
    try {
      const items = await loadMergedJson(
        [dataUrl],
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setGalleryData(items, data.externalPath);
      if (year >= 2026) {
        renderGallery(sections, "gallery_all", "months");
      } else {
        renderGallery(sections, "gallery_all");
      }
      renderPrevNext(year);
      renderFinish();
    } catch (err) {
      logger.error(err);
    }
  })();
}

function renderPrevNext(year: number) {
  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const sectionmenuDiv = document.createElement("nav");
  sectionmenuDiv.className = "menu-grid";
  sectionmenuDiv.ariaLabel = "Page sections";
  contentarea.appendChild(sectionmenuDiv);

  const years = galleryYears as number[];
  const index = years.indexOf(year);
  if (index === -1) return;

  const prevYear = index + 1 < years.length ? years[index + 1] : null;
  const nextYear = index > 0 ? years[index - 1] : null;

  if (prevYear !== null) {
    createTileLink(sectionmenuDiv, prevYear, "fa-circle-left");
  }

  if (nextYear !== null) {
    createTileLink(sectionmenuDiv, nextYear, "fa-circle-right");
  }
}

function createTileLink(parent: HTMLElement, year: number, tileIcon: string) {
  const menu = document.createElement("a");
  menu.className = "menu-tile tile-green";
  menu.href = `/gallery/${year}/`;
  parent.appendChild(menu);

  createSpan(menu, "tile-dot");
  const icon = document.createElement("i");
  icon.classList.add("fa-solid");
  icon.classList.add(tileIcon);
  icon.classList.add("tile-icon");

  menu.appendChild(icon);

  const title = document.createElement("span");
  title.className = "tile-label";
  title.innerHTML = String(year);
  menu.appendChild(title);
}

function renderFullYearPicker() {
  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const holder = createDiv(contentarea, "gallery_section_year_picker");

  const sectionmenuDiv = document.createElement("nav");
  sectionmenuDiv.className = "menu-grid-year";
  sectionmenuDiv.ariaLabel = "Page sections";
  holder.appendChild(sectionmenuDiv);

  galleryYears.forEach((year) => {
    createTileLink(sectionmenuDiv, year, "fa-calendar-days");
  });

  renderFinish();
}
