import { ChatSettings } from "../models/ChatSettings";
import axios from "axios";
import { PROMPT } from "../prompt";
import { LLM_API_KEY } from "../config";
import { Context } from "grammy";

export async function handleMessage(ctx: Context) {
  const settings = await ChatSettings.findOneAndUpdate(
    { chatId: ctx.chat!.id.toString() },
    {},
    { upsert: true, new: true }
  );

  const message = ctx.message;
  const fwd = message?.forward_from_chat;
  if (!fwd || fwd.type !== "channel") return;

  const text = message.text ?? message.caption;
  if (!text) return;

  if (text.length < settings.minTextLength) return;
  if (Math.random() * 100 > settings.chancePercent) return;

  try {
    const sent = await ctx.reply("Приступаю к работе...", {
      reply_to_message_id: message.message_id,
    });

    const prompt = PROMPT.replace("{TEXT}", text);

    const requestData = {
      model: "deepseek-r1-distill-llama-70b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    };

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
      }
    );

    const answer = response.data.choices[0].message.content
      .split("</think>")
      .pop()
      ?.trim();

    if (answer) {
      await ctx.api.editMessageText(sent.chat.id, sent.message_id, answer);
    } else {
      throw new Error("Пустой ответ от модели");
    }
  } catch (err) {
    console.error("Ошибка обработки сообщения:", err);
    try {
      await ctx.reply("Что-то не так", {
        reply_to_message_id: message.message_id,
      });
    } catch {}
  }
}
