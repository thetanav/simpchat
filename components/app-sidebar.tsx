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


import { prisma } from "@/lib/db";
import { getSession } from "@/auth";

import { ModeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { DeleteConversationButton } from "@/components/delete-conversation-button";

type Chat = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  messages: unknown;
};

async function getUserConversations() {
  const session = await getSession();

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
  const session = await getSession();
  const chats = await getUserConversations();

  return (
    <Sidebar className="bg-background border-r border-border/40">
      <SidebarHeader className="px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">Simp</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-4">
            Recent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No conversations yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Start a new chat to begin
                  </p>
                </div>
              ) : (
                chats.map((chat: Chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild className="h-9">
                      <Link
                        href={`/c/${chat.id}`}
                        className="flex items-center gap-2.5 px-3 w-full text-left rounded-lg hover:bg-accent/50 transition-colors group">
                        <span className="truncate text-sm text-foreground/80 flex-1">
                          {chat.title}
                        </span>
                        <DeleteConversationButton
                          conversationId={chat.id}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40">
        <div className="flex items-center justify-between px-3 py-2">
          {!session?.user ? (
            <Button variant="default" size="sm" className="w-full" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <Image
                src={session.user.image || "/default-avatar.png"}
                alt="User avatar"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full flex-shrink-0"
              />
              <div className="truncate min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name}
                </p>
              </div>
            </div>
          )}
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
