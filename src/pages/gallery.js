import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  createImage,
  fetchContextArea,
  createInput,
  createLabel,
} from "@framework/dom";
import { fetchJson, loadMergedJson } from "@framework/utils";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import data from "@data/pages/gallery.json";
import { createLink } from "../js/framework/dom";

const urls = ["/data/media/gallery_data.json", "/data/media/video_data.json"];

let yearSections = [];
let Loaded_Gallery_Data = null;
const externalPath = data.externalPath || "";
setupMenuCommands("page-gallery");
render(data);

function render(data) {
  console.log("Rendering Gallery");
  //If there is a hero image render it
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  contentarea.classList.add("gallery_container");

  const filterDiv = createDiv(
    contentarea,
    "btn-group  mb-3 gallery_selector",//
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

  const sections = createDiv(contentarea, "sections", "gallery_section_holder");

  document.querySelectorAll('input[name="mediaType"]').forEach((input) => {
    input.addEventListener("change", (e) => {
      console.log("input changed:" + e.target.value);
      const type = e.target.value;
      let gallery_section_holder = document.getElementById(
        "gallery_section_holder",
      );
      if (gallery_section_holder) {
        renderGallery(gallery_section_holder, type);
      }
    });
  });

  (async () => {
    try {
      const items = await loadMergedJson(
        urls,
        (a, b) => new Date(b.date) - new Date(a.date), // example sort newest first
      );

      Loaded_Gallery_Data = items;
      renderGallery(sections, "gallery_all");
    } catch (err) {
      console.error(err);
    }
  })();
}

function renderGallery(sections, type) {
  console.log(type);
  //clear the element out
  while (sections.firstChild) {
    sections.removeChild(sections.firstChild);
  }

  //create a div to hold the gallery
  const gallerydiv = createDiv(sections, "gallery");

  if (Loaded_Gallery_Data && Array.isArray(Loaded_Gallery_Data)) {
    Loaded_Gallery_Data.forEach((galleryItem) => {
      let isVideo = "youtubeurl" in galleryItem;
      let isImage = "name" in galleryItem;
      switch (type) {
        default:
        case "gallery_all":
          if (isImage) renderGalleryImage(galleryItem, gallerydiv);
          if (isVideo) renderGalleryVideo(galleryItem, gallerydiv);
          break;
        case "gallery_images":
          if (isImage) renderGalleryImage(galleryItem, gallerydiv);
          break;
        case "gallery_videos":
          if (isVideo) renderGalleryVideo(galleryItem, gallerydiv);
          break;
      }
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

function checkGalleryYearDiv(parent, date) {
  let dateObj = new Date(date.replace(" ", "T"));
  let year = dateObj.getFullYear();

  let yearDiv = document.getElementById(`galleryyear-${year}`);
  if (!yearDiv) {
    yearDiv = createDiv(parent, "gallery-year-section", `galleryyear-${year}`);

    const yearHeader = createDiv(yearDiv, "gallery-year-header");
    yearHeader.textContent = year;
    yearSections.push(yearDiv.id);
  }
  return yearDiv;
}

function renderGalleryImage(image, galleryDiv) {
  // Normalise slashes just in case (\ vs /)
  const normalised = image.name.replace(/\\/g, "/");

  let directory = "";
  let filename = normalised;

  if (normalised.includes("/")) {
    const parts = normalised.split("/");
    filename = parts.pop(); // last item = file name
    directory = parts.join("/"); // rest = directory
  }

  let imgPath = externalPath;
  let imgThumbNamePath = ""; //;
  if (directory.length > 1) {
    imgPath += directory + "/" + filename;
    imgThumbNamePath = `${externalPath}${directory}/thumbnails/${filename}`;
  } else {
    imgPath += "/" + filename;
    imgThumbNamePath = `${externalPath}/thumbnails/${filename}`;
  }

  let yearDiv = checkGalleryYearDiv(galleryDiv, image.date);

  const alink = createLink(yearDiv, imgPath);
  alink.setAttribute("data-pswp-width", image.width);
  alink.setAttribute("data-pswp-height", image.height);
  createImage(alink, imgThumbNamePath, null, image.name, true);
}

function renderGalleryVideo(video, galleryDiv) {
  let yearDiv = checkGalleryYearDiv(galleryDiv, video.date);
  let title = "";
  if (video.title) title = video.title;
  //let youTubeEmbed = `<iframe width='1335' height='751' src='https://www.youtube.com/embed/SAgHBWnJ4VA' title='Flyover Gordano Model Flying Club' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>`;
  let youTubeEmbed = `<iframe class='if_video' src='${video.youtubeurl}' title='${title}' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'  allowfullscreen></iframe>`;

  let innerDiv = createDiv(yearDiv, "gallery_video_holder");
  innerDiv.innerHTML = youTubeEmbed;
}
