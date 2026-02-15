import { fetchJson } from "@framework/utils";
import { createDiv } from "@framework/dom";

const CACHE_KEY = "weatherCache";
const CACHE_DURATION = 56 * 1000; // 60 second

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

  getWeather(latitude, longitude).then((data) => {
    const temp = data.current_weather.temperature;
    const wind = data.current_weather.windspeed;
    const windDir = data.current_weather.winddirection;
    const weatherCode = data.current_weather.weathercode;
    const weatherInfo = getWeatherIconAndLabel(weatherCode);
    const weathericon = weatherInfo.icon;
    const weatherlabel = weatherInfo.label;

    weather_tempdiv.innerHTML = `${temp}°C`;
    weather_windtextdiv.innerHTML = `${wind} km/h`;
    weather_windarrowdiv.style.transform = `rotate(${windDir}deg)`;
    let weathericonInner = `<i class="${weathericon}"></i>`;

    weather_icondiv.innerHTML = weathericonInner;
    weather_widgetdiv.style.display = "block";
  });
}

async function getWeather(latitude, longitude) {
  // Check if cached data exists
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log("Using cached weather:", data);
      return data;
    }
  }

  console.log("AAAA");
  // Fetch fresh data
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  console.log(`Fetching weather: ${url}`);

  const response = await fetch(url);
  const data = await response.json();

  // Save to cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    }),
  );

  console.log("Fetched new weather:", data);
  return data;
}

function getWeatherIconAndLabel(weatherCode) {
  const map = {
    0: { icon: "fa-solid fa-sun", label: "Clear sky" },
    1: { icon: "fa-solid fa-cloud-sun", label: "Mainly clear" },
    2: { icon: "fa-solid fa-cloud-sun", label: "Partly cloudy" },
    3: { icon: "fa-solid fa-cloud", label: "Overcast" },
    45: { icon: "fa-solid fa-smog", label: "Fog" },
    48: { icon: "fa-solid fa-smog", label: "Depositing rime fog" },
    51: { icon: "fa-solid fa-cloud-rain", label: "Light drizzle" },
    53: { icon: "fa-solid fa-cloud-rain", label: "Moderate drizzle" },
    55: { icon: "fa-solid fa-cloud-rain", label: "Dense drizzle" },
    56: { icon: "fa-solid fa-cloud-rain", label: "Light freezing drizzle" },
    57: { icon: "fa-solid fa-cloud-rain", label: "Dense freezing drizzle" },
    61: { icon: "fa-solid fa-cloud-rain", label: "Light rain" },
    63: { icon: "fa-solid fa-cloud-rain", label: "Moderate rain" },
    65: { icon: "fa-solid fa-cloud-rain", label: "Heavy rain" },
    66: { icon: "fa-solid fa-cloud-rain", label: "Light freezing rain" },
    67: { icon: "fa-solid fa-cloud-rain", label: "Heavy freezing rain" },
    71: { icon: "fa-solid fa-snowflake", label: "Light snow" },
    73: { icon: "fa-solid fa-snowflake", label: "Moderate snow" },
    75: { icon: "fa-solid fa-snowflake", label: "Heavy snow" },
    77: { icon: "fa-solid fa-snowflake", label: "Snow grains" },
    80: { icon: "fa-solid fa-cloud-rain", label: "Rain showers" },
    81: { icon: "fa-solid fa-cloud-rain", label: "Moderate showers" },
    82: { icon: "fa-solid fa-cloud-rain", label: "Violent showers" },
    85: { icon: "fa-solid fa-snowflake", label: "Snow showers light" },
    86: { icon: "fa-solid fa-snowflake", label: "Snow showers heavy" },
    95: { icon: "fa-solid fa-cloud-bolt", label: "Thunderstorm" },
    96: { icon: "fa-solid fa-cloud-bolt", label: "Thunderstorm with hail" },
    99: {
      icon: "fa-solid fa-cloud-bolt",
      label: "Thunderstorm with heavy hail",
    },
  };

  return map[weatherCode] || { icon: "fa-question", label: "Unknown" };
}
