import { Request, Response } from "express";
import { getProjectInfo } from "../services/widget.service";
import { IBasicInfo } from "../../../shared/models/IBasicInfo";
import { sendSuccess } from "../utils/response";

export const getBasicInfo = async (req: Request, res: Response) => {
  const info: IBasicInfo = await getProjectInfo();
  sendSuccess(res, info, "Basic information retrieved successfully");
};