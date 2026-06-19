import {
  DURATION_HOUR,
  getDayOfYearUTC,
  isBritishSummerTime,
} from "@framework/utils";
import {
  createDiv,
  createH3,
  createSpan,
  createInput,
  createLabel,
  emptyDiv,
  createCanvas,
  injectScript,
} from "@framework/dom";
import {
  getWeatherImageAndLabel,
  renderWindWidget,
  setWind,
} from "@components/weatherinfo";

declare const Chart: any;

let forcast_data: any[] = [];
let daylight_data: any[] = [];
const CACHE_KEY = "weatherForcastCache";
const CACHE_DURATION = DURATION_HOUR;

export function fetchAndRenderWeatherForecast(
  parent: HTMLElement,
  data: any,
  daylightData: any[],
) {

  const latitude = 51.459563;
  const longitude = -2.790968;
  daylight_data = daylightData;
  getWeather(latitude, longitude).then(() => {
    createWeatherFilter(parent);
    renderWeather(parent);
  });
}

export function renderWeather(parent: HTMLElement, type = "weather_overview") {
  let id = "sectionWeatherForcast";
  let weatherDiv: HTMLElement | null = document.getElementById(id);
  if (!weatherDiv) {
    weatherDiv = createDiv(parent, "sectionWeatherForecastDiv", id);
  } else {
    emptyDiv(weatherDiv);
  }

  switch (type) {
    default:
    case "weather_overview":
      renderWeatherForecast_Overview(weatherDiv);
      break;
    case "weather_wind":
      renderWeatherForecast_Wind(weatherDiv);
      break;
  }
}

function scrollToHourCentered(day: number, hour: number) {
  console.log(`Scrolling to day ${day}, hour ${hour}`);
  let weatherDayId = `weatherDay-${day}`;
  let weatherViewportId = `weatherViewport-${day}`;
  const strip = document.getElementById(weatherDayId);
  if (!strip) {
    return;
  }
  const target = strip.querySelector<HTMLElement>(
    `.weatherHourDiv[data-hour="${hour}"]`,
  );
  if (!target) return;

  const viewport = document.getElementById(weatherViewportId);
  if (viewport) {
    const offset =
      target.offsetLeft - (viewport.offsetWidth / 2 - target.offsetWidth / 2);
    viewport.scrollLeft = offset;
  }
}

async function getWeather(latitude: number, longitude: number) {
  forcast_data = [];
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    let now = Date.now();
    let duration = now - timestamp;
    if (duration < CACHE_DURATION) {
      console.log("Using cached weather forcast:", data);
      forcast_data = data;
      procssDatesForWeatherForcast();
      return;
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m&wind_speed_unit=mph`;

  //need to convert this to a structure that the render function can use
  console.log(`Fetching weather data from ${url}`);

  const response = await fetch(url).catch((err) => {
    throw new Error(`Forcast Weather API unreachable ${url}`);
  });
  if (response.ok) {
    const jsondata = await response.json();

    jsondata.hourly.time.forEach((time: string, index: number) => {
      let timeStr = time + ":00";
      let jDate = new Date(timeStr); // Ensure it's treated as UTC
      let utcHours = jDate.getUTCHours();

      console.log(
        `Processing weather data for time ${time} (local: ${utcHours})`,
      );
      forcast_data.push({
        time: jDate,
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
}

function procssDatesForWeatherForcast() {
  forcast_data.forEach((entry: any) => {
    let timeStr = entry.time;
    entry.time = new Date(timeStr);
  });
}

/*Chat gpt
function getTemperatureColor(temp: number) {
  const min = -10;
  const max = 40;

  temp = Math.max(min, Math.min(max, temp));
  const t = (temp - min) / (max - min);

  const hue = 220 - 220 * t;

  return `hsl(${hue}, 70%, 72%)`;
}*/

/* UK-calibrated temperature colour — call getTemperatureColor(temp) */
function getTemperatureColor(temp: number) {
  const stops = [
    { t: -2, color: [10, 50, 180] }, // dark navy blue
    { t: 6, color: [56, 189, 248] }, // cool cyan
    { t: 9, color: [134, 239, 172] }, // mild green
    { t: 14, color: [160, 230, 130] }, // fresh green
    { t: 24, color: [251, 191, 36] }, // warm yellow
    { t: 28, color: [249, 115, 22] }, // hot orange
    { t: 40, color: [185, 28, 28] }, // scorching red
  ];
  const clamped = Math.min(40, Math.max(-2, temp));
  for (let i = 0; i < stops.length - 1; i++) {
    const s = stops[i],
      e = stops[i + 1];
    if (clamped >= s.t && clamped <= e.t) {
      const f = (clamped - s.t) / (e.t - s.t);
      const lerp = (a: number, b: number) => Math.round(a + (b - a) * f);
      const [r, g, b] = [0, 1, 2].map((j) => lerp(s.color[j], e.color[j]));
      return `rgb(${r},${g},${b})`;
    }
  }
  return `rgb(185,28,28)`;
}

function createWeatherFilter(parent: HTMLElement) {
  const holderDiv = createDiv(parent, "weather_filter_holder");
  const filterDiv = createDiv(
    holderDiv,
    "btn-group  mb-3 weather_selector", //
    "weatherFilter",
    "group",
  );

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "weatherType",
    "weather_overview",
    "weather_overview",
    true,
  );
  createLabel(
    filterDiv,
    "btn btn-outline-primary",
    "weather_overview",
    "Overview",
  );

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "weatherType",
    "weather_wind",
    "weather_wind",
  );
  createLabel(filterDiv, "btn btn-outline-primary", "weather_wind", "Wind");

  document
    .querySelectorAll<HTMLInputElement>('input[name="weatherType"]')
    .forEach((input) => {
      input.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        console.log("weather input changed:" + target.value);
        const type = target.value;
        let weatherDiv = document.getElementById("sectionWeatherForcast");
        if (weatherDiv) renderWeather(weatherDiv, type);
      });
    });

  return filterDiv;
}

function renderWeatherForecast_Overview(parent: HTMLElement) {
  console.log("Rendering overview weather forcast with data:", forcast_data);
  let isBST = isBritishSummerTime();
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let calculatedToday = getDayOfYearUTC(today);
  let tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let calculatedTomorrow = getDayOfYearUTC(tomorrow);
  console.log(`Tomorrow's day of year: ${calculatedTomorrow}`);

  let wind_widget_size = 60;
  let currentDay = -1;
  forcast_data.forEach((data: any, index: number) => {
    let thisDay = new Date(data.time);
    thisDay.setHours(0, 0, 0, 0);
    let day = getDayOfYearUTC(thisDay);

    if (day !== currentDay || index === 0) {
      let dayName = thisDay.toLocaleDateString("en-GB", { weekday: "long" });

      if (day === calculatedToday) {
        dayName = "Today";
      } else if (day === calculatedTomorrow) {
        dayName = "Tomorrow";
      }
      let dayOfYear = day;
      let daylightInfo = daylight_data[dayOfYear] << 1;
      if (isBST) daylightInfo = daylightInfo << 1;
      console.log(`Daylight info for day ${dayOfYear}:`, daylightInfo);

      const h2 = createH3(parent, `${dayName}`);
      let weatherDayId = `weatherDay-${day}`;
      let weatherViewpostId = `weatherViewport-${day}`;
      const viewportDiv = createDiv(
        parent,
        "weatherViewport",
        weatherViewpostId,
      );
      const dayDiv = createDiv(viewportDiv, "weatherDayDiv", weatherDayId);
      dayDiv.dataset.day = String(day);
      for (let i = 0; i < 24; i++) {
        console.log(`Checking daylight for day`);
        let divhourClass = "weatherHourDiv";
        let x = Math.pow(2, i);
        let isNight = false;
        if ((daylightInfo & x) === x) {
          divhourClass += " weather-daylight";
        } else {
          divhourClass += " weather-night";
          isNight = true;
        }
        const hourDiv = createDiv(dayDiv, divhourClass);
        hourDiv.dataset.hour = String(i);
        hourDiv.dataset.night = isNight ? "true" : "false";
        hourDiv.dataset.weathericon = ".";
        const timeSpan = createSpan(hourDiv, "weatherTime", `${i}:00`);
        const tempSpan = createSpan(hourDiv, "weatherTemp");
        const precipSpan = createSpan(hourDiv, "weatherPrecip");
        const iconSpan = createSpan(hourDiv, "weatherIcon");
        //const windSpan = createSpan(hourDiv, "weatherWind");
        let windwidgetId = `wind-widget-${day}-${i}`;
        renderWindWidget(hourDiv, wind_widget_size, windwidgetId);
      }
      currentDay = day;
    }
  });

  forcast_data.forEach((data: any, index: number) => {
    console.log(`Processing weather data for time ${data.time} (${index})`);
    let thisDayDay = new Date(data.time);
    thisDayDay.setHours(0, 0, 0, 0);
    let thisDay = new Date(data.time);
    if (isBST) {
      thisDay.setHours(thisDay.getHours() + 1);
    }
    let day = getDayOfYearUTC(thisDayDay);
    let hour = thisDay.getHours(); //getUTCHours();
    let weatherDayId = `weatherDay-${day}`;
    const dayDiv = document.getElementById(weatherDayId);
    if (dayDiv) {
      const hourDiv = dayDiv.querySelector<HTMLElement>(
        `.weatherHourDiv[data-hour="${hour}"]`,
      );
      if (hourDiv) {
        const isNight = hourDiv.dataset.night === "true";
        const tempSpan = hourDiv.querySelector<HTMLElement>(".weatherTemp");

        const precipSpan = hourDiv.querySelector<HTMLElement>(".weatherPrecip");
        const iconSpan = hourDiv.querySelector<HTMLElement>(".weatherIcon");
        const windSpan = hourDiv.querySelector<HTMLElement>(".weatherWind");
        const weatherInfo = getWeatherImageAndLabel(data.weather_code, isNight);
        hourDiv.dataset.weathericon = String(data.weather_code);
        const weatherimage = weatherInfo.image;
        const weatherlabel = weatherInfo.label;
        if (!isNight) {
          hourDiv.style.backgroundColor = getTemperatureColor(data.temperature);
        }
        let dir = (data.wind_direction_10m + 180) % 360;
        if (tempSpan) tempSpan.textContent = `${data.temperature}°C`;
        if (precipSpan)
          precipSpan.innerHTML = `<i class="fa-solid fa-cloud-rain"></i> ${data.precipitation_probability}%`;
        if (iconSpan)
          iconSpan.innerHTML = `<img src="${weatherimage}" alt="${weatherlabel}"  title="${weatherlabel}"  class="weather-image" />`;
        let windwidgetId = `wind-widget-${day}-${hour}`;
        let wind_widget = setWind(dir, data.wind_speed_10m, windwidgetId);

        /*if(dir < 45 || dir > (360-45)) {      
      wind_widget.style.setProperty("margin-top", `-${wind_widget_size/6}px`);
    }else if(dir < 90 || dir >= (360-90)) {
      wind_widget.style.setProperty("margin-top", `-${wind_widget_size/3}px`);
    }*/
      }
    }
  });

  let current_day = calculatedToday;
  for (let day = current_day; day < current_day + 7; day++) {
    scrollToHourCentered(day, 12);
  }
}

function renderWeatherForecast_Wind(parent: HTMLElement) {
  console.log("Rendering wind weather forcast with data:", forcast_data);
  let max_wind_speed = 0;
  let currentDay = -1;
  let isBST = isBritishSummerTime();
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let calculatedToday = getDayOfYearUTC(today);
  let tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let calculatedTomorrow = getDayOfYearUTC(tomorrow);
  console.log(`Tomorrow's day of year: ${calculatedTomorrow}`);

  forcast_data.forEach((data: any, index: number) => {
    let thisDay = new Date(data.time);
    thisDay.setHours(0, 0, 0, 0);

    if (data.wind_speed_10m > max_wind_speed)
      max_wind_speed = data.wind_speed_10m;
    if (data.wind_speed_80m > max_wind_speed)
      max_wind_speed = data.wind_speed_80m;
    //if (data.wind_speed_120m > max_wind_speed)
    //  max_wind_speed = data.wind_speed_120m;

    let day = getDayOfYearUTC(thisDay);
    if (day !== currentDay || index === 0) {
      let dayName = data.time.toLocaleDateString("en-GB", { weekday: "long" });

      if (day === calculatedToday) {
        dayName = "Today";
      } else if (day === calculatedTomorrow) {
        dayName = "Tomorrow";
      }

      let dayOfYear = day;
      let daylightInfo = daylight_data[dayOfYear];
      console.log(`Daylight info for day ${dayOfYear}:`, daylightInfo);

      const h2 = createH3(parent, `${dayName}`);
      let weatherDayId = `weatherDay-${day}`;
      let weatherWindDayId = `weatherWindDay-${day}`;
      let weatherViewpostId = `weatherViewport-${day}`;
      const viewportDiv = createDiv(
        parent,
        "weatherViewport",
        weatherViewpostId,
      );
      const dayDiv = createDiv(viewportDiv, "weatherWindDayDiv", weatherDayId);
      dayDiv.dataset.day = String(day);
      createCanvas(dayDiv, "windSpeedChartCanvas", weatherWindDayId);
      currentDay = day;
    }
  });
  renderWindCharts(max_wind_speed);
}

async function renderWindCharts(max_wind_speed: number) {
  max_wind_speed = nextWindBand(max_wind_speed);

  await injectScript("https://cdn.jsdelivr.net/npm/chart.js");

  let currentDay = -1;
  forcast_data.forEach((data: any, index: number) => {
    let dayday = new Date(data.time);
    dayday.setHours(0, 0, 0, 0);
    let day = getDayOfYearUTC(dayday);
    if (day !== currentDay || index === 0) {
      let weatherWindDayId = `weatherWindDay-${day}`;
      const ctx = document.getElementById(weatherWindDayId);
      const next24 = forcast_data.slice(index, index + 24);
      renderWindDay(ctx, next24, max_wind_speed);
      currentDay = day;
    }
  });
}

function renderWindDay(
  ctx: HTMLElement | null,
  next24: any[],
  max_wind_speed: number,
) {
  console.log(`renderWindDay ${max_wind_speed}`);
  let wind_speed_10m: number[] = [];
  let wind_speed_80m: number[] = [];
  next24.forEach((data: any) => {
    wind_speed_10m.push(data.wind_speed_10m);
    wind_speed_80m.push(data.wind_speed_80m);
  });

  new Chart(ctx, {
    type: "line",
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: max_wind_speed,
        },
      },
      interaction: {
        mode: "index", // shows value for the vertical slice
        intersect: false, // don't require exact point hit
      },
      plugins: {
        title: {
          display: false,
          text: "",
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx: any) => `${ctx.parsed.y} mph`,
          },
        },
      },
    },
    data: {
      labels: [
        "00",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
      ],
      datasets: [
        {
          label: "Wind speed 10m",
          data: wind_speed_10m,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 20,
        },
        {
          label: "Wind speed 80m",
          data: wind_speed_80m,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 20,
        },
      ],
    },
  });
}

function nextWindBand(value: number, step = 5) {
  const min = 0;
  const max = 100;

  if (value >= max) return max;

  return Math.min(max, Math.ceil(value / step) * step);
}
