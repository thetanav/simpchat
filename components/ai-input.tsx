import { models } from "@/lib/models";
import { type PromptInputMessage } from "./ai-elements/prompt-input";

import Image from "next/image";
import {
  BrainIcon,
  ChevronDown,
  GemIcon,
  ImageIcon,
  MonitorDownIcon,
  Plus,
  TelescopeIcon,
  ZapIcon,
} from "lucide-react";
import { ChatStatus } from "ai";
import { type Dispatch, type SetStateAction, useState } from "react";
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

type AIInputProps = {
  handleSubmit: (message: PromptInputMessage, deepresearch?: boolean) => void;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  setModel: Dispatch<SetStateAction<string>>;
  model: string;
  status: ChatStatus;
};

// Component for rendering model badges
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

export default function AIInput({
  handleSubmit,
  setInput,
  input,
  setModel,
  model,
  status,
}: AIInputProps) {
  const [deepresearch, setDeepresearch] = useState(false);
  const currentModel = models.find((m) => m.value === model);

  return (
    <div className="flex flex-col bg-card px-4 pt-4 h-48">
      <InputGroupTextarea
        className="w-full"
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask, Search or Chat..."
      />

      <div className="w-full flex items-center justify-between py-2">
        <InputGroupButton
          variant="outline"
          className="rounded-lg cursor-pointer"
          size="icon-sm">
          <Plus />
        </InputGroupButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer">
              {currentModel?.name}
              <ChevronDown />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-64">
            {models.map((modelOption) => (
              <DropdownMenuItem
                key={modelOption.value}
                onClick={() => setModel(modelOption.value)}
                className="cursor-pointer">
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
          className="rounded-lg cursor-pointer"
          size="icon-sm"
          onClick={() => handleSubmit({ text: input }, deepresearch)}
          disabled={!input.trim() && status !== "streaming"}>
          <ArrowUpIcon weight="bold" className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </div>
    </div>
  );
}
