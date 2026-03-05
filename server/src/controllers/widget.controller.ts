import { Request, Response } from "express";
import { IBasicInfo } from "../../../shared/models/IBasicInfo";
import { sendSuccess } from "../utils/response";

import { readdir } from 'fs/promises';
import path from 'path';

export const getBasicInfo = async (req: Request, res: Response) => {
  const basicInfo: IBasicInfo = {
    title: "Smart Display",
    version: "1.0.0 Beta",
    date: new Date()
  }

  sendSuccess(res, basicInfo, "Basic information retrieved successfully");
};

export const getPlaylist = async (req: Request, res: Response) => {
  const playlistPath = path.join(__dirname, '../../public/audio/playlist');
  const playlist = await readdir(playlistPath);
  sendSuccess(res, playlist);
};