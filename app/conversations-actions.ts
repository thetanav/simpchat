"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/auth";
import { revalidatePath } from "next/cache";

export async function deleteConversation(conversationId: string) {
  const session = await getSession();

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
