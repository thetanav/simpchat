"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { type ChatStatus } from "ai";
import Image from "next/image";
import {
  BrainIcon,
  ChevronDown,
  GemIcon,
  ImageIcon,
  Loader2,
  MonitorDownIcon,
  Plus,
  StopCircleIcon,
  ZapIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ArrowUpIcon } from "@phosphor-icons/react";
import { models } from "@/lib/models";

// Local type for message, simplified as per user request to not use ai-elements
type PromptInputMessage = {
  text?: string;
};

type ChatInputProps = {
  handleSubmit: (message: PromptInputMessage, deepresearch?: boolean) => void;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  setModel: Dispatch<SetStateAction<string>>;
  model: string;
  status: ChatStatus;
  stop: () => void;
};

// Component for rendering model badges (moved from AIInput)
function ModelBadge({
  variant,
  icon: Icon,
  label,
}: {
  variant: "reasoning" | "fast" | "image" | "pro" | "local";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const variantConfig = {
    reasoning:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    fast: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    image: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
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
  const isStreaming = status === "streaming";
  const currentModel = models.find((m) => m.value === model);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit({ text: input });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {isStreaming && (
        <Button
          variant="outline"
          className="absolute -top-12 z-10 flex items-center gap-2"
          onClick={stop}
        >
          <StopCircleIcon className="w-4 h-4" />
          Stop Generating
        </Button>
      )}

      <InputGroup className="bg-card px-4 pt-4 flex-col h-48">
        <InputGroupTextarea
          className="w-full"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask, Search or Chat..."
          value={input}
        />
        <InputGroupButton
          variant="default"
          className="rounded-lg cursor-pointer"
          size="icon-sm"
          onClick={() => handleSubmit({ text: input })}
          disabled={!input.trim() || isStreaming}
        >
          {isStreaming ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUpIcon weight="bold" className="h-5 w-5" />
          )}
          <span className="sr-only">Send</span>
        </InputGroupButton>

        <InputGroupAddon className="w-full flex items-center justify-between py-2">
          <InputGroupButton
            variant="outline"
            className="rounded-lg cursor-pointer"
            size="icon-sm"
          >
            <Plus />
          </InputGroupButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton variant="ghost" className="cursor-pointer">
                {" "}
                {currentModel?.name}
                <ChevronDown />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-64">
              {models.map((modelOption) => (
                <DropdownMenuItem
                  key={modelOption.value}
                  onClick={() => setModel(modelOption.value)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Image
                      alt={modelOption.name}
                      src={"/ai-logos" + modelOption.logo}
                      width={15}
                      height={15}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">{modelOption.name}</p>
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
                        <ModelBadge variant="fast" icon={ZapIcon} label="Fast" />
                      )}
                      {modelOption.image && (
                        <ModelBadge
                          variant="image"
                          icon={ImageIcon}
                          label="Image"
                        />
                      )}
                      {modelOption.pro && (
                        <ModelBadge variant="pro" icon={GemIcon} label="Pro" />
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
          <InputGroupButton
            variant="default"
            className="rounded ml-auto"
            size="icon-xs"
            onClick={() => handleSubmit({ text: input })}
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}