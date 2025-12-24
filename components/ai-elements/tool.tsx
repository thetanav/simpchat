"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ToolUIPart } from "ai";
import type { ComponentProps, ReactNode } from "react";
import { memo } from "react";
import { CodeBlock } from "./code-block";
import Shimmer from "./shimmer";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = memo(({ className, ...props }: ToolProps) => (
  <Collapsible className={cn("not-prose my-2 w-full", className)} {...props} />
));

Tool.displayName = "Tool";

export type ToolHeaderProps = {
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  className?: string;
  name: string;
};

export const ToolHeader = memo(({
  className,
  state,
  name,
  ...props
}: ToolHeaderProps) => (
  // @ts-expect-error: CollapsibleTrigger prop types are incompatible with inferred ToolHeader props
  <CollapsibleTrigger
    className={cn(
      "flex w-full items-center justify-between gap-4 p-0",
      className
    )}
    {...props}>
    <div className="flex items-center justify-center">
      {state != "output-available" ? (
        <Shimmer text={`${name}`} />
      ) : (
        <span className="text-muted-foreground text-md font-bold">{name}</span>
      )}
    </div>
  </CollapsibleTrigger>
));

ToolHeader.displayName = "ToolHeader";

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = memo(({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
));

ToolContent.displayName = "ToolContent";

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export const ToolInput = memo(({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("space-y-2 overflow-hidden p-4", className)} {...props}>
    <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
      Parameters
    </h4>
    <div className="rounded-md bg-muted/50">
      <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
    </div>
  </div>
));

ToolInput.displayName = "ToolInput";

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolUIPart["output"];
  errorText: ToolUIPart["errorText"];
};

export const ToolOutput = memo(({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  let Output = <div>{output as ReactNode}</div>;

  if (typeof output === "object") {
    Output = (
      <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
    );
  } else if (typeof output === "string") {
    Output = <CodeBlock code={output} language="json" />;
  }

  return (
    <div className={cn("space-y-2 p-4", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {errorText ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto rounded-md text-xs [&_table]:w-full",
          errorText
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-foreground"
        )}>
        {errorText && <div>{errorText}</div>}
        {Output}
      </div>
    </div>
  );
});

ToolOutput.displayName = "ToolOutput";
