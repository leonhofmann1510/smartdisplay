import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getBasicInfo } from '../controllers/widget.controller'
import { getCurrentWeather } from "../controllers/weather.controller";
import { getRandomQuote } from "../controllers/quote.controller";
import { getRandomArt } from "../controllers/art.controller";
import { getMusicState, postMusicAction, getMusicCover, syncTrackTime } from "../controllers/music.controller";

const router = Router();

router.get("/basicInfo", asyncHandler(getBasicInfo));
router.get("/currentWeather", asyncHandler(getCurrentWeather));
router.get("/randomQuote", asyncHandler(getRandomQuote));
router.get("/randomArt", asyncHandler(getRandomArt));

router.get("/music/state", asyncHandler(getMusicState));
router.post("/music/action", asyncHandler(postMusicAction));
router.get("/music/cover/:index", asyncHandler(getMusicCover));
router.post("/music/sync", asyncHandler(syncTrackTime));

export default router;
