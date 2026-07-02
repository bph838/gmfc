import { getCurrentWeatherUrl } from "../../src/js/framework/APIWeather";

export class APIForcast {
  constructor(apiContext) {
    this.apiContext = apiContext;
  }

  async getForcast(latitude, longitude) {
    const forcast_url = getCurrentWeatherUrl(latitude, longitude); //`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&wind_speed_unit=mph`;

    const forcastResponse = await this.apiContext.get(forcast_url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseOrder = await forcastResponse.json();
    expect(responseOrder.ok()).toBeTruthy();
    console.log(responseOrder);
    return responseOrder;
  }
}
module.exports = { APIForcast };
