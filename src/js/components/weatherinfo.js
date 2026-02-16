import { fetchJson } from "@framework/utils";
import { createDiv } from "@framework/dom";

const SHOW_WEATHER_KEY = "showWeather";
const CACHE_KEY = "weatherCache";
const CACHE_DURATION = 56 * 1000; // 60 second

export function renderWeatherInfo(parent, latitude, longitude) {
  //render the weather info
  const weather_widgetdiv = createDiv(
    parent,
    "weather-widget",
    "weather-widget",
  );

  const weather_icondiv = createDiv(
    weather_widgetdiv,
    "weather-icon",
    "weather-icon",
  );
  const weather_infodiv = createDiv(weather_widgetdiv, "weather-info");
  const weather_descdiv = createDiv(
    weather_infodiv,
    "weather-description",
    "weather-description",
  );
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

  weather_widgetdiv.addEventListener("click", (event) => {
    hideWeather();
  });

  getWeather(latitude, longitude).then((data) => {
    const temp = data.current_weather.temperature;
    const wind = getMPH(data.current_weather.windspeed);
    const windDir = data.current_weather.winddirection + 180; // Adjust to point in the direction the wind is coming from
    const weatherCode = data.current_weather.weathercode;
    const weatherInfo = getWeatherImageAndLabel(weatherCode);//getWeatherIconAndLabel(weatherCode);
    const weatherimage = weatherInfo.image;
    const weatherlabel = weatherInfo.label;

    weather_descdiv.innerHTML = weatherlabel;
    weather_tempdiv.innerHTML = `${temp}°C`;
    weather_windtextdiv.innerHTML = `${wind} mph`;
    weather_windarrowdiv.style.transform = `rotate(${windDir}deg)`;
    //let weathericonInner = `<i class="${weathericon}"></i>`;
    let weatherImgInner = `<img src="${weatherimage}" alt="${weatherlabel}" class="weather-image" />`;
    weather_icondiv.innerHTML = weatherImgInner;

    let weatherShowHide = document.getElementById("weatherchange-container");
    if (weatherShowHide) weatherShowHide.style.display = "block";
    
    const toshow = localStorage.getItem(SHOW_WEATHER_KEY);
    if (toshow === "true") {
      showhideWeather();
    }

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

export function getWeatherIconAndLabel(weatherCode) {
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

export function showhideWeather() {
  let weather_widget = document.getElementById("weather-widget");
  if (weather_widget) {
    if (weather_widget.style.display === "block") {
      weather_widget.style.display = "none";
      localStorage.removeItem(SHOW_WEATHER_KEY);
    } else {
      weather_widget.style.display = "block";
      localStorage.setItem(SHOW_WEATHER_KEY, "true");
    }
  }
}

export function hideWeather() {
  let weather_widget = document.getElementById("weather-widget");
  if (weather_widget) {
    weather_widget.style.display = "none";
    localStorage.removeItem(SHOW_WEATHER_KEY);
  }
}

function getMPH(kmh) {
  return Math.round(kmh * 0.621371);
}

export function getWeatherImageAndLabel(weatherCode) {

  let source = "https://gmfc-images-siteimages.s3.eu-west-2.amazonaws.com/weather/";
  //source = "https://siteimages.gmfc.uk/weather/";

  const map = {
    0: { image: `${source}sun.png`, label: "Clear sky" },
    1: { image: `${source}cloud-sun.png`, label: "Mainly clear" },
    2: { image: `${source}cloud-sun.png`, label: "Partly cloudy" },
    3: { image: `${source}cloud.png`, label: "Overcast" },
    45: { image: `${source}dark-cloud.png`, label: "Fog" },
    48: { image: `${source}dark-cloud.png`, label: "Depositing rime fog" },
    51: { image: `${source}light-rain.png`, label: "Light drizzle" },
    53: { image: `${source}light-rain.png`, label: "Moderate drizzle" },
    55: { image: `${source}light-rain.png`, label: "Dense drizzle" },
    56: { image: `${source}light-rain.png`, label: "Light freezing drizzle" },
    57: { image: `${source}light-rain.png`, label: "Dense freezing drizzle" },
    61: { image: `${source}light-rain.png`, label: "Light rain" },
    63: { image: `${source}light-rain.png`, label: "Moderate rain" },
    65: { image: `${source}heavy-rain.png`, label: "Heavy rain" },
    66: { image: `${source}heavy-rain.png`, label: "Light freezing rain" },
    67: { image: `${source}heavy-rain.png`, label: "Heavy freezing rain" },
    71: { image: `${source}snow.png`, label: "Light snow" },
    73: { image: `${source}snow.png`, label: "Moderate snow" },
    75: { image: `${source}snow.png`, label: "Heavy snow" },
    77: { image: `${source}snow.png`, label: "Snow grains" },
    80: { image: `${source}light-rain.png`, label: "Rain showers" },
    81: { image: `${source}light-rain.png`, label: "Moderate showers" },
    82: { image: `${source}heavy-rain.png`, label: "Violent showers" },
    85: { image: `${source}snow.png`, label: "Snow showers light" },
    86: { image: `${source}snow.png`, label: "Snow showers heavy" },
    95: { image: `${source}thunderstorm.png`, label: "Thunderstorm" },
    96: { image: `${source}thunderstorm.png`, label: "Thunderstorm with hail" },
    99: {
      image: `${source}hail.png`,
      label: "Thunderstorm with heavy hail",
    },
  };

  return map[weatherCode] || { image: `${source}cloud-sun.png`, label: "Unknown" };
}