"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/Avatar";
import { cn, timeAgo } from "@/lib/utils";

interface Message {
  id: string;
  body: string;
  sentAt: Date | string;
  sender: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onSend: (body: string) => void;
  loading?: boolean;
  className?: string;
}

export function MessageThread({ messages, currentUserId, onSend, loading, className }: MessageThreadProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => {
          const isOwn = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
              {!isOwn && (
                <Avatar src={msg.sender.image} name={msg.sender.name} size="sm" />
              )}
              <div className={cn("max-w-[70%] space-y-1", isOwn && "text-right")}>
                <div
                  className={cn(
                    "inline-block rounded-lg px-3 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.body}
                </div>
                <p className="text-[10px] text-muted-foreground px-1">
                  {timeAgo(msg.sentAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-8 text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
