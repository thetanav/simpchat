import { z } from "zod";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  LanguageModel,
} from "ai";
import { models } from "@/lib/models";
import { localTools } from "@/lib/tools";
import { systemPrompt } from "@/lib/prompt";

export const maxDuration = 30;

export type ChatTools = typeof localTools;

const RequestBodySchema = z.object({
  title: z.optional(z.string()),
  id: z.string(),
  messages: z.array(z.unknown()),
  model: z.string(),
  deepresearch: z.boolean().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RequestBodySchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request body",
        details: parsed.error.format(),
      }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const { messages, model, deepresearch } = parsed.data;

  const baseTools = models.find((m) => m.value === model)?.tools
    ? localTools
    : {};
  const tools = deepresearch
    ? { ...baseTools, deepresearch: localTools.deepresearch }
    : baseTools;

  const result = streamText({
    model: models.find((mo) => mo.value == model)?.end as LanguageModel,
    messages: convertToModelMessages(
      messages as unknown as Parameters<typeof convertToModelMessages>[0]
    ),
    system: systemPrompt,
    tools,
    stopWhen: stepCountIs(20),
    // maxOutputTokens: 4000,
    onError: (err) => {
      console.error("streamText error:", err);
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        // TODO: add the message to the database
        return {
          stats: part.totalUsage,
          reason: part.finishReason,
          model: model,
        };
      }
    },
  });
}
