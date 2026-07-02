import {
  getCurrentWeatherUrl,
  getForcastWeatherUrl,
} from "../../src/js/framework/APIWeather";
import { test, expect, request } from "@playwright/test";

export class APIForcast {
  constructor(apiContext) {
    this.apiContext = apiContext;
  }

  async getWeatherCurrent(latitude, longitude) {
    const forcast_url = getCurrentWeatherUrl(latitude, longitude);

    const forcastResponse = await this.apiContext.get(forcast_url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(forcastResponse.ok()).toBeTruthy();
    const response = await forcastResponse.json();
    console.log(response);
    return response;
  }

  async getWeatherForecast(latitude, longitude) {
    const forcast_url = getForcastWeatherUrl(latitude, longitude);

    const forcastResponse = await this.apiContext.get(forcast_url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(forcastResponse.ok()).toBeTruthy();
    const response = await forcastResponse.json();
    console.log(response);
    return response;
  }
}
module.exports = { APIForcast };
