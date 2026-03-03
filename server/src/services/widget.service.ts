import { IBasicInfo } from "../../../shared/models/IBasicInfo";

export const getProjectInfo = async (): Promise<IBasicInfo> => {
  let basicInfo: IBasicInfo = {
    title: "Smart Display",
    version: "1.0.0 Beta",
    date: new Date()
  }
  return basicInfo;
}