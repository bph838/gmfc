import { createDiv, createH1, createSpan, emptyDiv } from "@framework/dom";
import { setSiteImage } from "@framework/utils";
import { renderAlerts } from "@components/alerts";
import { cookieWarningFunctionality } from "@components/cookiewarning";
import {
  renderWeatherInfo,
  showhideWeather,
  getDaylight,
} from "@components/weatherinfo";
import { logger } from "@framework/logger";

export function renderHero(
  data: { generatehero: boolean; image: string; text: any },
  setimage = true,
) {
  logger.log("renderHero called");

  const hero = document.getElementById("hero");
  if (!hero) {
    logger.error("There is no hero id to render to");
    return;
  }

  let sitepic = "";
  if (data.generatehero && data.generatehero == true) {
    //check for hero type
    const herotype = localStorage.getItem("herotype");
    if (herotype !== null) {
      let url = getImageForHero(herotype);
      hero.style.backgroundImage = "url('" + url + "')";
      sitepic = url;
    } else {
      if (data.image) {
        hero.style.backgroundImage = "url('" + data.image + "')";
        sitepic = data.image;
      }
    }
  } else {
    if (data.image) {
      hero.style.backgroundImage = "url('" + data.image + "')";
      sitepic = data.image;
    }
  }

  if (sitepic.length >= 0 && setimage) {
    setSiteImage(sitepic);
  }

  hero.className = "hero";
  hero.style.backgroundPosition = "center";
  hero.style.backgroundSize = "cover";
  hero.style.backgroundRepeat = "no-repeat";

  if (data.text) {
    const ch1 = document.getElementById("container-h1");
    if (!ch1) {
      const heroTextDiv = createDiv(
        hero,
        "container-hero container text-center",
        "container-h1",
      );
      createH1(heroTextDiv, data.text);
    } else {
      emptyDiv(ch1);
      createH1(ch1, data.text);
    }
  }

  //setup for alerts div
  createDiv(hero, "alerts-container", "alerts-container", "", true);

  //setup fonts for changing the hero image
  const herochangediv = createDiv(
    hero,
    "herochange-container",
    "herochange-container-id",
    "",
    true,
  );

  const planespan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-plane"></i>`,
  );
  const helicopterspan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-helicopter"></i>`,
  );
  const dronespanParent = createSpan(herochangediv, "herochangedronespan");
  const dronespanDiv = createDiv(dronespanParent, "herochangedrone");

  const racecarspan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-car"></i>`,
  );
  const crawlerspan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-truck-pickup"></i>`,
  );

  planespan.addEventListener("pointerup", (event) => {
    changeHeroImage("plane");
  });
  helicopterspan.addEventListener("pointerup", (event) => {
    changeHeroImage("helicopter");
  });
  racecarspan.addEventListener("pointerup", (event) => {
    changeHeroImage("racecar");
  });
  crawlerspan.addEventListener("pointerup", (event) => {
    changeHeroImage("crawler");
  });
  dronespanDiv.addEventListener("pointerup", (event) => {
    changeHeroImage("drone");
  });

  //render any alerts
  renderAlerts();

  //render any weather if we have the coordinates
  const latitude = 51.459563;
  const longitude = -2.790968;

  const watherchangediv = createDiv(
    hero,
    "weatherchange-container",
    "weatherchange-container",
    "",
    true,
  );
  const weatherspan = createSpan(
    watherchangediv,
    "weatherchange",
    `<i class="fa-solid fa-cloud-sun"></i>`,
  );

  weatherspan.addEventListener("pointerup", (event) => {
    showhideWeather();
  });

  getDaylight().then((daylight: any) => {
    renderWeatherInfo(hero, latitude, longitude, daylight);
  });

  cookieWarningFunctionality();

  hero.style.display = "block";
}

export function setHeroText(heroText: string) {
  const ch1 = document.getElementById("container-h1");
  const title = ch1?.getElementsByTagName("h1")[0];
  if (title) title.textContent = heroText;
}

function getImageForHero(herotype: string) {
  let imageurl = "";
  switch (herotype) {
    default:
    case "plane":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-plane.jpg";
      break;
    case "helicopter":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-helicopter.jpg";
      break;
    case "racecar":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-racecar.jpg";
      break;
    case "crawler":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-crawl.jpg";
      break;
    case "drone":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-drone.jpg";
      break;
  }
  return imageurl;
}

function changeHeroImage(herotype: string) {
  localStorage.setItem("herotype", herotype);
  const hero = document.getElementById("hero");
  if (!hero) return;

  logger.log("changeHeroImage");
  let imageurl = getImageForHero(herotype);

  if (imageurl.length <= 1) return;

  setSiteImage(imageurl);
  hero.style.backgroundImage = "url('" + imageurl + "')";
  hero.style.backgroundPosition = "center";
  hero.style.backgroundSize = "cover";
  hero.style.backgroundRepeat = "no-repeat";
}
