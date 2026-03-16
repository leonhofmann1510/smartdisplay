import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { IQuote } from "../../../shared/models/IQuote";
import { apiFetch } from "../utils/apiFetch";

const quotes: IQuote[] = [];
let lastSaved: number = 0;

export const getRandomQuote = async (req: Request, res: Response) => {

  if (quotes.length == 0
    || (lastSaved + 1000*60*60 < Date.now())) {
    const rawData = await apiFetch.get<any>('https://zenquotes.io/api/quotes');

    for (const entry of rawData) {
      quotes.push({ text: entry['q'], person: entry['a'] })
    }

    lastSaved = Date.now();
  }

  const data = quotes[Math.floor(Math.random() * quotes.length)]
  sendSuccess(res, data, "Quote retrieved successfully");
};