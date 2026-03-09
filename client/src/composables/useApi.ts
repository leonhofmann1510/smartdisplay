import { useHttp } from "./useHttp";
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';
import type { IWeatherResponse } from '@/../../shared/models/IWeatherResponse';
import type { IApiResponse } from '@/../../shared/models/IApiResponse';
import type { IQuote } from '@/../../shared/models/IQuote'
import type { IArt } from '@/../../shared/models/IArt'

const { get, post } = useHttp();
const APIURL = import.meta.env.VITE_APIURL;

const getBasicInfo = (): Promise<IBasicInfo> =>
  get<IApiResponse<IBasicInfo>>(`${APIURL}/widget/basicInfo`).then(res => res.data!);

const getWeather = (): Promise<IWeatherResponse> =>
  get<IApiResponse<IWeatherResponse>>(`${APIURL}/widget/currentWeather`).then(res => res.data!);

const getRandomQuote = (): Promise<IQuote> =>
  get<IApiResponse<IQuote>>(`${APIURL}/widget/randomQuote`).then(res => res.data!);

const getRandomArt = (): Promise<IArt> =>
  get<IApiResponse<IArt>>(`${APIURL}/widget/randomArt`).then(res => res.data!);

export const useApi = () => {
  return {
    getBasicInfo,
    getWeather,
    getRandomQuote,
    getRandomArt
  };
};
