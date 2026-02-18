"use client";

import { type Dispatch, type SetStateAction } from "react";
import { type ChatStatus } from "ai";
import Image from "next/image";
import {
  BrainIcon,
  ChevronDown,
  GemIcon,
  ImageIcon,
  MonitorDownIcon,
  ZapIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputActionMenuTrigger,
  type PromptInputMessage,
} from "./ai-elements/prompt-input";
import { models } from "@/lib/models";

type ChatInputProps = {
  handleSubmit: (message: PromptInputMessage, deepresearch?: boolean) => void;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  setModel: Dispatch<SetStateAction<string>>;
  model: string;
  status: ChatStatus;
  stop: () => void;
};

function ModelBadge({
  variant,
  icon: Icon,
}: {
  variant: "reasoning" | "fast" | "image" | "pro" | "local";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const variantConfig = {
    reasoning:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    fast: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    image:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    pro: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    local:
      "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded text-xs font-medium ${variantConfig[variant]}`}>
      <Icon className="w-3 h-3" />
    </div>
  );
}

export default function ChatInput({
  handleSubmit,
  setInput,
  input,
  setModel,
  model,
  status,
  stop,
}: ChatInputProps) {
  const currentModel = models.find((m) => m.value === model);

  const onFormSubmit = (message: PromptInputMessage) => {
    handleSubmit(message);
  };

  const handleStop = async () => {
    stop();
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <PromptInput
          onSubmit={onFormSubmit}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent/50">
                    {currentModel && (
                      <Image
                        alt={currentModel.name}
                        src={"/ai-logos" + currentModel.logo}
                        width={14}
                        height={14}
                        className="flex-shrink-0 opacity-70"
                      />
                    )}
                    <span className="text-xs font-medium">{currentModel?.name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-72">
                  {models.map((modelOption) => (
                    <DropdownMenuItem
                      key={modelOption.value}
                      onClick={() => setModel(modelOption.value)}
                      className="cursor-pointer">
                      <div className="flex items-center gap-3 w-full">
                        <Image
                          alt={modelOption.name}
                          src={"/ai-logos" + modelOption.logo}
                          width={16}
                          height={16}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{modelOption.name}</p>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {modelOption.reasoning && (
                            <ModelBadge
                              variant="reasoning"
                              icon={BrainIcon}
                              label="Reasoning"
                            />
                          )}
                          {modelOption.fast && (
                            <ModelBadge
                              variant="fast"
                              icon={ZapIcon}
                              label="Fast"
                            />
                          )}
                          {modelOption.image && (
                            <ModelBadge
                              variant="image"
                              icon={ImageIcon}
                              label="Image"
                            />
                          )}
                          {modelOption.pro && (
                            <ModelBadge
                              variant="pro"
                              icon={GemIcon}
                              label="Pro"
                            />
                          )}
                          {modelOption.local && (
                            <ModelBadge
                              variant="local"
                              icon={MonitorDownIcon}
                              label="Local"
                            />
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input.trim() && status !== "streaming"}
              status={status}
              stop={handleStop}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
