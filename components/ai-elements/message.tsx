import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, HTMLAttributes } from "react";
import { memo } from "react";
import { EditIcon, TrashIcon } from "lucide-react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
  actions?: React.ReactNode;
  actionsVariant?: "hover" | "inline";
};

export const Message = memo(({
  className,
  from,
  actions,
  actionsVariant = "hover",
  ...props
}: MessageProps) => (
  <div
    className={cn(
      "group w-full py-6 relative",
      actionsVariant === "inline" && "relative",
      className
    )}
    {...props}>
    {actions && from === "user" && actionsVariant === "hover" && (
      <div className="flex justify-end mb-2">
        <div className="flex-shrink-0">{actions}</div>
      </div>
    )}
    <div
      className={cn(
        "flex w-full items-end gap-2",
        from === "user"
          ? "is-user justify-end"
          : "is-assistant flex-row-reverse justify-end"
      )}>
      {props.children}
      {actions && from === "assistant" && actionsVariant === "hover" && (
        <div className="flex-shrink-0">{actions}</div>
      )}
    </div>
    {actions && from === "user" && actionsVariant === "inline" && actions}
  </div>
));

Message.displayName = "Message";

const messageContentVariants = cva(
  "is-user:dark flex flex-col gap-2 overflow-hidden text-base prose",
  {
    variants: {
      variant: {
        contained: [
          "max-w-[85%]",
          "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:py-4 group-[.is-user]:px-5 group-[.is-user]:rounded-2xl group-[.is-user]:shadow-sm",
          "group-[.is-assistant]:text-foreground",
        ],
        flat: [
          "group-[.is-user]:max-w-[80%] group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
          "group-[.is-assistant]:text-foreground",
        ],
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  }
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>;

export const MessageContent = memo(({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}>
    {children}
  </div>
));

MessageContent.displayName = "MessageContent";

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = memo(({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn("size-8 ring-1 ring-border", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
));

MessageAvatar.displayName = "MessageAvatar";

export type MessageActionsProps = {
  role: UIMessage["role"];
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  variant?: "hover" | "inline";
};

export const MessageActions = memo(({
  role,
  onEdit,
  onDelete,
  isEditing,
  variant = "hover",
}: MessageActionsProps) => {
  const canEdit = role === "user";
  const canDelete = true; // Both user and assistant messages can be deleted

  if (!canEdit && !canDelete) return null;

  if (variant === "inline") {
    // For inline variant (user messages), show delete button on hover without hiding content
    return (
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {canDelete && onDelete && (
          <Button variant="secondary" size="icon" onClick={onDelete}>
            <TrashIcon className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Default hover variant for assistant messages (only edit button)
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {canEdit && onEdit && !isEditing && (
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <EditIcon className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
});

MessageActions.displayName = "MessageActions";

// Separate component for assistant message delete button
export const AssistantMessageDelete = memo(({
  onDelete,
}: {
  onDelete?: () => void;
}) => {
  if (!onDelete) return null;

  return (
    <Button variant="ghost" size="icon" onClick={onDelete}>
      <TrashIcon className="h-3 w-3" />
    </Button>
  );
});

AssistantMessageDelete.displayName = "AssistantMessageDelete";
