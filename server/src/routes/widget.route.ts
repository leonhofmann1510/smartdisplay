import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getBasicInfo } from '../controllers/widget.controller'
import { getCurrentWeather } from "../controllers/weather.controller";

const router = Router();

router.get("/basicInfo", asyncHandler(getBasicInfo));
router.get("/currentWeather", asyncHandler(getCurrentWeather));

export default router;