"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteConversation(conversationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.conversations.delete({
    where: {
      id: conversationId,
      userId: session.user.id, // Ensure user can only delete their own conversations
    },
  });

  revalidatePath("/");
}
