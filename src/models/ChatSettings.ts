import mongoose from "mongoose";

const chatSettingsSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  minTextLength: { type: Number, default: 50 },
  chancePercent: { type: Number, default: 50 },
});

export const ChatSettings = mongoose.model("ChatSettings", chatSettingsSchema);
