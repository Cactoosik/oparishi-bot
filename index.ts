import { Bot, Context } from "grammy";
import { config } from "dotenv";
import axios from "axios";

config();

const bot = new Bot<Context>(process.env.BOT_TOKEN!);

const MIN_TEXT_LENGTH = 50;

const PROMPT = `
Ты должен изменить отправленную ниже новость по шаблону. Это такой прикол нижнего интернета
Вот шаблон новости:
Кишечную палочку нашли в сэндвичах Subway. Там же — опарыши в салатах, тараканы на кухне и гнилые продукты. Санитарные нарушения выявили в нескольких заведениях в Москве, пишут СМИ. Готовят повара из просрочки, смешивая списанные ингредиенты со свежими. 
По словам сотрудников, овощи закупаются по уценке — так сеть экономит средства. Также среди работников много несовершеннолетних с поддельными медкнижками, трудящихся за мизерные зарплаты.

Правила того что ты должен делать:
- Всегда добавляй вставку: «Там же — опарыши в салатах, тараканы на кухне и гнилые продукты» (после того как обозначен объект новости).
- Можешь добавлять что-то абсурдное про subway. Также можешь приплетать действия роскомнадзора или госдумы, говоря что они хотят что-то запретить (если это немного соответствует контексту новости)
- Переработай сообщение в духе мема, сохранив узнаваемые части.
- Отправь в ответ ТОЛЬКО новую версию новости, без кавычек, без лишнего мусора, сохраняя также размер букв
- Если в конце новости есть хендл канала или "(название). Подписаться", то обязательно сохрани его как есть

Вот новость:
"""
{TEXT}
"""
`;

bot.command("prompt", async (ctx) => {
  await ctx.reply(`Текущий промпт:\n\n\`\`\`${PROMPT}\`\`\`\nЕсли есть предложения по его улучшению, стучитесь в личку @sexofum2`, {
    parse_mode: "Markdown",
    reply_to_message_id: ctx.message!.message_id
  });
});

bot.on("message", async (ctx) => {
  const message = ctx.message;

  // Проверяем, что это пересланное сообщение ОТ КАНАЛА
  const fwd = message.forward_from_chat;
  if (!fwd || fwd.type !== "channel") return;

  const text = message.text ?? message.caption;
  if (!text || text.length < MIN_TEXT_LENGTH) return;

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
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
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
});

bot.start();
