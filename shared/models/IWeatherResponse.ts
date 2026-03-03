export interface IWeatherResponse {
  time: string,
  interval: number,
  temperature: number,
  windspeed: number,
  winddirection: number,
  isDay: boolean,
  weatherCode: number
}