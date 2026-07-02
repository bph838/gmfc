import { test, expect, request } from "@playwright/test";
import { logger } from "../src/js/framework/logger";
import { APIForcast } from "./weatherAPI/APIForcast";

const latitude = 51.459563;
const longitude = -2.790968;

test("@API load forcast", async ({ page }) => {
  const apiContext = await request.newContext();
  const apiForcast = new APIForcast(apiContext);
  const response = await apiForcast.getForcast(latitude, longitude);

  const windspeed_units = response.current_weather_units.windspeed;
  expect(windspeed_units).toEqual("mp/h");
});
