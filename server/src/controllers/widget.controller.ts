import { Request, Response } from "express";
import { IBasicInfo } from "../../../shared/models/IBasicInfo";
import { sendSuccess } from "../utils/response";

export const getBasicInfo = async (req: Request, res: Response) => {
  const basicInfo: IBasicInfo = {
    title: "Smart Display",
    version: "1.0.0 Beta",
    date: new Date()
  }

  sendSuccess(res, basicInfo, "Basic information retrieved successfully");
};