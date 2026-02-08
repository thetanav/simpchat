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
import { MessageCircleIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ModeToggle } from "./theme_toggle";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { DeleteConversationButton } from "@/components/delete-conversation-button"; // Import the new client component

type Chat = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  messages: any;
};

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

export async function AppSidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const chats = await getUserConversations();

  return (
    <>
      <Sidebar className="bg-background">
        <SidebarHeader>
          <span className="font-bold text-xl">Simp AI</span>
        </SidebarHeader>
        <div className="p-2">
          <Button asChild className="w-full">
            <Link href="/">
              <MessageCircleIcon className="w-4 h-4 mr-2" />
              New Chat
            </Link>
          </Button>
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="w-fit">
                {chats.length === 0 ? (
                  <div className="py-12 text-center">
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
                  chats.map((chat: Chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div className="flex items-center">
                        <SidebarMenuButton
                          asChild
                          // isActive={chat.id === currentChatId}
                          className="flex-1">
                          <Link
                            href={`/c/${chat.id}`}
                            className="flex items-center w-full text-left p-2 rounded-md hover:bg-accent/50 transition-colors">
                            <MessageCircleIcon className="w-3 h-3 flex-shrink-0 text-primary/70" />
                            <div className="truncate text-sm font-medium text-foreground flex-1">
                              {chat.title}
                            </div>
                            <DeleteConversationButton
                              conversationId={chat.id}
                            />
                          </Link>
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
                <Image
                  src={session.user.image || "/default-avatar.png"}
                  alt="User avatar"
                  width={32}
                  height={32}
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
