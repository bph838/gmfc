import { test, expect, request } from "@playwright/test";
import { logger } from "../src/js/framework/logger";
import { APIForcast } from "./weatherAPI/APIForcast";

const latitude = 51.459563;
const longitude = -2.790968;

test("@API load current weather forcast", async ({ page }) => {
  const apiContext = await request.newContext();
  const apiForcast = new APIForcast(apiContext);
  const response = await apiForcast.getWeatherCurrent(latitude, longitude);

  const windspeed_units = response.current_weather_units.windspeed;
  expect(windspeed_units).toEqual("mp/h");
});

test("@API load forcast weather forcast", async ({ page }) => {
  const apiContext = await request.newContext();
  const apiForcast = new APIForcast(apiContext);
  const response = await apiForcast.getWeatherForecast(latitude, longitude);

  const windspeed_units_10 = response.hourly_units.wind_speed_10m;
  expect(windspeed_units_10).toEqual("mp/h");
});
