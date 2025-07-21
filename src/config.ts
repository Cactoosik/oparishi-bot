import { config } from "dotenv";
config();

export const BOT_TOKEN = process.env.BOT_TOKEN!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const LLM_API_KEY = process.env.LLM_API_KEY!;
