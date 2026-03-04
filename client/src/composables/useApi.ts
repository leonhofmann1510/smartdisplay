import { useHttp } from "./useHttp";
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';
import type { IApiResponse } from '@/../../shared/models/IApiResponse';

const { get, post } = useHttp();
const APIURL = import.meta.env.VITE_APIURL;

const getBasicInfo = (): Promise<IBasicInfo> =>
  get<IApiResponse<IBasicInfo>>(`${APIURL}/widget/basicInfo`).then(res => res.data!);

export const useApi = () => {
  return {
    getBasicInfo
  };
};
