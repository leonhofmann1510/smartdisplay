import { useHttp } from "./useHttp";
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';
import type { IWeatherResponse } from '@/../../shared/models/IWeatherResponse';
import type { IApiResponse } from '@/../../shared/models/IApiResponse';

const { get, post } = useHttp();
const APIURL = import.meta.env.VITE_APIURL;

const getBasicInfo = (): Promise<IBasicInfo> =>
  get<IApiResponse<IBasicInfo>>(`${APIURL}/widget/basicInfo`).then(res => res.data!);

const getWeather = (): Promise<IWeatherResponse> =>
  get<IApiResponse<IWeatherResponse>>(`${APIURL}/widget/currentWeather`).then(res => res.data!);

const getPlaylist = (): Promise<IApiResponse<string[]>> =>
  get<IApiResponse<string[]>>(`${APIURL}/widget/playlist`) 

export const useApi = () => {
  return {
    getBasicInfo,
    getWeather,
    getPlaylist
  };
};