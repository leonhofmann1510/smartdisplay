import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { apiFetch } from "../utils/apiFetch";
import { IWeatherResponse } from "../../../shared/models/IWeatherResponse";
import { JsonHandler } from "../utils/jsonHandler";

let store: JsonHandler | null = null
const getStore = (): Promise<JsonHandler> => {
  if (!store) return JsonHandler.open('externalData').then(s => (store = s))
  return Promise.resolve(store)
}

export const getCurrentWeather = async (req: Request, res: Response) => {
  const store = await getStore();
  const storedData = store.get("weather.data");
  const storedTimeStamp = store.get("weather.lastUpdated");

  if (storedTimeStamp && ((Number(storedTimeStamp) + 1000*60*30) > Date.now())) {
    sendSuccess(res, storedData, "Cached Weather information retrieved successfully");
    return;
  }

  const rawData = await apiFetch.get<any>('https://api.open-meteo.com/v1/forecast?latitude=51.34&longitude=12.37&current_weather=true');

  const data: IWeatherResponse = {
    time: rawData['current_weather']['time'],
    interval: rawData['current_weather']['interval'],
    temperature: rawData['current_weather']['temperature'],
    windspeed: rawData['current_weather']['windspeed'],
    winddirection: rawData['current_weather']['winddirection'],
    isDay: rawData['current_weather']['is_day'],
    weatherCode: rawData['current_weather']['weathercode']
  }

  store.set("weather.lastUpdated", Date.now());
  store.set("weather.data", JSON.stringify(data));

  sendSuccess(res, data, "Weather information retrieved successfully");
};