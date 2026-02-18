"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputActionMenuTrigger,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { ChatStatus } from "ai";
import { toast } from "sonner";
import { SparklesIcon } from "lucide-react";

const suggestions = [
  "Explain quantum computing simply",
  "Write a Python script to analyze data",
  "Help me plan a trip to Japan",
  "What are the latest AI breakthroughs?",
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;

    setStatus("submitted");

    try {
      const title = message.text.slice(0, 50) || "New Chat";
      const res = await fetch("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ title }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create conversation");

      const { id } = await res.json();
      router.push(`/c/${id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      setStatus("ready");
      const errMsg =
        error instanceof Error ? error.message : "Failed to start conversation";
      toast.error("Failed to start conversation", { description: errMsg });
    }
  };

  const stop = async () => {
    setStatus("ready");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full px-6 pb-8">
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex items-center gap-2.5">
            <SparklesIcon className="w-7 h-7 text-foreground/80" />
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              What can I help with?
            </h1>
          </div>
        </div>

        {/* Input bar */}
        <div className="w-full max-w-2xl">
          <PromptInput
            onSubmit={handleSubmit}
            className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Message Simp..."
                className="min-h-[52px] text-base"
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputActionMenuTrigger />
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!input.trim()}
                status={status}
                stop={stop}
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-2xl">
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="text-sm px-3.5 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-accent/50 transition-all duration-150 cursor-pointer">
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
