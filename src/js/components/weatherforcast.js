import { fetchJson, getDayOfYearUTC } from "@framework/utils";
import { createDiv, createH3, createSpan } from "@framework/dom";
import { getWeatherIconAndLabel } from "@components/weatherinfo";

let forcast_data = [];
const CACHE_KEY = "weatherForcastCache";
const CACHE_DURATION = 1000*60*60*60; // 1 hour

export function fetchAndRenderWeatherForecast(parent, data) {
  if (!data.weatherCoordinates) {
    console.error("Unable to render fetchAndRenderWeatherForecast");
    return;
  }

  const latitude = data.weatherCoordinates.latitude;
  const longitude = data.weatherCoordinates.longitude;

  getWeather(latitude, longitude).then(() => {
    renderWeatherForecast(parent);
  }); 
}

function renderWeatherForecast(parent) {
  const sectiondiv = createDiv(parent, "sectionWeatherForecastDiv");
  console.log("Rendering weather forcast with data:", forcast_data);
  let currentDay = getDayOfYearUTC(forcast_data[0].time);
  forcast_data.forEach((data, index) => {
    let day = getDayOfYearUTC(data.time);
    if (day !== currentDay || index === 0) {
      let dayName = data.time.toLocaleDateString("en-GB", { weekday: "long" });

      if (getDayOfYearUTC(data.time) === getDayOfYearUTC(new Date())) {
        dayName = "Today";
      }
      if (
        getDayOfYearUTC(data.time) ===
        getDayOfYearUTC(new Date().setDate(new Date().getDate() + 1))
      ) {
        dayName = "Tomorrow";
      }
      const h2 = createH3(sectiondiv, `Weather forecast for ${dayName}`);
      let weatherDayId = `weatherDay-${day}`;
      let weatherViewpostId = `weatherViewport-${day}`;
      const viewportDiv = createDiv(
        sectiondiv,
        "weatherViewport",
        weatherViewpostId,
      );
      const dayDiv = createDiv(viewportDiv, "weatherDayDiv", weatherDayId);
      dayDiv.dataset.day = day;
      for (let i = 0; i < 24; i++) {
        const hourDiv = createDiv(dayDiv, "weatherHourDiv");
        hourDiv.dataset.hour = i;
        const timeSpan = createSpan(hourDiv, "weatherTime", `${i}:00`);
        const tempSpan = createSpan(hourDiv, "weatherTemp");
        const precipSpan = createSpan(hourDiv, "weatherPrecip");
        const iconSpan = createSpan(hourDiv, "weatherIcon");
        const windSpan = createSpan(hourDiv, "weatherWind");
      }
      currentDay = day;
    }
  });

  forcast_data.forEach((data, index) => {
    let day = getDayOfYearUTC(data.time);
    let hour = data.time.getUTCHours();
    let weatherDayId = `weatherDay-${day}`;
    const dayDiv = document.getElementById(weatherDayId);
    const hourDiv = dayDiv.querySelector(
      `.weatherHourDiv[data-hour="${hour}"]`,
    );
    const tempSpan = hourDiv.querySelector(".weatherTemp");
    const precipSpan = hourDiv.querySelector(".weatherPrecip");
    const iconSpan = hourDiv.querySelector(".weatherIcon");
    const windSpan = hourDiv.querySelector(".weatherWind");
    const weatherInfo = getWeatherIconAndLabel(data.weather_code);
    const weathericon = weatherInfo.icon;
    const weatherlabel = weatherInfo.label;

    tempSpan.textContent = `${data.temperature}°C`;
    precipSpan.innerHTML = `<i class="fa-solid fa-cloud-rain"></i> ${data.precipitation_probability}%`;
    iconSpan.innerHTML = `<i class="${weathericon}"></i>`;
    windSpan.innerHTML = `<i class="fa-solid fa-wind"></i> ${data.wind_speed_10m} mph`;
  });

  let current_day = getDayOfYearUTC(new Date());
  for (let day = current_day; day < current_day + 7; day++) {
    scrollToHourCentered(day, 12);
  }
}

function scrollToHourCentered(day, hour) {
  console.log(`Scrolling to day ${day}, hour ${hour}`);
  let weatherDayId = `weatherDay-${day}`;
  let weatherViewportId = `weatherViewport-${day}`;
  const strip = document.getElementById(weatherDayId);
  if (!strip) {
    console.error(`No strip found for day ${day}`);
    return;
  }
  const target = strip.querySelector(`.weatherHourDiv[data-hour="${hour}"]`);
  if (!target) return;

  const viewport = document.getElementById(weatherViewportId);
  if (viewport) {
    const offset =
      target.offsetLeft - (viewport.offsetWidth / 2 - target.offsetWidth / 2);
    viewport.scrollLeft = offset;
  }
}

async function getWeather(latitude, longitude) {
  forcast_data = [];
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log("Using cached weather forcast:", data);
      forcast_data = data;
      procssDatesForWeatherForcast();
      return;
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m&wind_speed_unit=mph`;

  //need to convert this to a structure that the render function can use
  console.log(`Fetching weather data from ${url}`);

  const response = await fetch(url);
  const jsondata = await response.json();
  
  jsondata.hourly.time.forEach((time, index) => {
    forcast_data.push({
      time: new Date(time),
      temperature: jsondata.hourly.temperature_2m[index],
      weather_code: jsondata.hourly.weather_code[index],
      precipitation_probability:
        jsondata.hourly.precipitation_probability[index],
      precipitation: jsondata.hourly.precipitation[index],
      wind_speed_10m: jsondata.hourly.wind_speed_10m[index],
      wind_speed_80m: jsondata.hourly.wind_speed_80m[index],
      wind_speed_120m: jsondata.hourly.wind_speed_120m[index],
      wind_speed_180m: jsondata.hourly.wind_speed_180m[index],
      wind_direction_10m: jsondata.hourly.wind_direction_10m[index],
      wind_direction_80m: jsondata.hourly.wind_direction_80m[index],
      wind_direction_120m: jsondata.hourly.wind_direction_120m[index],
      wind_direction_180m: jsondata.hourly.wind_direction_180m[index],
      wind_gusts_10m: jsondata.hourly.wind_gusts_10m[index],
    });
  });

  // Save to cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: forcast_data,
    }),
  );
  

  console.log("Fetched new weather forcast:", forcast_data);
}


function procssDatesForWeatherForcast() {
  forcast_data.forEach((entry) => {
    entry.time = new Date(entry.time);
  });
}