import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea } from "@framework/dom";
import data from "@data/pages/club/weather.json";

console.log("Club Weather page loaded");
setupMenuCommands("page-clubweather");
renderClubWeather(data);


function renderClubWeather(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(sectionsdiv, section);
    });
  }
}

