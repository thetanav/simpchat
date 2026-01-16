import { z } from "zod";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  LanguageModel,
  CoreMessage,
} from "ai";
import { models } from "@/lib/models";
import { localTools } from "@/lib/tools";
import { systemPrompt } from "@/lib/prompt";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

import { GoogleGenerativeAI } from "@ai-sdk/google";
import { OpenAI } from "@ai-sdk/openai";
import { Groq } from "@ai-sdk/groq";
import { Perplexity } from "@ai-sdk/perplexity";
import { OpenRouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 5;

export type ChatTools = typeof localTools;

// TODO: get the id of the chat here
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

  const { messages, model, deepresearch, id } = parsed.data;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let userApiKeys: Record<string, string> = {};
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKeys: true },
    });
    userApiKeys = (user?.apiKeys || {}) as Record<string, string>;
  }

  const baseTools = models.find((m) => m.value === model)?.tools
    ? localTools
    : {};
  const tools = deepresearch
    ? { ...baseTools, deepresearch: localTools.deepresearch }
    : baseTools;

  const selectedModelConfig = models.find((mo) => mo.value === model);

  let languageModel: LanguageModel | undefined;

  if (selectedModelConfig) {
    const modelProvider = selectedModelConfig.provider || model.split('-')[0]; // Assuming provider is the first part of the model name or explicitly set
    const userApiKey = userApiKeys[modelProvider];

    switch (modelProvider) {
      case "gemini":
        languageModel = new GoogleGenerativeAI({
          apiKey: userApiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        }).chat(selectedModelConfig.modelId || selectedModelConfig.value);
        break;
      case "openai":
        languageModel = new OpenAI({
          apiKey: userApiKey || process.env.OPENAI_API_KEY,
        }).chat(selectedModelConfig.modelId || selectedModelConfig.value);
        break;
      case "groq":
        languageModel = new Groq({
          apiKey: userApiKey || process.env.GROQ_API_KEY,
        }).chat(selectedModelConfig.modelId || selectedModelConfig.value);
        break;
      case "perplexity":
        languageModel = new Perplexity({
          apiKey: userApiKey || process.env.PERPLEXITY_API_KEY,
        }).chat(selectedModelConfig.modelId || selectedModelConfig.value);
        break;
      case "openrouter":
        languageModel = new OpenRouter({
          apiKey: userApiKey || process.env.OPENROUTER_API_KEY,
        }).chat(selectedModelConfig.modelId || selectedModelConfig.value);
        break;
      // Add other providers here
      default:
        languageModel = selectedModelConfig.end as LanguageModel; // Fallback to original if no specific provider handling
    }
  }

  if (!languageModel) {
    return new Response(
      JSON.stringify({
        error: `Model configuration not found for: ${model}`,
      }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const result = streamText({
    model: languageModel,
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
    onFinish: async ({ response }) => {
      if (session?.user?.id && id) {
        try {
          const generatedMessages = response.messages.map((m) => {
            return {
              id: nanoid(),
              createdAt: new Date(),
              role: m.role,
              content: typeof m.content === "string" ? m.content : "",
              parts:
                Array.isArray(m.content)
                  ? m.content.map((p) => {
                    if (p.type === "tool-call") {
                      return {
                        type: "tool-invocation",
                        toolCallId: p.toolCallId,
                        toolName: p.toolName,
                        args: p.args,
                      };
                    }
                    return p;
                  })
                  : [{ type: "text", text: m.content }],
            };
          });

          await prisma.conversations.update({
            where: { id },
            data: {
              messages: [...messages, ...generatedMessages] as any,
            },
          });
        } catch (error) {
          console.error("Failed to save conversation:", error);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        return {
          stats: part.totalUsage,
          reason: part.finishReason,
          model: model,
        };
      }
    },
  });
}
