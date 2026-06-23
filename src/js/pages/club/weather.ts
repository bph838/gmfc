import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/club/weather.json";
import daylight from "@data/daylight/daylight.json";
import { logger } from "@framework/logger";

logger.log("Club Weather page loaded");
setupMenuCommands("page-clubweather");
renderClubWeather(data);
renderFinish();

function renderClubWeather(data: { content: any }) {
  logger.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  if ((window as any).__PRERENDER_INJECTED) return;

  const sectionsdiv = createDiv(
    contentarea,
    "sections",
    "sections-clubweather",
  );

  if (data.content.sections) {
    data.content.sections.forEach((section: { title: any }) => {
      logger.log("Rendering weather section:", section.title);
      renderSection(sectionsdiv, section, "", "", daylight);
    });
  }
}
