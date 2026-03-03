import { useHttp } from "./useHttp";
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';

const { get, post } = useHttp();
const APIURL = import.meta.env.VITE_APIURL;

const getBasicInfo = (): Promise<IBasicInfo> => get<IBasicInfo>(`${APIURL}/widget/basicInfo`);

export const useApi = () => {
  return {
    getBasicInfo
  };
};
