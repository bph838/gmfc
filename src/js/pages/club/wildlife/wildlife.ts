import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/club/wildlife/wildlife.json";
import { logger } from "@framework/logger";

setupMenuCommands("page-clubnature");
renderWildlife(data);
renderFinish();

function renderWildlife(data: { content: any; }) {
  logger.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section: any) => {
      logger.log(section);
      renderSection(sectionsdiv, section);
    });
  }
}
