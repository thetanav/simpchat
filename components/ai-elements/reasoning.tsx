"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Response } from "./response";
import Shimmer from "./shimmer";
import type { FC } from "react";

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;
// Minimal helpers for the reasoning UI: spinner, brain icon, and a small status component.
// Inserted here so Trigger / other components can render a very minimal thinking/reasoned UI.


export const Spinner: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn("animate-spin", className)}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden>
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);
Spinner.displayName = "Spinner";

export const BrainIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn(className)}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden>
    <path
      d="M12 2c-1.1 0-2 .9-2 2v1.1A3.5 3.5 0 008.5 8C7.12 8 6 9.12 6 10.5V12H4a2 2 0 00-2 2v1a6 6 0 006 6h8a6 6 0 006-6v-1a2 2 0 00-2-2h-2v-1.5C20 9.12 18.88 8 17.5 8A3.5 3.5 0 0014 5.1V4c0-1.1-.9-2-2-2z"
      fill="currentColor"
      opacity="0.95"
    />
  </svg>
);
BrainIcon.displayName = "BrainIcon";

export const ReasoningStatus = memo(function ReasoningStatus() {
  const { isStreaming, duration } = useReasoning();

  // While streaming: minimal shimmer text + spinner
  if (isStreaming) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Shimmer text="thinking..." />
        <Spinner className="w-4 h-4 text-primary" />
      </div>
    );
  }

  // After thinking finished: minimal "reasoned" label with brain icon
  if (!isStreaming && duration > 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BrainIcon className="text-primary" />
        <span className="uppercase tracking-wide text-xs">reasoned</span>
      </div>
    );
  }

  return null;
});
ReasoningStatus.displayName = "ReasoningStatus";
export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = false,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const [duration, setDuration] = useControllableState({
      prop: durationProp,
      defaultProp: 0,
    });

    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          setStartTime(Date.now());
        }
      } else if (startTime !== null) {
        setDuration(Math.ceil((Date.now() - startTime) / MS_IN_S));
        setStartTime(null);
      }
    }, [isStreaming, startTime, setDuration]);

    useEffect(() => {
      if (defaultOpen && !isStreaming && isOpen && !hasAutoClosed) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosed(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosed]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
    };

    if (isStreaming) {
      return <Shimmer text="thinking..." />;
    }

    // Only render if streaming (thinking) or if it has been opened manually
    if (!isStreaming && !isOpen) {
      return null;
    }

    return (
      <ReasoningContext.Provider
        value={{ isStreaming, isOpen, setIsOpen, duration }}>
        <Collapsible
          className={cn("not-prose", className)}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}>
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  }
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger>;

export const ReasoningTrigger = memo(
  ({ className, children, ...props }: ReasoningTriggerProps) => {
    const { isStreaming } = useReasoning();

    // Beautiful shimmer effect without text when thinking
    const triggerContent =
      children ??
      (isStreaming ? (
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-12 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/25 to-transparent rounded-2xl shimmer-thinking"></div>
          </div>
        </div>
      ) : null);

    if (!triggerContent) {
      return null;
    }

    return (
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-center py-8",
          className
        )}
        {...props}>
        {triggerContent}
      </CollapsibleTrigger>
    );
  }
);

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = scrollRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight; // scroll to bottom when content grows
      }
    }, [children]);

    return (
      <CollapsibleContent
        className={cn(
          "mt-4 text-sm relative",
          "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
          className
        )}
        {...props}>
        <Response
          ref={scrollRef}
          className="grid gap-2 relative z-0 pb-3 max-h-48 overflow-y-auto">
          {children}
        </Response>
      </CollapsibleContent>
    );
  }
);

Reasoning.displayName = "Reasoning";
ReasoningTrigger.displayName = "ReasoningTrigger";
ReasoningContent.displayName = "ReasoningContent";
