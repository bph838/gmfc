import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, createImage, fetchContextArea } from "@framework/dom";
import { fetchJson, loadMergedJson } from "@framework/utils";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import data from "@data/pages/gallery.json";
import { createLink } from "../js/framework/dom";

const urls = ["/data/media/gallery_data.json", "/data/media/video_data.json"];

let yearSections = [];

setupMenuCommands("page-gallery");
render(data);

function render(data) {
  console.log("Rendering Gallery");
  //If there is a hero image render it
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sections = createDiv(contentarea, "sections");

  (async () => {
    try {
      const items = await loadMergedJson(
        urls,
        (a, b) => new Date(b.date) - new Date(a.date), // example sort newest first
      );

      console.log(items);
      renderGallery(items,sections);
    } catch (err) {
      console.error(err);
    }
  })();
}

function renderGallery(data,sections) {
  console.log(data);
}

/*




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
    */

function renderGalleryImage(image, galleryDiv, externalPath) {
  // Normalise slashes just in case (\ vs /)
  const normalised = image.name.replace(/\\/g, "/");

  let directory = "";
  let filename = normalised;

  if (normalised.includes("/")) {
    const parts = normalised.split("/");
    filename = parts.pop(); // last item = file name
    directory = parts.join("/"); // rest = directory
  }

  //console.log("Directory:", directory);
  //console.log("Filename:", filename);

  let imgPath = externalPath;
  let imgThumbNamePath = ""; //;
  if (directory.length > 1) {
    imgPath += directory + "/" + filename;
    imgThumbNamePath = `${externalPath}${directory}/thumbnails/${filename}`;
  } else {
    imgPath += "/" + filename;
    imgThumbNamePath = `${externalPath}/thumbnails/${filename}`;
  }

  let dateObj = new Date(image.date.replace(" ", "T"));
  let year = dateObj.getFullYear();

  if (year < 2015) console.log("found date");
  let yearDiv = document.getElementById(`galleryyear-${year}`);
  if (!yearDiv) {
    yearDiv = createDiv(
      galleryDiv,
      "gallery-year-section",
      `galleryyear-${year}`,
    );

    const yearHeader = createDiv(yearDiv, "gallery-year-header");
    yearHeader.textContent = year;
    yearSections.push(yearDiv.id);
  }

  const alink = createLink(yearDiv, imgPath);
  alink.setAttribute("data-pswp-width", image.width);
  alink.setAttribute("data-pswp-height", image.height);
  createImage(alink, imgThumbNamePath, null, image.name, true);
}
