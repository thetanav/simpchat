"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptInput, PromptInputBody, PromptInputTextarea, PromptInputToolbar, PromptInputSubmit, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatStatus } from "ai";
import { BotIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const examplePrompts = [
    "What is the meaning of life?",
    "Write a poem about a robot who falls in love with a human.",
    "What is the best way to learn a new language?",
]

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;

    setStatus("submitted");

    // Create a new conversation
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
      setStatus("error");
      const errMsg =
        error instanceof Error ? error.message : "Failed to start conversation";
      // Removed dummy redirect, now show a toast error
      // router.push(`/c/${Date.now()}`); 
      toast.error("Failed to start conversation", { description: errMsg });
    }
  };

  const stop = async () => {
    setStatus("ready");
  };

  return (
    <div className="max-w-3xl mx-auto pt-0 p-3 relative size-full h-screen">
      <div className="absolute flex flex-col top-0 left-0 right-0 bottom-0 space-y-8 -z-50 items-center justify-center text-center mb-24 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150"></div>
          <BotIcon
            className="relative w-24 h-24 text-primary drop-shadow-lg"
            suppressHydrationWarning={true}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
            Hello, how can I help you today?
          </h2>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed font-medium">
            I am Simp, an agentic AI designed to help you with anything you need.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
            {examplePrompts.map((prompt) => (
                <Button key={prompt} variant="outline" onClick={() => setInput(prompt)}>{prompt}</Button>
            ))}
        </div>
      </div>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
            <PromptInput
              onSubmit={handleSubmit}
              className="border-t bg-background/80 backdrop-blur-md border-border/50 shadow-lg outline-none rounded-full">
              <PromptInputBody>
                <PromptInputTextarea
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  placeholder="Ask me anything..."
                  className="min-h-[60px] resize-none border-0 bg-transparent px-6 py-4 text-base focus:ring-0 placeholder:text-muted-foreground/60 outline-none"
                />
              </PromptInputBody>
              <PromptInputToolbar>
                <div className="flex justify-end px-2">
                  <PromptInputSubmit
                    disabled={!input.trim()}
                    status={status}
                    stop={stop}
                    className="h-10 w-10 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  />
                </div>
              </PromptInputToolbar>
            </PromptInput>
          </div>
    </div>
  );
}