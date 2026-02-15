import { fetchJson } from "@framework/utils";
import {
  createDiv,
  createSection,
  createH2,
  createSpan,
  createLink,
  createImage,
  createParagraph,
  createOrderedList,
  createListItem,
} from "@framework/dom";
import { setData } from "./forcast";

export function fetchAndRenderWeatherForecast(parent, data) {
  if (!data.weatherCoordinates) {
    console.error("Unable to render fetchAndRenderWeatherForecast");
    return;
  }

  const latitude = data.weatherCoordinates.latitude;
  const longitude = data.weatherCoordinates.longitude;
  //https://api.open-meteo.com/v1/forecast?latitude=51.459563&longitude=-2.790968&hourly=temperature_2m,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m&wind_speed_unit=mph
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m&wind_speed_unit=mph`;
  //need to convert this to a structure that the render function can use
  console.log(`Fetching weather data from ${url}`);
  fetchJson(url)
    .then((jsondata) => {
      //console.log(JSON.stringify(jsondata, null, 2));
      let forcast = [];
      jsondata.hourly.time.forEach((time, index) => {
        /*console.log(`Time: ${time}`);
        console.log(`Temperature: ${jsondata.hourly.temperature_2m[index]}`);
        console.log(`Weather Code: ${jsondata.hourly.weather_code[index]}`);        
        console.log(`precipitation_probability: ${jsondata.hourly.precipitation_probability[index]}`);
        console.log(`precipitation: ${jsondata.hourly.precipitation[index]}`);
        console.log(`wind_speed_10m: ${jsondata.hourly.wind_speed_10m[index]}`);
        console.log(`wind_speed_80m: ${jsondata.hourly.wind_speed_80m[index]}`);
        console.log(`wind_speed_120m: ${data.hourly.wind_speed_120m[index]}`);
        console.log(`wind_speed_180m: ${jsondata.hourly.wind_speed_180m[index]}`);
        console.log(`wind_direction_10m: ${jsondata.hourly.wind_direction_10m[index]}`);
        console.log(`wind_direction_80m: ${jsondata.hourly.wind_direction_80m[index]}`);
        console.log(`wind_direction_120m: ${jsondata.hourly.wind_direction_120m[index]}`);
        console.log(`wind_direction_180m: ${jsondata.hourly.wind_direction_180m[index]}`);
        console.log(`wind_gusts_10m: ${jsondata.hourly.wind_gusts_10m[index]}`);*/

        forcast.push({
          time: time,
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
      setData(forcast);
      renderWeatherForecast(parent, jsondata);
    })
    .catch((error) => {
      console.error("Error fetching weather data", error);
    });
}

function renderWeatherForecast(parent, data) {  
  const sectiondiv = createDiv(parent, "sectionWeatherForecastDiv");
}
