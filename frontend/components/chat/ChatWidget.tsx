"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Zap } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  streaming?: boolean;
}

const QUICK_PROMPTS = [
  "How am I doing this week?",
  "What's my weakest habit?",
  "Am I on track for Phase 2?",
  "Did I earn my reward? 🍔",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://waqa-os.onrender.com";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Malo Waqa! 👋 I'm your AI Coach powered by Groq.\n\nI can see your live dashboard data. Ask me anything about your progress, habits, XP, or how to improve.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);

      // Add empty AI message that we'll stream into
      const aiMsgIndex = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "", streaming: true },
      ]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
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
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const parsed = JSON.parse(raw);
              if (parsed.done) break;
              if (parsed.error) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "ai") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: `⚠️ Error: ${parsed.error}`,
                      streaming: false,
                    };
                  }
                  return updated;
                });
                break;
              }
              if (parsed.token) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "ai") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + parsed.token,
                      streaming: true,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // skip malformed SSE line
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "ai") {
              updated[updated.length - 1] = {
                ...last,
                content:
                  last.content ||
                  "⚠️ Could not reach the AI coach. Check that the backend is running.",
                streaming: false,
              };
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "ai" && last.streaming) {
            updated[updated.length - 1] = { ...last, streaming: false };
          }
          return updated;
        });
      }
    },
    [isStreaming, messages.length]
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* ── Floating bubble ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          open
            ? "bg-slate-700 hover:bg-slate-600 scale-95"
            : "bg-gradient-to-br from-violet-600 to-indigo-600 hover:scale-105 hover:shadow-violet-500/40"
        }`}
        style={{ boxShadow: open ? undefined : "0 0 24px rgba(124,58,237,0.45)" }}
        aria-label="Open AI Coach"
      >
        {open ? (
          <X size={20} className="text-white" />
        ) : (
          <Bot size={22} className="text-white" />
        )}
        {/* Online dot */}
        {!open && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#020817]" />
        )}
      </button>

      {/* ── Chat panel ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[370px] max-h-[540px] flex flex-col rounded-2xl border border-white/10 bg-[#0f1624] shadow-2xl transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-violet-900/40 to-indigo-900/40 rounded-t-2xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Bot size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Waqa&apos;s AI Coach</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Groq · llama-3.3-70b · Live
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600"
                    : "bg-gradient-to-br from-cyan-600 to-teal-600"
                }`}
              >
                {msg.role === "ai" ? <Bot size={13} className="text-white" /> : "W"}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "ai"
                    ? "bg-[#1a2235] text-slate-200 rounded-tl-sm"
                    : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm"
                }`}
              >
                {msg.content}
                {msg.streaming && (
                  <span className="inline-block w-0.5 h-3.5 bg-violet-400 ml-0.5 align-middle animate-pulse" />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-3 py-2 border-t border-white/5 flex gap-1.5 flex-wrap">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isStreaming}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#1a2235] border border-white/10 text-slate-400 hover:text-white hover:border-violet-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="px-3 pb-3 pt-1 flex gap-2 items-center border-t border-white/5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isStreaming}
            placeholder="Ask your AI coach…"
            className="flex-1 bg-[#1a2235] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/60 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <Zap size={14} className="text-white animate-pulse" />
            ) : (
              <Send size={14} className="text-white" />
            )}
          </button>
        </div>

        {/* Groq badge */}
        <p className="text-center text-[10px] text-slate-600 pb-2">
          Powered by <span className="text-orange-500 font-medium">Groq</span> · responses stream word by word
        </p>
      </div>
    </>
  );
}
