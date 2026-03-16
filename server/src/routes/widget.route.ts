import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getBasicInfo, getPlaylist } from '../controllers/widget.controller'
import { getCurrentWeather } from "../controllers/weather.controller";
import { getRandomQuote } from "../controllers/quote.controller";
import { getRandomArt } from "../controllers/art.controller";

const router = Router();

router.get("/basicInfo", asyncHandler(getBasicInfo));
router.get("/currentWeather", asyncHandler(getCurrentWeather));
router.get("/playlist", asyncHandler(getPlaylist));
router.get("/randomQuote", asyncHandler(getRandomQuote));
router.get("/randomArt", asyncHandler(getRandomArt));

export default router;