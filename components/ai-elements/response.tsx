"use client";

import { cn } from "@/lib/utils";
import { memo, forwardRef } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import "katex/dist/katex.min.css";

type ResponseProps = {
  children?: React.ReactNode;
  className?: string;
  isStreaming?: boolean;
};

export const Response = memo(
  forwardRef<HTMLDivElement, ResponseProps>(
    ({ className, children, isStreaming = false }, ref) => (
      <div
        ref={ref}
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose prose-sm max-w-none",
          // Enhanced typography
          "prose-headings:font-medium prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-strong:text-foreground prose-strong:font-medium",
          "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
          "prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg",
          "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:font-normal",
          "prose-ul:text-foreground prose-ol:text-foreground",
          "prose-li:text-foreground prose-li:leading-relaxed",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-hr:border-border",
          className
        )}>
        {typeof children === "string" ? (
          <Streamdown
            plugins={{ code, math }}
            isAnimating={isStreaming}>
            {children}
          </Streamdown>
        ) : (
          children
        )}
      </div>
    )
  ),
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.isStreaming === nextProps.isStreaming
);

Response.displayName = "Response";
