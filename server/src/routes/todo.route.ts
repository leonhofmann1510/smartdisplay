import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { getTodos, addTodo, updateTodo, deleteTodo } from "../controllers/todo.controller";

const router = Router();

router.get("/list", asyncHandler(getTodos));
router.post("/add", asyncHandler(addTodo));
router.put("/update/:id", asyncHandler(updateTodo));
router.delete("/delete/:id", asyncHandler(deleteTodo));

export default router;
