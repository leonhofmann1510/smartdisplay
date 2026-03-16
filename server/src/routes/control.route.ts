import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getWidgets, setWidgets } from "../controllers/widget.controller";

const router = Router();

router.get("/getWidgets", asyncHandler(getWidgets));
router.post("/setWidgets", asyncHandler(setWidgets));

export default router;