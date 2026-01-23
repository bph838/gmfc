import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { fetchContextArea,createDiv } from "@framework/dom";
import { fetchJson,setPageTitle,setMeta } from "@framework/utils";

const newsUrl = "data/pages/news.json";
const newsItemUrl = "news.html";

setupMenuCommands("page-news");
const hash = window.location.hash; // "#123" or "" if none
if (hash) {
  const newsHash = hash.substring(1);
  console.log(`news hash found: ${newsHash}`);
  renderNewsItem(newsHash);
} else {
  renderNews(newsUrl);
}

function renderNews(url) {
  fetchJson(url).then((data) => {
    console.log(`Looking for news ${url}`);

    if (!data) {
      console.log("No news to render");
    } else {
      renderClubNews(data);
    }
  });
}

function renderClubNews(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea,"sections");

  //render th news
  if (data.content.sections && data.content.sections.length > 0) {
    const newsSections = data.content.sections;
    newsSections.sort(
      (a, b) =>
        new Date(b.date.replace(" ", "T")) - new Date(a.date.replace(" ", "T")),
    );

    data.content.sections.forEach((section) => {
      renderSection(sectionsdiv, section, newsItemUrl, "sectionline");
    });
  }
}

function renderNewsItem(newsHash) {
  const url = "data/newsitems/" + newsHash + ".json";

  fetchJson(url).then((data) => {
    console.log(`Looking for news ${url}`);
    if (!data) {
    } else {
      // Render the news
      renderClubNews(data);
      if(data.content.sections.length===1)
        setDiscoverables(data.content.sections[0]);
    }
  });
}

function setDiscoverables(data) {
  console.log("setDiscoverables");
  if (data.title) {
    setPageTitle(data.title);
  }

  if (data.image) {
    setMeta("og:image", data.image);
  }
}
