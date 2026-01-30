import { createDiv, createH1, createSpan } from "@framework/dom";
import { setSiteImage } from "@framework/utils";

export function renderHero(data) {
  console.log("renderHero called");

  const hero = document.getElementById("hero");
  if (!hero) {
    console.error("There is no hero id to render to");
    return;
  }

  let sitepic = '';
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

  if(sitepic.length>=0)
    setSiteImage(sitepic);

  hero.className = "hero";
  hero.style.backgroundPosition = "center";
  hero.style.backgroundSize = "cover";
  hero.style.backgroundRepeat = "no-repeat";

  if (data.text) {
    const heroTextDiv = createDiv(hero, "container-hero container text-center");
    createH1(heroTextDiv, data.text);
  }

  //setup for alerts div
  createDiv(hero, "alerts-container", "alerts-container");

  //setup fonts for changing the hero image
  const herochangediv = createDiv(hero, "herochange-container");

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

  planespan.addEventListener("click", (event) => {
    changeHeroImage("plane");
  });
  helicopterspan.addEventListener("click", (event) => {
    changeHeroImage("helicopter");
  });
  racecarspan.addEventListener("click", (event) => {
    changeHeroImage("racecar");
  });
  crawlerspan.addEventListener("click", (event) => {
    changeHeroImage("crawler");
  });
}

function getImageForHero(herotype) {
  let imageurl = "";
  switch (herotype) {
    case "plane":
      imageurl =
        "https://gmfc-images-siteimages.s3.eu-west-2.amazonaws.com/hero/hero-plane.jpg";
      break;
    case "helicopter":
      imageurl =
        "https://gmfc-images-siteimages.s3.eu-west-2.amazonaws.com/hero/hero-helicopter.jpg";
      break;
    case "racecar":
      imageurl =
        "https://gmfc-images-siteimages.s3.eu-west-2.amazonaws.com/hero/hero-racecar.jpg";
      break;
    case "crawler":
      imageurl =
        "https://gmfc-images-siteimages.s3.eu-west-2.amazonaws.com/hero/hero-crawl.jpg";
      break;
    default:
      break;
  }
  return imageurl;
}

function changeHeroImage(herotype) {
  localStorage.setItem("herotype", herotype);
  const hero = document.getElementById("hero");
  console.log("changeHeroImage");
  let imageurl = getImageForHero(herotype);
  
  if (imageurl.length <= 1) return;

  setSiteImage(imageurl);
  hero.style.backgroundImage = "url('" + imageurl + "')";
  hero.style.backgroundPosition = "center";
  hero.style.backgroundSize = "cover";
  hero.style.backgroundRepeat = "no-repeat";
}
