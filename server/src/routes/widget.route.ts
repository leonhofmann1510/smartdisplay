import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getBasicInfo } from '../controllers/widget.controller'

const router = Router();

router.get("/basicInfo", asyncHandler(getBasicInfo));

export default router;