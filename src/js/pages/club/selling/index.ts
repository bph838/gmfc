import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import {
  renderSection,
  renderSectionNoImage,
  renderSellingGallery,
} from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  createOrderedList,
  createListItem,
  createParagraph,
  createLink,
} from "@framework/dom";
import { fetchJson } from "@framework/utils";

import data from "@data/pages/club/selling/selling.json";
import { logger } from "@framework/logger";

const externalPath = data.externalPath;
let hash = window.location.hash;
if (hash.length > 1) hash = hash.substring(1);

setupMenuCommands("page-clubselling");
if (hash) renderClubSellingLot(data, hash);
else renderClubSelling(data);
renderFinish();

function renderClubSelling(data: { content: any; externalPath?: string }) {
  logger.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");
  data.content.sections?.forEach((section: any) => {
    logger.log(section);
    renderSection(sectionsdiv, section);
  });

  const salediv = createDiv(sectionsdiv, "section-sales");

  //need to read _index.json
  let saleUrl = "/data/selling/_index.json";
  fetchJson(saleUrl).then((selling_items) => {
    let itemsFound = false;
    if (selling_items) {
      selling_items.forEach(
        (item: { hash: any; title: any; expires: string | number | Date }) => {
          const hash = item.hash;
          const title = item.title;
          const expires = new Date(item.expires);
          if (expires >= new Date()) {
            itemsFound = true;
            const sellDiv = createDiv(salediv, "selling_item");
            const href = `/club/selling/index.html#${hash}`;
            createLink(sellDiv, href, null, title, "_self");
          }
        },
      );
    }

    if (!itemsFound) {
      createParagraph(salediv, "There are no items to list at the moment");
    }
  });
}

function renderClubSellingLot(
  data: { content: any; externalPath?: string },
  lotHash: any,
) {
  logger.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  let saleUrl = `/data/selling/${lotHash}.json`;
  fetchJson(saleUrl).then((selling_item) => {
    if (selling_item) {
      const expiry = new Date(selling_item.date);
      expiry.setDate(expiry.getDate() + Number(selling_item.period));
      logger.log(expiry);
      const now = new Date();

      if (now > expiry) {
        const textdiv = createDiv(sectionsdiv, "section");
        const text = {
          text: ["These items are no longer available"],
        };
        renderSectionNoImage(textdiv, text);
      } else {
        if (selling_item.title) {
          let heroTitleDiv = document.getElementById("container-h1");
          let heroTitle = heroTitleDiv?.getElementsByTagName("h1")[0];
          if (heroTitle) {
            heroTitle.innerHTML = selling_item.title;
          }
        }

        logger.log("Processing selling item: ");
        logger.log(selling_item);

        const textdiv = createDiv(sectionsdiv, "section");
        renderSectionNoImage(textdiv, selling_item);

        const gallerytdiv = createDiv(sectionsdiv, "section");
        renderSellingGallery(gallerytdiv, selling_item.images, externalPath);
      }
    }
  });
}
