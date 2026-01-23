export function renderHero(data) {
  console.log("renderHero");

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
    
    const heroTextDiv = document.createElement("div");
    heroTextDiv.className = "container-hero container text-center";
    hero.appendChild(heroTextDiv);

    const heroTextH1 = document.createElement("H1");
    heroTextH1.innerHTML = data.text;
    heroTextDiv.appendChild(heroTextH1);
  }

  //setup for alerts
  const heroAlertDiv = document.createElement("div");
  heroAlertDiv.id = "alerts-container";
  hero.appendChild(heroAlertDiv);
}
