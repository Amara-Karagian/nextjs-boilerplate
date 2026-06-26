"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function JarvisLogo() {
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
      <div className="absolute inset-1 rounded-full border border-cyan-400/50" />
      <div className="relative z-10 text-cyan-400 font-bold text-xl tracking-widest">
        J
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="text-cyan-400/60 text-xs tracking-widest mr-2">PROCESSING</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-cyan-400"
          style={{
            animation: "pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-cyan-400/50 flex items-center justify-center mr-3 mt-1">
          <span className="text-cyan-400 text-xs font-bold">J</span>
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-100"
            : "bg-slate-800/60 border border-cyan-400/20 text-slate-200"
        } ${isLatest ? "shadow-[0_0_20px_rgba(34,211,238,0.1)]" : ""}`}
      >
        {!isUser && (
          <div className="text-cyan-400/60 text-xs tracking-widest mb-2 font-mono">
            J.A.R.V.I.S.
          </div>
        )}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-cyan-500/50 bg-cyan-500/10 flex items-center justify-center ml-3 mt-1">
          <span className="text-cyan-400 text-xs font-bold">YOU</span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour12: false }) +
          " // " +
          now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text } = JSON.parse(data);
            if (text) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + text,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: "I encountered an error processing your request. Please try again, sir.",
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [input, isStreaming, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col" style={{ fontFamily: "var(--font-geist-mono)" }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-400/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <JarvisLogo />
            <div>
              <h1 className="text-cyan-400 font-bold text-lg tracking-[0.3em]">J.A.R.V.I.S.</h1>
              <p className="text-slate-500 text-xs tracking-widest">JUST A RATHER VERY INTELLIGENT SYSTEM</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-cyan-400/70 text-xs font-mono tracking-wider">{currentTime}</div>
            <div className="flex items-center gap-2 justify-end mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400/70 text-xs tracking-widest">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="relative z-10 flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 py-6">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-cyan-400/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-cyan-400/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center">
                      <span className="text-cyan-400 font-bold text-xl">J</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border border-cyan-400/10 animate-ping" style={{ animationDuration: "3s" }} />
              </div>
              <div>
                <p className="text-cyan-400 text-lg font-mono tracking-widest mb-2">GOOD DAY, SIR.</p>
                <p className="text-slate-500 text-sm max-w-md">
                  All systems are operational. How may I be of assistance?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-md">
                {[
                  "What can you help me with?",
                  "Analyze my project structure",
                  "Help me write some code",
                  "Give me a briefing on AI",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-left px-3 py-2 rounded border border-cyan-400/20 text-xs text-slate-400 hover:border-cyan-400/50 hover:text-cyan-300 hover:bg-cyan-400/5 transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  isLatest={i === messages.length - 1}
                />
              ))}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start mb-4">
                  <div className="w-8 h-8 rounded-full border border-cyan-400/50 flex items-center justify-center mr-3 mt-1">
                    <span className="text-cyan-400 text-xs font-bold">J</span>
                  </div>
                  <div className="bg-slate-800/60 border border-cyan-400/20 rounded-lg">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="mt-4 border border-cyan-400/20 rounded-xl bg-slate-900/60 backdrop-blur-sm focus-within:border-cyan-400/50 focus-within:shadow-[0_0_30px_rgba(34,211,238,0.08)] transition-all duration-300">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak your request, sir..."
            rows={1}
            disabled={isStreaming}
            className="w-full bg-transparent text-slate-200 placeholder-slate-600 px-5 py-4 text-sm resize-none outline-none leading-relaxed"
            style={{ minHeight: "56px", maxHeight: "160px", overflowY: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 160) + "px";
            }}
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-slate-600 text-xs tracking-widest">
              {isStreaming ? "RECEIVING TRANSMISSION..." : "ENTER TO SEND · SHIFT+ENTER FOR NEW LINE"}
            </span>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs tracking-widest border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isStreaming ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  PROCESSING
                </>
              ) : (
                <>
                  TRANSMIT
                  <span className="text-cyan-400/60">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
