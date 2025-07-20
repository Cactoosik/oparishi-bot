import { ChatSettings } from "../models/ChatSettings";
import { Context } from "grammy";

export async function handleSetConfig(ctx: Context) {
  const isAdmin =
    ctx.chat?.type === "private" ||
    (await ctx
      .getChatMember(ctx.from!.id)
      .then((m) => ["administrator", "creator"].includes(m.status)));

  if (!isAdmin) {
    return ctx.reply("Только админы могут менять настройки", {
      reply_to_message_id: ctx.message!.message_id,
    });
  }

  const [_, minLenRaw, chanceRaw] = ctx.message!.text.split(" ");
  const minTextLength = parseInt(minLenRaw);
  const chancePercent = parseInt(chanceRaw);

  if (isNaN(minTextLength) || isNaN(chancePercent)) {
    const settings = await ChatSettings.findOne({
      chatId: ctx.chat!.id.toString(),
    });
    return ctx.reply(
      `Пример: \`/setconfig 80 25\`\n\nГде 80 символов минимальная длина новости, 25% — шанс обработки\n\n(сейчас в чате это ${settings!.minTextLength} и ${settings!.chancePercent}%)`,
      {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.message!.message_id,
      }
    );
  }

  await ChatSettings.findOneAndUpdate(
    { chatId: ctx.chat!.id.toString() },
    { minTextLength, chancePercent },
    { upsert: true }
  );

  ctx.reply(
    `Настройки обновлены:\n- Минимальная длина новости: ${minTextLength}\n- Шанс обработки: ${chancePercent}%`,
    {
      reply_to_message_id: ctx.message!.message_id,
    }
  );
}
