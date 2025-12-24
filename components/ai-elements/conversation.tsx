"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, UserIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { memo, useCallback, useEffect, useState } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = memo(({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-auto", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
));

Conversation.displayName = "Conversation";

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const ConversationContent = memo(({
  className,
  ...props
}: ConversationContentProps) => (
    <StickToBottom.Content className={cn("p-6", className)} {...props} />
));

ConversationContent.displayName = "ConversationContent";

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = memo(({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}>
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
));

ConversationEmptyState.displayName = "ConversationEmptyState";

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = memo(({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full",
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}>
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
});

ConversationScrollButton.displayName = "ConversationScrollButton";

export type ConversationUserLocatorProps = {
  messages: Array<{ id: string; role: string }>;
  className?: string;
};

export const ConversationUserLocator = memo(({
  messages,
  className
}: ConversationUserLocatorProps) => {
  const [visible, setVisible] = useState(false);

  // Show locator when there are user messages
  useEffect(() => {
    const hasUserMessages = messages.some(msg => msg.role === 'user');
    setVisible(hasUserMessages);
  }, [messages]);

  if (!visible) return null;

  const latestUserMessage = messages.filter(msg => msg.role === 'user').pop();

  if (!latestUserMessage) return null;

  return (
    <button
      className={cn(
        "fixed right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-primary/60 hover:bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:scale-110 flex items-center justify-center",
        className
      )}
      title="Go to your last message"
      onClick={() => {
        const element = document.getElementById(`message-${latestUserMessage.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }}
    >
      <UserIcon className="w-3 h-3" />
    </button>
  );
});

ConversationUserLocator.displayName = "ConversationUserLocator";
