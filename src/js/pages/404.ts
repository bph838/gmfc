import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";

import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/404.json";

setupMenuCommands("page-home");
renderIndex(data);

function renderIndex(data: { content: { hero: any; sections: any[] } }) {
  
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const div = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section: any) => {
      console.log(section);
      renderSection(div, section);
    });
  }
  renderFinish();
}
