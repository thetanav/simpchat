"use client";

import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationUserLocator,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageActions,
} from "@/components/ai-elements/message";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Reasoning } from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { models } from "@/lib/models";
import { Tool } from "@/components/ai-elements/tool";
import { DynamicToolUIPart } from "ai";
import { toast } from "sonner";
import { BoxIcon, GlobeIcon, SmileIcon } from "lucide-react";
import Navbar from "@/components/navbar";
import AIInput from "@/components/ai-input";
import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useSession } from "@/lib/auth-client";
import Shimmer from "@/components/ai-elements/shimmer";

const ChatBotDemo = () => {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  // TODO: rename to messages

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Tool display names mapping
  const getToolDisplayName = (toolType: string, state: string) => {
    const baseNames: Record<string, string> = {
      time: "Knowing Current time",
      calculate: "Performing calculations",
      search: "Searching the web",
      scrape: "Viewing the page",
      deepresearch: "Deep research analysis",
    };

    if (toolType === "search" && state !== "output-available") {
      return "Searching...";
    }

    return baseNames[toolType] || toolType;
  };

  const { messages, sendMessage, status, stop } = useChat({
    onError: (error) => {
      const message =
        (error as { message?: string })?.message ||
        "Something went wrong while contacting the server.";
      toast.error("Request failed", {
        description: message,
      });
    },
    onFinish: (messages) => {
      if (conversationId) {
        fetch(`/api/conversations/${conversationId}`, {
          method: "PUT",
          body: JSON.stringify({ messages }),
          headers: { "Content-Type": "application/json" },
        }).catch((error) =>
          console.error("Error updating conversation:", error)
        );
      }
    },
  });

  const handleSubmit = async (
    message: PromptInputMessage,
    deepresearch?: boolean
  ) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    if (!conversationId) {
      const title = message.text?.slice(0, 50) || "New Chat";
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          body: JSON.stringify({ title }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to create conversation");
        const { id } = await res.json();
        setConversationId(id);
      } catch (error) {
        console.error("Error creating conversation:", error);
        toast.error("Failed to start conversation");
        return;
      }
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          deepresearch,
        },
      }
    );
    setInput("");
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
  };

  return (
    <div className="max-w-3xl mx-auto pt-0 p-3 relative size-full h-screen">
      <Navbar hasMessages={messages.length > 0} />
      {!messages || messages.length === 0 ? (
        <div className="absolute flex flex-col top-0 left-0 right-0 bottom-0 space-y-8 -z-50 items-center justify-center text-center mb-24 px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150"></div>
            <SmileIcon
              className="relative w-24 h-24 text-primary drop-shadow-lg"
              suppressHydrationWarning={true}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
              Welcome to Simp AI
            </h2>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed font-medium">
              Experience the future of AI conversation. Ask anything, explore
              ideas, and discover insights with our advanced agentic AI.
            </p>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col h-full">
        <Conversation className="h-full w-full">
          <ConversationContent>
            {messages.map((message: UIMessage) => {
              const metadata = message.metadata as
                | undefined
                | {
                    stats?: { inputTokens?: number; outputTokens?: number };
                    model: string;
                  };
              const isEditing = editingMessageId === message.id;
              const messageText =
                message.parts.find((part) => part.type === "text")?.text || "";

              return (
                <div key={message.id} id={`message-${message.id}`}>
                  <Message
                    from={message.role}
                    actions={
                      message.role === "user" ? (
                        <MessageActions
                          role={message.role}
                          onEdit={() =>
                            handleEditMessage(message.id, messageText)
                          }
                          isEditing={isEditing}
                          variant="hover"
                        />
                      ) : (
                        <MessageActions
                          role={message.role}
                          onEdit={() =>
                            handleEditMessage(message.id, messageText)
                          }
                          isEditing={isEditing}
                          variant="hover"
                        />
                      )
                    }
                    actionsVariant={
                      message.role === "user" ? "hover" : "hover"
                    }>
                    <MessageContent>
                      <div className="overflow-x-auto gap-4">
                        {message.parts.map((part, i) => {
                          switch (true) {
                            case part.type == "text":
                              return (
                                <Response
                                  key={`${message.id}-${i}`}
                                  className="text-base">
                                  {part.text}
                                </Response>
                              );
                            case part.type == "reasoning":
                              return (
                                <Reasoning
                                  key={`${message.id}-${i}`}
                                  isStreaming={status === "streaming"}
                                  defaultOpen={true}></Reasoning>
                              );
                            case part.type.startsWith("tool-") ||
                              part.type == "dynamic-tool":
                              const dyn = part as DynamicToolUIPart;
                              const toolType = part.type.replace("tool-", "");

                              // Hide search tool when output is available (results shown below)
                              if (
                                dyn.state === "output-available" &&
                                toolType === "search"
                              ) {
                                return null;
                              }

                              // Only show tool when running (output not available) for other tools
                              if (
                                dyn.state === "output-available" &&
                                toolType !== "search"
                              ) {
                                return null;
                              }

                              return (
                                <Tool key={`${message.id}-${i}-${toolType}`}>
                                  {dyn.state !== "output-available" && (
                                    <Shimmer text="calling more tools..." />
                                  )}
                                </Tool>
                              );
                            case part.type == "file" &&
                              part.mediaType.startsWith("image/"):
                              return (
                                <Image
                                  alt={part.filename ?? "Simp AI image gen"}
                                  src={part.url}
                                  key={`${part.filename}`}
                                  width={100}
                                  height={100}
                                  className="rounded-md"
                                />
                              );
                            default:
                              return null;
                          }
                        })}
                      </div>
                      {/* Token count, model info, and sources in one line - only for assistant messages */}
                      {message.role === "assistant" && (
                        <div className="w-full">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1">
                              <BoxIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">
                                {metadata?.model}
                              </span>
                            </div>

                            {/* Collect search results from tool outputs and show sources + delete */}
                            {(() => {
                              const searchResults: Array<{
                                title: string;
                                link: string;
                                snippet: string;
                              }> = [];
                              message.parts.forEach((part) => {
                                if (part.type === "tool-search") {
                                  const dyn = part as unknown as {
                                    state: string;
                                    output?: unknown[];
                                  };
                                  if (
                                    dyn.state === "output-available" &&
                                    Array.isArray(dyn.output)
                                  ) {
                                    searchResults.push(
                                      ...(dyn.output as Array<{
                                        title: string;
                                        link: string;
                                        snippet: string;
                                      }>)
                                    );
                                  }
                                }
                              });

                              return (
                                <div className="flex items-center gap-2">
                                  {searchResults.length > 0 && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button className="flex items-center justify-center gap-1 text-sm text-foreground transition-all duration-200 opacity-60 hover:opacity-100 cursor-pointer">
                                          <GlobeIcon
                                            className="w-4 h-4"
                                            suppressHydrationWarning={true}
                                          />
                                          {searchResults.length}
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Search Results
                                          </DialogTitle>
                                          <DialogDescription>
                                            Sources used to generate this
                                            response
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4">
                                          {searchResults.map((result, i) => (
                                            <div
                                              key={i}
                                              className="border rounded-lg p-4 hover:bg-accent transition-colors">
                                              <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                  <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-1">
                                                    <a
                                                      href={result.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="line-clamp-1">
                                                      {result.title}
                                                    </a>
                                                  </h3>
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-green-600 dark:text-green-400 truncate">
                                                      {
                                                        new URL(result.link)
                                                          .hostname
                                                      }
                                                    </span>
                                                  </div>
                                                  <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {result.snippet}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                </div>
              );
            })}

            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <ConversationUserLocator messages={messages} />
        {session && (
          <AIInput
            handleSubmit={handleSubmit}
            setInput={setInput}
            input={input}
            setModel={setModel}
            model={model}
            status={status}
            stop={stop}
          />
        )}
      </div>
    </div>
  );
};

export default ChatBotDemo;
