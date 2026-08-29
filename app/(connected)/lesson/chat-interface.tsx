"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export function ChatInterface({ lessonId }: { lessonId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/lessons/${lessonId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });
      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-accent shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
        aria-label="Open AI chat"
      >
        <Image
          src="/blue-lenni.svg"
          alt="Lenni"
          width={28}
          height={28}
          className="mx-auto my-auto block dark:hidden"
        />
        <Image
          src="/white-lenni.svg"
          alt="Lenni"
          width={28}
          height={28}
          className="mx-auto my-auto hidden dark:block"
        />
        <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-positive border-2 border-page" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md md:max-w-lg">
      {/* Chat window */}
      <div className="rounded-2xl border border-ui-border-subtle bg-page shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col h-125 md:h-150 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ui-border-subtle bg-ui-raised/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-accent/10 flex items-center justify-center">
              <Image
                src="/blue-lenni.svg"
                alt="Lenni"
                width={22}
                height={22}
                className="block dark:hidden"
              />
              <Image
                src="/white-lenni.svg"
                alt="Lenni"
                width={22}
                height={22}
                className="hidden dark:block"
              />
            </div>
            <div>
              <p className="font-display text-body font-bold">Lenni AI</p>
              <p className="text-label text-subtle">Your learning assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="size-9 rounded-full text-subtle hover:text-foreground hover:bg-ui-surface transition-colors flex items-center justify-center"
            aria-label="Close chat"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted">
              <p className="text-body-s">Ask me anything about this lesson!</p>
              <p className="text-label mt-1">I can explain concepts, give examples, or quiz you.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold
                  ${message.role === "assistant"
                    ? "bg-accent text-white"
                    : "bg-ui-surface border border-ui-border-subtle text-muted"}`}
              >
                {message.role === "assistant" ? "L" : "U"}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-body-s leading-relaxed
                  ${message.role === "assistant"
                    ? "rounded-tl-sm bg-ui-surface text-foreground"
                    : "rounded-tr-sm bg-accent text-white"}`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white text-[11px] font-bold">
                L
              </div>
              <div className="max-w-[80%] rounded-2xl bg-ui-surface px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: "0ms" }} />
                  <span className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: "150ms" }} />
                  <span className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-ui-border-subtle bg-ui-raised/50 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask about this lesson…"
              className="flex-1 rounded-control border border-ui-border-subtle bg-page px-4 py-2.5 text-body outline-none focus:border-accent transition-colors"
              disabled={isLoading}
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="size-10 rounded-full bg-accent text-white flex items-center justify-center transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}