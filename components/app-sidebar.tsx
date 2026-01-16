import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Trash2Icon, MessageCircleIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ModeToggle } from "./theme_toggle";
import { Button } from "./ui/button";
import Link from "next/link";

async function getUserConversations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return [];
  }

  return await prisma.conversations.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

async function deleteConversation(conversationId: string) {
  "use server";

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

function DeleteConversationButton({
  conversationId,
}: {
  conversationId: string;
}) {
  return (
    <form action={deleteConversation.bind(null, conversationId)}>
      <button
        type="submit"
        className="p-1 hover:bg-destructive/10 rounded transition-colors"
        title="Delete conversation">
        <Trash2Icon className="w-4 h-4 text-destructive" />
      </button>
    </form>
  );
}

export async function AppSidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const chats = await getUserConversations();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-end px-2">
            <span className="font-bold text-lg">Simp AI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chats.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150"></div>
                      <MessageCircleIcon className="relative w-12 h-12 mx-auto text-primary/70" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-2">
                      No conversations yet
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      Start your first chat to begin exploring with AI. Your
                      conversations will appear here.
                    </p>
                  </div>
                ) : (
                  chats.map((chat: any) => (
                    <SidebarMenuItem key={chat.id}>
                      <div className="flex items-center w-full">
                        <SidebarMenuButton
                          asChild
                          // isActive={chat.id === currentChatId}
                          className="flex-1">
                          <button className="flex items-center w-full text-left p-2 rounded-md hover:bg-accent/50 transition-colors translate-x-5 group-hover:translate-x-0">
                            <MessageCircleIcon className="w-4 h-4 flex-shrink-0 text-primary/70" />
                            <div className="truncate text-sm font-medium text-foreground flex-1">
                              {chat.title}
                            </div>
                            <DeleteConversationButton
                              conversationId={chat.id}
                            />
                          </button>
                        </SidebarMenuButton>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between p-2">
            {!session?.user ? (
              <Button variant={"default"} size="lg" className="w-full" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <img
                  src={session.user.image || "/default-avatar.png"}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="truncate">
                  <p className="text-sm font-bold">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
            <ModeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
