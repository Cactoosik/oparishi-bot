import mongoose from "mongoose";
import { MONGODB_URI } from "./config";

export async function connectToDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
  }
}
