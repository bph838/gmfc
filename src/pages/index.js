import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv } from "@framework/dom";
import data from "@data/pages/index.json";

setupMenuCommands("page-home");
renderIndex(data);

function renderIndex(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  //render each section
  if (data.content.sections) {
    const div = createDiv(contentarea, "sections");
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(div, section);
    });
  }
}
