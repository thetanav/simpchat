import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title } = CreateConversationSchema.parse(body);

    const conversation = await prisma.conversations.create({
      data: {
        userId: session.user.id,
        title: title || "New Conversation",
        messages: [],
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
