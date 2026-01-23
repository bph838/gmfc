import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import data from "@data/pages/index.json";

setupMenuCommands("page-home");
renderIndex(data);

function renderIndex(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

    const contentarea = document.getElementById("contentarea");
      const sectionsDiv = document.createElement("div");
    sectionsDiv.className = "sections";
    contentarea.appendChild(sectionsDiv);
}
