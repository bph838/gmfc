import { fetchJson } from "@framework/utils";
import { createDiv } from "@framework/dom";

export function renderWeatherInfo(parent, latitude, longitude) {
  //render the weather info
  const weather_widgetdiv = createDiv(parent, "weather-widget");

  const weather_icondiv = createDiv(
    weather_widgetdiv,
    "weather-icon",
    "weather-icon",
  );
  const weather_infodiv = createDiv(weather_widgetdiv, "weather-info");

  const weather_tempdiv = createDiv(weather_infodiv, "temp", "temp");
  weather_tempdiv.innerHTML = "--°C";
  const weather_winddiv = createDiv(weather_infodiv, "wind");
  const weather_windarrowdiv = createDiv(
    weather_winddiv,
    "wind-arrow",
    "wind-arrow",
  );
  weather_windarrowdiv.innerHTML = "↑";
  const weather_windtextdiv = createDiv(
    weather_winddiv,
    "wind-text",
    "wind-text",
  );
  weather_windtextdiv.innerHTML = "-- km/h";

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,weathercode`;
  console.log(`Looking for weather ${url}`);
  fetchJson(url).then((data) => {
    console.log(`Data for weather ${JSON.stringify(data)}`);

    const temp = data.current.temperature_2m;
    const wind = data.current.windspeed_10m;
    const winddir = data.current.winddirection_10m;
    const weathercode = data.current.weathercode;
    const weathericon =
      {
        0: "fa-solid fa-sun",
        1: "fa-solid fa-cloud-sun",
        2: "fa-solid fa-cloud",
        3: "fa-solid fa-cloud",
      }[weathercode] || "fa-solid fa-cloud";

    weather_tempdiv.innerHTML = `${temp}°C`;
    weather_windtextdiv.innerHTML = `${wind} km/h`;
    weather_windarrowdiv.style.transform = `rotate(${winddir}deg)`;
    weather_icondiv.className = `weather-icon ${weathericon}`;
  });
}
