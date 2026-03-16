import { Request, Response } from "express";
import { IBasicInfo } from "../../../shared/models/IBasicInfo";
import { sendError, sendSuccess } from "../utils/response";
import { JsonHandler, JsonValue } from "../utils/jsonHandler";
import { IWidget } from "../../../shared/models/IWidget";

export const getBasicInfo = async (req: Request, res: Response) => {
  const basicInfo: IBasicInfo = {
    title: "Smart Display",
    version: "1.0.0 Beta",
    date: new Date()
  }

  sendSuccess(res, basicInfo, "Basic information retrieved successfully");
};

let store: JsonHandler | null = null
const getStore = (): Promise<JsonHandler> => {
  if (!store) return JsonHandler.open('widgetData').then(s => (store = s))
  return Promise.resolve(store)
}

export const getWidgets = async (req: Request, res: Response) => {
  const store = await getStore();
  const storedWidgets = store.get<IWidget[]>("widgets");

  if (storedWidgets) {
    sendSuccess(res, storedWidgets, "Widget information retrieved successfully");
  } else {
    sendError(res, "Could not get widgets");
  }
}

export const setWidgets = async (req: Request, res: Response) => {
  const store = await getStore();

  // body has to be IWidget[]
  store.set("widgets", req.body);
  sendSuccess(res, req.body, "Widget information set successfully");
}