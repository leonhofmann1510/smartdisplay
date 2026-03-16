import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { apiFetch } from "../utils/apiFetch";
import { IArt } from "../../../shared/models/IArt";

const artworks: IArt[] = [];
let lastSaved: number = 0;

export const getRandomArt = async (req: Request, res: Response) => {

  if (artworks.length == 0
    || (lastSaved + 1000*60*60 < Date.now())) {
    
    const randomPage = Math.floor(Math.random() * 1000) + 1;
    const url = `https://api.artic.edu/api/v1/artworks?page=${randomPage}&limit=30&fields=title,image_id,artist_title,thumbnail`;
    const rawData = await apiFetch.get<any>(url);

    for (const entry of rawData['data']) {
      const imageLink = `https://www.artic.edu/iiif/2/${entry['image_id']}/full/843,/0/default.jpg`;
      artworks.push({ title: entry['title'], artist: entry['artist_title'], description: entry['thumbnail']['alt_text'], image: imageLink })
    }

    lastSaved = Date.now();
  }

  const data = artworks[Math.floor(Math.random() * artworks.length)]
  sendSuccess(res, data, "Art retrieved successfully");
};