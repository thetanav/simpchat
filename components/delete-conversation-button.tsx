"use client";

import { Trash2Icon, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { deleteConversation } from "@/app/conversations-actions"; // Import the server action

function DeleteButtonInner() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="p-1 hover:bg-destructive/10 rounded transition-colors"
      title="Delete conversation"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 text-destructive animate-spin" />
      ) : (
        <Trash2Icon className="w-4 h-4 text-destructive" />
      )}
    </button>
  );
}

export function DeleteConversationButton({
  conversationId,
}: {
  conversationId: string;
}) {
  return (
    <form action={deleteConversation.bind(null, conversationId)}>
      <DeleteButtonInner />
    </form>
  );
}
