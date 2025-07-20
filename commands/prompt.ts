import { PROMPT } from "../prompt";
import { Context } from "grammy";

export async function handlePrompt(ctx: Context) {
  await ctx.reply(
    `Текущий промпт:\n\n\`\`\`${PROMPT}\`\`\`\nЕсли есть предложения по его улучшению, стучитесь в личку @sexofum2`,
    {
      parse_mode: "Markdown",
      reply_to_message_id: ctx.message!.message_id,
    }
  );
}
