import { prisma } from "@/lib/db";
import { UIMessage } from "@ai-sdk/react";
import ChatClientPage from "./chat-client-page";
import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function ChatPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let initialMessages: UIMessage[] = [];
  let initialTitle: string | undefined;

  // Check if the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user && id !== "new") {
    // If not authenticated and trying to access an existing chat,
    // we should probably redirect to signin or an error page.
    // For now, let's just return empty messages.
    // Or, more robustly, throw an error or redirect.
    // For this context, we will simply not load messages if unauthorized.
  } else if (id !== "new") {
    try {
      const conversation = await prisma.conversations.findUnique({
        where: { id, userId: session?.user?.id }, // Ensure user can only view their own conversations
      });

      if (conversation) {
        initialMessages = (conversation.messages as any[]).map((msg) => ({
          id: msg.id,
          createdAt: new Date(msg.createdAt),
          role: msg.role,
          content: msg.content || "",
          parts: msg.parts || [],
        }));
        initialTitle = conversation.title;
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
      // Depending on error, might want to show a toast or redirect
    }
  }

  return (
    <ChatClientPage
      id={id}
      initialMessages={initialMessages}
      initialTitle={initialTitle}
    />
  );
}