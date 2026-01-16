import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateApiKeysSchema = z.object({
  service: z.string().min(1),
  key: z.string(),
});

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKeys: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user.apiKeys || {});
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateApiKeysSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    const { service, key } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKeys: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const currentApiKeys = (user.apiKeys || {}) as Record<string, string>;
    const updatedApiKeys = {
      ...currentApiKeys,
      [service]: key,
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKeys: updatedApiKeys },
    });

    return NextResponse.json({ success: true, apiKeys: updatedApiKeys });
  } catch (error) {
    console.error("Error updating API keys:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
