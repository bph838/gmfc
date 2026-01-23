import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea } from "@framework/dom";
import { fetchJson } from "@framework/utils";
import PhotoSwipeLightbox from "photoswipe/lightbox";

import data from "@data/pages/gallery.json";
const dataurl = "/data/media/gallery_data.json";

let yearSections = [];

setupMenuCommands("page-gallery");
renderGallery(data);

function renderGallery(data) {
  console.log("Rendering Gallery");
  //If there is a hero image render it
  if (data.content.hero) renderHero(data.content.hero);

  
  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sections = createDiv(contentarea, "sections");

    console.log("Loading Gallery");
  fetchJson(dataurl).then((galleryData) => {
    console.log("Gallery Data Loaded", galleryData);
    const externalPath = data.externalPath || "";
    if (!galleryData) {
      console.log("no images");
      return;
    }
    //need to sort the images by date order
    galleryData.sort(
      (a, b) =>
        new Date(b.date.replace(" ", "T")) - new Date(a.date.replace(" ", "T")),
    );

    //create a div to hold the gallery
    const gallerydiv = createDiv(sections, "gallery"); 

    if (galleryData && Array.isArray(galleryData)) {
      galleryData.forEach((image) => {
        renderGalleryImage(image, gallerydiv, externalPath);
      });
    }

    yearSections.forEach((yearDivId) => {
      //Initialize PhotoSwipe Lightbox
      let lightbox = new PhotoSwipeLightbox({
        gallery: `#${yearDivId}`,
        children: "a",
        pswpModule: () => import("photoswipe"),
      });
      lightbox.init();
    });
    
  });
  
}


function renderGalleryImage(image, galleryDiv, externalPath) {
  let imgPath = `${externalPath}/${image.name}`;
  let imgThumbNamePath = `${externalPath}/thumbnails/${image.name}`;
  let dateObj = new Date(image.date.replace(" ", "T"));
  let year = dateObj.getFullYear();

  let yearDiv = document.getElementById(`galleryyear-${year}`);
  if (!yearDiv) {
    yearDiv = document.createElement("div");
    yearDiv.id = `galleryyear-${year}`;
    yearDiv.className = "gallery-year-section";
    galleryDiv.appendChild(yearDiv);
    const yearHeader = document.createElement("h2");
    yearHeader.textContent = year;
    yearHeader.className = "gallery-year-header";
    yearDiv.appendChild(yearHeader);
    yearSections.push(yearDiv.id);
  }

  const alink = document.createElement("a");
  alink.href = imgPath;
  alink.setAttribute("data-pswp-width", image.width);
  alink.setAttribute("data-pswp-height", image.height);
  alink.target = "_blank";
  yearDiv.appendChild(alink);

  const img = document.createElement("img");
  img.src = imgThumbNamePath;
  img.alt = image.name;
  alink.appendChild(img); 
}

