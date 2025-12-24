"use client";

import { useCallback, useMemo, useState } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { toast } from "sonner";
import { DynamicToolUIPart } from "ai";
import Image from "next/image";
import { BoxIcon, GlobeIcon, AlertCircle } from "lucide-react";

// Components
import Navbar from "@/components/navbar";
import AIInput from "@/components/ai-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationUserLocator,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Reasoning } from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { Tool } from "@/components/ai-elements/tool";
import Shimmer from "@/components/ai-elements/shimmer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Utils & Hooks
import { models } from "@/lib/models";
import { useSession } from "@/lib/auth-client";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

// Types
interface MessageMetadata {
  stats?: {
    inputTokens?: number;
    outputTokens?: number;
  };
  model: string;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

// Component for rendering individual message parts
function MessagePartRenderer({
  part,
  messageId,
  partIndex,
  isStreaming,
}: {
  part: UIMessage["parts"][0];
  messageId: string;
  partIndex: number;
  isStreaming: boolean;
}) {
  const key = `${messageId}-${partIndex}`;
  const filePart = part as { text?: string; mediaType?: string; filename?: string; url?: string };

  switch (true) {
    case part.type === "text":
      return (
        <div key={key} className="prose prose-sm dark:prose-invert max-w-none">
          <Response className="text-base leading-relaxed">
            {filePart.text}
          </Response>
        </div>
      );

    case part.type === "reasoning":
      return (
        <div key={key} className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <Reasoning
            isStreaming={isStreaming}
            defaultOpen={true}
          />
        </div>
      );

    case part.type.startsWith("tool-") || part.type === "dynamic-tool":
      const dyn = part as DynamicToolUIPart;
      const toolType = part.type.replace("tool-", "");

      // Hide search tool when output is available (results shown in dialog)
      if (dyn.state === "output-available" && toolType === "search") {
        return null;
      }

      // Hide other tools after they complete
      if (dyn.state === "output-available" && toolType !== "search") {
        return null;
      }

      return (
        <Tool key={`${key}-${toolType}`}>
          {dyn.state !== "output-available" && (
            <Shimmer text="calling more tools..." />
          )}
        </Tool>
      );

    case part.type === "file" && filePart.mediaType?.startsWith("image/"):
      return (
        <div key={`image-${filePart.filename}`} className="rounded-lg overflow-hidden border border-border/50">
          <Image
            alt={filePart.filename ?? "Generated image"}
            src={filePart.url ?? ""}
            width={300}
            height={300}
            className="rounded-lg"
          />
        </div>
      );

    default:
      return null;
  }
}

// Component for displaying search results
function SearchResultsDialog({
  results,
}: {
  results: SearchResult[];
}) {
  if (results.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 opacity-60 hover:opacity-100 rounded-md hover:bg-accent/50"
          type="button"
        >
          <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0" suppressHydrationWarning={true} />
          <span className="tabular-nums">{results.length}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Results</DialogTitle>
          <DialogDescription>
            Sources used to generate this response
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {results.map((result, idx) => (
            <a
              key={idx}
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border/50 rounded-lg p-3 hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline mb-1 line-clamp-2">
                    {result.title}
                  </h3>
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground truncate inline-block">
                      {new URL(result.link).hostname}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {result.snippet}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ChatPage() {
  const { data: session } = useSession();

  // State Management
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat Hook
  const { messages, sendMessage, status, stop } = useChat({
    onError: (error) => {
      const message =
        (error as { message?: string })?.message ||
        "Something went wrong while contacting the server.";
      setError(message);
      toast.error("Request failed", { description: message });
    },
    onFinish: (messages) => {
      setError(null); // Clear errors on successful message
      if (conversationId) {
        fetch(`/api/conversations/${conversationId}`, {
          method: "PUT",
          body: JSON.stringify({ messages }),
          headers: { "Content-Type": "application/json" },
        }).catch((error) => {
          const err = "Failed to save conversation";
          setError(err);
          console.error(err, error);
        });
      }
    },
  });

  // Handlers
  const handleSubmit = useCallback(
    async (message: PromptInputMessage, deepresearch?: boolean) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) return;

      setError(null); // Clear previous errors

      // Create conversation if needed
      if (!conversationId) {
        const title = message.text?.slice(0, 50) || "New Chat";
        try {
          const res = await fetch("/api/conversations", {
            method: "POST",
            body: JSON.stringify({ title }),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) {
            throw new Error("Failed to create conversation");
          }
          const data = await res.json();
          setConversationId(data.id);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Failed to start conversation";
          setError(errMsg);
          console.error("Error creating conversation:", err);
          toast.error("Failed to start conversation", { description: errMsg });
          return;
        }
      }

      // Send message
      try {
        sendMessage(
          {
            text: message.text || "Sent with attachments",
            files: message.files,
          },
          {
            body: {
              model,
              deepresearch,
            },
          }
        );
        setInput("");
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to send message";
        setError(errMsg);
        console.error("Error sending message:", err);
        toast.error("Failed to send message", { description: errMsg });
      }
    },
    [conversationId, model, sendMessage]
  );

  // Extract search results from all message parts
  const extractSearchResults = useCallback((message: UIMessage): SearchResult[] => {
    const results: SearchResult[] = [];
    message.parts.forEach((part) => {
      if (part.type === "tool-search") {
        const dyn = part as unknown as {
          state: string;
          output?: unknown[];
        };
        if (dyn.state === "output-available" && Array.isArray(dyn.output)) {
          results.push(...(dyn.output as SearchResult[]));
        }
      }
    });
    return results;
  }, []);

  const isStreaming = useMemo(() => status === "streaming", [status]);

  return (
    <div className="relative flex h-screen w-full flex-col bg-background">
      {/* Header */}
      <Navbar hasMessages={messages.length > 0} />

      {/* Main Chat Area */}
      <div className="mx-auto w-full max-w-3xl flex flex-col flex-1 px-3 sm:px-4 py-0">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages Container */}
        <Conversation className="flex-1 w-full">
          <ConversationContent>
            {messages.map((message) => {
              const metadata = message.metadata as MessageMetadata | undefined;
              const searchResults = extractSearchResults(message);

              return (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  className="animate-in fade-in-50 duration-300"
                >
                  <Message from={message.role} actionsVariant="hover">
                    <MessageContent>
                      {/* Message Parts */}
                      <div className="space-y-3">
                        {message.parts.map((part, i) => (
                          <MessagePartRenderer
                            key={`${message.id}-${i}`}
                            part={part}
                            messageId={message.id}
                            partIndex={i}
                            isStreaming={isStreaming}
                          />
                        ))}
                      </div>

                      {/* Assistant Message Footer */}
                      {message.role === "assistant" && (
                        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-border/40">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex-shrink-0 p-1.5 rounded-md bg-secondary/50">
                              <BoxIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <span className="truncate text-xs font-medium text-muted-foreground">
                              {metadata?.model}
                            </span>
                          </div>

                          {/* Search Results Dialog */}
                          <SearchResultsDialog results={searchResults} />
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {status === "submitted" && (
              <div className="animate-in fade-in-50 duration-300">
                <Loader />
              </div>
            )}
          </ConversationContent>

          {/* Auto Scroll Button */}
          <ConversationScrollButton />
        </Conversation>

        {/* User Locator */}
        <ConversationUserLocator messages={messages} />

        {/* Input Area */}
        {session ? (
          <AIInput
            handleSubmit={handleSubmit}
            setInput={setInput}
            input={input}
            setModel={setModel}
            model={model}
            status={status}
            stop={stop}
          />
        ) : (
          <div className="border-t bg-background/80 backdrop-blur-md border-border/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to continue chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
