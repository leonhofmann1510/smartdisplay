import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getEvents, getThisWeekEvents, addEvent, updateEvent, deleteEvent } from "../controllers/calendar.controller";

const router = Router();

router.get("/events", asyncHandler(getEvents));
router.get("/thisweek", asyncHandler(getThisWeekEvents));
router.post("/add", asyncHandler(addEvent));
router.put("/update/:id", asyncHandler(updateEvent));
router.delete("/delete/:id", asyncHandler(deleteEvent));

export default router;
