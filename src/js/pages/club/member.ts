import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/club/member.json";
import { logger } from "@framework/logger";

setupMenuCommands("page-clubmember");
renderClubMemberOptions(data);
renderFinish();

function renderClubMemberOptions(data: { content: any; }) {
  logger.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  data.content.sections?.forEach((section: any) => {
    logger.log(section);
    renderSection(sectionsdiv, section);
  });
}
