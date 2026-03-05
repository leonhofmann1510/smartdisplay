import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getBasicInfo, getPlaylist } from '../controllers/widget.controller'
import { getCurrentWeather } from "../controllers/weather.controller";

const router = Router();

router.get("/basicInfo", asyncHandler(getBasicInfo));
router.get("/currentWeather", asyncHandler(getCurrentWeather));
router.get("/playlist", asyncHandler(getPlaylist));

export default router;