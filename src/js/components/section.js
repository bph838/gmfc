import {
  createDiv,
  createSection,
  createH2,
  createSpan,
  createLink,
  createImage,
  createParagraph,
} from "@framework/dom";
import { initaliseCarousel, onRotate } from "@framework/carousel3d";

export function renderSection(parent, data, pageurl = "", extraclass = "") {
  if (!data) {
    console.error("There is no data to render");
    return;
  }
  if (!data.type) {
    console.error("There is no section type to render");
    return;
  }

  if (process.env.NODE_ENV === "development") {
    if (data.title) {
      console.log(`Rendering Section ${data.title}`);
    }
  }

  let id = "";
  if (data.id) id = data.id;

  let section = null;
  if (data.customsection) {
    section = createSection(parent, data.customsection + " " + extraclass, id);
  } else {
    section = createSection(parent, "section " + extraclass, id);
  }

  const contentdiv = createDiv(section, "section_content");

  //render title
  if (data.title) {
    const titlediv = createDiv(contentdiv, "section_title");
    const titleText = createH2(titlediv, data.title);
  }

  //render header
  if (data.date) {
    const date = new Date(data.date);
    const text = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    const headerdiv = createDiv(contentdiv, "section_header");
    createSpan(headerdiv, "section_date", text);

    console.log("a");
    //a link can be added with a hash as the anchor
    if (data.hash && pageurl.length > 1) {
      let url = `/${pageurl}#${data.hash}`;
      section.id = url;
      createLink(
        headerdiv,
        url,
        "sectionlink",
        "<i class='fa-solid fa-link'></i>",
      );
    }
  }

  switch (data.type) {
    default:
      console.error("Unable to render " + data.type);
      break;
    case "wrappedTextLeft":
      renderWrappedTextLeftSection(contentdiv, data);
      break;
    case "noImage":
      renderSectionNoImage(contentdiv, data);
      break;
    case "carousel":
      renderCarousel(contentdiv, data);
      break;
    case "imageLeft":
      renderImageLeft(contentdiv, data);
      break;
    case "imageRight":
      renderImageRight(contentdiv, data);
      break;
    case "imagesLeft":
      renderImagesLeft(contentdiv, data);
      break;
    case "imagesRight":
      renderImagesRight(contentdiv, data);
      break;
  }

  //If there are any pdf links to render
  renderPDFLinks(contentdiv, data);
  return section;
}

function renderWrappedTextLeftSection(parent, data) {
  if (!data.text || !data.image) {
    console.error("Unable to render renderSectionWrappedTextLeft");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_wrap_left");
  createImage(innerdiv, data.image);

  data.text.forEach((text) => {
    createParagraph(innerdiv, text);
  });
}

export function renderPDFLinks(pageSection, data) {
  console.log("Checking for PDF links to render");
  if (data.pdfs && data.pdfs.length > 0) {
    const pdfsDiv = document.createElement("div");
    pdfsDiv.className = "pdfLinks";
    pageSection.appendChild(pdfsDiv);

    data.pdfs.forEach((pdf) => {
      const pdfDiv = document.createElement("div");
      pdfDiv.className = "pdfdoc";
      pdfsDiv.appendChild(pdfDiv);

      const pdfLink = document.createElement("a");
      pdfLink.href = pdf.url;
      pdfLink.target = "_blank";
      pdfDiv.appendChild(pdfLink);

      const imgPDF = document.createElement("img");
      imgPDF.src = "/images/pdf.png";
      imgPDF.class = "pdfimage";
      pdfLink.appendChild(imgPDF);

      const spanPDF = document.createElement("span");
      spanPDF.innerHTML = pdf.text;
      spanPDF.class = "pdfimagedesc";
      pdfLink.appendChild(spanPDF);
    });
  }
}

function renderSectionNoImage(pageSection, data) {
  if (!data.text) {
    console.error("Unable to render renderSectionNoImage");
    return;
  }

  const sectiondiv = createDiv(pageSection, "sectionTextDiv");

  data.text.forEach((text) => {
    createParagraph(sectiondiv, text);
  });
}

function renderCarousel(pageSection, data) {
  if (!data.images) {
    console.error("Unable to render renderSectionNoImage");
    return;
  }

  const carouseldiv = createDiv(pageSection, "carousel3D", "carousel3D");

  data.images.forEach((image) => {
    const carouselitemdiv = createDiv(carouseldiv, "element3D");
    let alt = "";
    if (image.alt) alt = image.alt;
    createImage(carouselitemdiv, image.src, "carouselImage", alt);
  });
  initaliseCarousel("carousel3D");
}

function renderImageLeft(parent, data) {
  if (!data.text || !data.image) {
    console.error("Unable to render renderImageLeft");
    return;
  }
  const innerdiv = createDiv(parent, "section_inner_image_left row");

  const leftdiv = createDiv(innerdiv, "section_left");
  createImage(leftdiv, data.image);

  const rightdiv = createDiv(innerdiv, "section_right col");
  data.text.forEach((text) => {
    createParagraph(rightdiv, text);
  });
}

function renderImageRight(parent, data) {
  if (!data.text || !data.image) {
    console.error("Unable to render renderImageRight");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_image_right row");

  const leftdiv = createDiv(innerdiv, "section_left col");
  data.text.forEach((text) => {
    createParagraph(leftdiv, text);
  });

  const rightdiv = createDiv(innerdiv, "section_right");
  createImage(rightdiv, data.image);
}

function renderImagesLeft(parent, data) {
  if (!data.text || !data.images) {
    console.error("Unable to render renderImagesLeft");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_images_left_row row");

  const leftdiv = createDiv(innerdiv, "section_images_left");
  createImages(leftdiv, data.images);

  const rightdiv = createDiv(innerdiv, "section_right col");
  data.text.forEach((text) => {
    createParagraph(rightdiv, text);
  });

  addScriptToMakeAcive("section_images_left");
}

function renderImagesRight(parent, data) {
  if (!data.text || !data.images) {
    console.error("Unable to render renderImagesLeft");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_images_right_row row");

  const leftdiv = createDiv(innerdiv, "section_right col");
  data.text.forEach((text) => {
    createParagraph(leftdiv, text);
  });

  const rightdiv = createDiv(innerdiv, "section_images_right");
  createImages(rightdiv, data.images);

  

  addScriptToMakeAcive("section_images_right");
}

function createImages(parent, images) {
  images.forEach((image) => {
    createImage(parent, image.src);
  });
}

function addScriptToMakeAcive(className) {
  document.querySelectorAll(`.${className} img`).forEach((img) => {
    img.addEventListener("click", () => {
      document
        .querySelectorAll(`.${className} img`)
        .forEach((i) => i.classList.remove("active"));

      img.classList.add("active");
    });
  });
}
