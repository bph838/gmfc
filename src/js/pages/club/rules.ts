import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  createOrderedList,
  createListItem,
} from "@framework/dom";

import data from "@data/pages/club/rules.json";

setupMenuCommands("page-clubrules");
renderClubRules(data);
renderFinish();

function renderClubRules(data: { content: any; }) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section: any) => {
      console.log(section);
      renderSection(sectionsdiv, section);
    });
  }
}

