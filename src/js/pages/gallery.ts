import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import {
  createDiv,
  fetchContextArea,
  createInput,
  createLabel,
  createSpan,
  renderFinish,
} from "@framework/dom";
import { loadMergedJson } from "@framework/utils";
import data from "@data/pages/gallery/index.json";
import {
  renderGallery,
  setGalleryData,
  getAreVideosIncluded,
} from "@components/gallery";


//import galleryYears from "@data/generated/media/years.json";
//import menu from "@data/generated/menu.json";
let menu:any = null;
let galleryYears:any= null;

const urls = ["/data/media/gallery_data.json", "/data/media/video_data.json"];

const externalPath = data.externalPath || "";

setupMenuCommands("page-gallery", menu);
render(data);

function render(data: any) {
  console.log("Rendering Gallery");
  //If there is a hero image render it
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  contentarea.classList.add("gallery_with_date_picker");

  const gallery_container = createDiv(contentarea, "gallery_container");
  const gallery_date_picker = createDiv(
    contentarea,
    "gallery_date_picker",
    "gallery_date_picker",
  );

  (async () => {
    try {
      const items = await loadMergedJson(
        urls,
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(), // example sort newest first
      );

      console.log(`Gallery Items: ${items.length}`);
      setGalleryData(items, externalPath);
      /*(if (getAreVideosIncluded()) {
        createGalleryFilter(gallery_container);
      }*/
      //display years
      renderYearPicker(gallery_container);

      const sections = createDiv(
        gallery_container,
        "sections",
        "gallery_section_holder",
      );
      //renderGallery(sections, "gallery_all");
      renderFinish();
    } catch (err) {
      console.error(err);
    }
  })();
}

function createGalleryFilter(parent: HTMLElement) {
  const filterDiv = createDiv(
    parent,
    "btn-group  mb-3 gallery_selector", //
    "mediaFilter",
    "group",
  );

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "mediaType",
    "gallery_all",
    "gallery_all",
    true,
  );
  createLabel(filterDiv, "btn btn-outline-primary", "gallery_all", "All");

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "mediaType",
    "gallery_images",
    "gallery_images",
  );
  createLabel(filterDiv, "btn btn-outline-primary", "gallery_images", "Images");

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "mediaType",
    "gallery_videos",
    "gallery_videos",
  );
  createLabel(filterDiv, "btn btn-outline-primary", "gallery_videos", "Videos");

  document.querySelectorAll<HTMLInputElement>('input[name="mediaType"]').forEach((input) => {
    input.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      console.log("input changed:" + target.value);
      const type = target.value;
      let gallery_section_holder = document.getElementById(
        "gallery_section_holder",
      );
      if (gallery_section_holder) {
        renderGallery(gallery_section_holder, type,"none");
      }
    });
  });

  return filterDiv;
}

function renderYearPicker(parent: HTMLElement) {
  const holder = createDiv(parent, "gallery_section_year_picker");

  const sectionmenuDiv = document.createElement("nav");
  sectionmenuDiv.className = "menu-grid-year";
  sectionmenuDiv.ariaLabel = "Page sections";
  holder.appendChild(sectionmenuDiv);

  //order the year desc
  galleryYears.sort((a: number, b: number) => b - a);

  galleryYears.forEach((year: number) => {
    console.log(`/gallery/${year}/`);
    const menu = document.createElement("a");
    menu.className = "menu-tile";
    menu.href = `/gallery/${year}/`;
    sectionmenuDiv.appendChild(menu);

    createSpan(menu, "tile-dot");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid");
    /*if (item.icon) {
      icon.classList.add(item.icon);
    }*/
    icon.classList.add("tile-icon");
    menu.appendChild(icon);
    createSpan(menu, "tile-label", String(year));
  });
}
