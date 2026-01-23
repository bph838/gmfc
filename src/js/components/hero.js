import { createDiv, createH1 } from "@framework/dom";

export function renderHero(data) {
  console.log("renderHero called");

  const hero = document.getElementById("hero");
  if (!hero) {
    console.error("There is no hero id to render to");
    return;
  }

  hero.className = "hero";
  if (data.image) {
    hero.style.backgroundImage = "url('/" + data.image + "')";
    hero.style.backgroundPosition = "center";
    hero.style.backgroundSize = "cover";
    hero.style.backgroundRepeat = "no-repeat";
  }

  if (data.text) {
    const heroTextDiv = createDiv(hero, "container-hero container text-center");
    createH1(heroTextDiv, data.text);
  }

  //setup for alerts div
  createDiv(hero, "alerts-container", "alerts-container");
}
