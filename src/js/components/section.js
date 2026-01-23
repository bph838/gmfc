import {
  createDiv,
  createSection,
  createH2,
  createSpan,
  createLink,
  createImage,
  createParagraph,
} from "@framework/dom";

export function renderSection(parent, data, pageurl = "", extraclass='') {
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

  const section = createSection(parent, "section "+ extraclass);
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
    case "wrappedTextLeft":
      renderWrappedTextLeftSection(contentdiv, data);
      break;
  }
}

function renderWrappedTextLeftSection(parent, data) {
  if (!data.text || !data.image) {
    console.error("Unable to render renderSectionWrappedTextLeft");
    return;
  }

  const innerdiv = createDiv(parent, "section_inner_wrap_left");
  createImage(innerdiv, data.image);

  data.text.forEach((text) => {
    createParagraph(innerdiv,text)    
  });


}
