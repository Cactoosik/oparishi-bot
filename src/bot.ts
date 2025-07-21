import { Bot } from "grammy";
import { BOT_TOKEN } from "./config";
import { connectToDB } from "./db";
import { handleSetConfig } from "./commands/setconfig";
import { handlePrompt } from "./commands/prompt";
import { handleMessage } from "./handlers/onMessage";

const bot = new Bot(BOT_TOKEN);

bot.command("setconfig", handleSetConfig);
bot.command("prompt", handlePrompt);
bot.on("message", handleMessage);

connectToDB();
bot.start();
