import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const DISPLAY_PASSWORD = process.env.DISPLAY_PASSWORD!;

export const login = async (req: Request, res: Response) => {
  const { password } = req.body;

  if (password !== DISPLAY_PASSWORD) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { device: "smart-display" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  sendSuccess(res, token, "Basic information retrieved successfully");
};