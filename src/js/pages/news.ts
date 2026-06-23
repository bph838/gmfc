import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  fetchContextArea,
  createDiv,
  renderFinish,
  createOrderedList,
  createListItem,
} from "@framework/dom";
import {
  fetchJson,
  setPageTitle,
  setMeta,
  isAbsoluteUrl,
  getLongMonthName,
  setSiteImage,
  setSiteTitle,
} from "@framework/utils";
import { SITE_TITLE, SITE_ADDRESS } from "@components/constants";

import data from "@data/pages/news.json";
import { logger } from "@framework/logger";

const newsItemUrl = "news";

setupMenuCommands("page-news");
logger.log("Rending news");
renderNews(data);

function renderNews(data: any) {
  if (data.content.hero) renderHero(data.content.hero, false);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return Promise.resolve();
  const news_sections_Id = "news_sections";
  const elFound = document.getElementById(news_sections_Id);
  if (elFound) return Promise.resolve();
  const sectionsdiv = createDiv(contentarea, "sections", news_sections_Id);

  const newsItem = window.MY_NEWS_ITEM;

  if (newsItem && newsItem.type === "single" && newsItem.json) {
    return renderSingleNewsItem(sectionsdiv, newsItem.json);
  } else if (newsItem && newsItem.type === "list" && newsItem.json) {
    const newUrl = newsItem.json;

    let breadlineType: string;
    if (newsItem.month && newsItem.month !== "0") breadlineType = "month";
    else if (newsItem.year && newsItem.year !== "0") breadlineType = "year";
    else breadlineType = "none";
    renderNewsBreadline(
      sectionsdiv,
      newsItem.year ?? 0,
      newsItem.month ?? 0,
      breadlineType,
    );

    return fetchJson(newUrl)
      .then((news_items) => {
        if (!news_items) return;
        return Promise.all(
          news_items.map((news_section: any) =>
            fetchNews(sectionsdiv, news_section, newsItem.year, newsItem.month),
          ),
        );
      })
      .catch((err) => logger.error("Failed to render news list:", err))
      .then(() => renderFinish());
  } else {
    const newUrl = data.newsUrl;

    renderNewsBreadline(sectionsdiv, 0, 0, "none");
    return fetchJson(newUrl)
      .then((news_items) => {
        if (!news_items) return;
        return Promise.all(
          news_items.map((news_section: any) => fetchNews(sectionsdiv, news_section)),
        );
      })
      .catch((err) => logger.error("Failed to render news list:", err))
      .then(() => renderFinish());
  }
}

function fetchNews(
  parent: HTMLElement,
  news_section: any,
  year: string | null = null,
  month: string | null = null,
) {  
  const url = news_section.url;
  const urlJson = news_section.jsondata;
  if (!urlJson || !url) return Promise.resolve();
  return renderNewsItem(parent, urlJson, url);
}

function renderNewsItem(parent: HTMLElement, urlJson: string, url: string) {
  logger.log("Fetching news item: ");
  const newholderdiv = createDiv(parent, "section_generated_news");
  return fetchJson(urlJson).then((news) => {  
    if (!news) {
      newholderdiv.classList.remove("section_generated_news");
      return;
    }
    let showhide = news.showhide ?? true;
    if (showhide)
      return renderSection(newholderdiv, news, url, "sectionline", [], true);
    newholderdiv.classList.remove("section_generated_news");
  });
}

function renderSingleNewsItem(parent: HTMLElement, urlJson: string) {
  logger.log("Fetching news item: ");
  return fetchJson(urlJson).then((news) => { 
    if (!news) {
      logger.error(`Failed to load single news item: ${urlJson}`);
      renderNewsBreadline(parent, 0, 0, "none");
      renderFinish();
      return;
    }
    if (news.image) {
      setSiteImage(news.image);
    }
    if (news.title) {
      setSiteTitle(news.title);
    }

    const date = new Date(news.date);

    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;

    renderNewsBreadline(parent, year, month);
    return renderSection(parent, news, "", "sectionline", [], true).then(() =>
      renderFinish(),
    );
  }).catch((err) => {
    logger.error("Failed to render single news item:", err);
    renderFinish();
  });
}

function renderNewsBreadline(
  parent: HTMLElement,
  year: number | string,
  monthd: number | string,
  type = "yearmonth",
) {
  let month = monthd.toString().padStart(2, "0");
  let elNav = document.createElement("nav");
  elNav.setAttribute("aria-label", "breadcrumb");
  parent.appendChild(elNav);

  //http://localhost:8080/news/2026/02/car-park-fence-replacement
  let homeUrl = ""; //http://localhost:8080";
  let newsUrl = homeUrl + "/news/";
  let newsYearUrl = newsUrl + `${year}/`;
  let newsYearMonthUrl = newsYearUrl + `${month}/`;

  let ol = createOrderedList(elNav, "breadcrumb section");
  //createListItem(ol, "breadcrumb-item", `<a href="${homeUrl}">Home</a>`);
  switch (type) {
    case "yearmonth":
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearUrl}">${year}</a>`,
      );
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearMonthUrl}">${getLongMonthName(month)}</a>`,
      );
      break;
    case "year":
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearUrl}">${year}</a>`,
      );
      break;
    case "month":
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearUrl}">${year}</a>`,
      );
      createListItem(
        ol,
        "breadcrumb-item",
        `<a href="${newsYearMonthUrl}">${getLongMonthName(month)}</a>`,
      );
      break;
    case "none":
      createListItem(ol, "breadcrumb-item", `<a href="${newsUrl}">News</a>`);
      break;
  }
}
