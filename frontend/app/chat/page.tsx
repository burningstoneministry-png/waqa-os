"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Zap, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  streaming?: boolean;
  ts?: string;
}

const QUICK_PROMPTS = [
  { label: "📊 Weekly overview", text: "How am I doing this week?" },
  { label: "⚠️ Weakest habit", text: "What is my weakest habit right now?" },
  { label: "🗺️ Phase 2 check", text: "Am I on track for Phase 2?" },
  { label: "🍔 Reward status", text: "Did I earn my McDonald's reward?" },
  { label: "💡 One focus", text: "What should I focus on tomorrow?" },
  { label: "📺 YouTube", text: "How is Burning Stone Ministry growing?" },
  { label: "💰 Finance", text: "How is my financial discipline this month?" },
  { label: "🙏 Prayer streak", text: "Tell me about my prayer streak and what it means." },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://waqa-os.onrender.com";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Malo Waqa! 👋 I'm your personal AI Life Coach, powered by Groq.\n\nI have access to your live Waqa-OS data — XP, streaks, habits, phase progress, rewards, and more.\n\nAsk me anything. I'll give you direct, Kingdom-focused coaching based on your real numbers.",
      ts: new Date().toLocaleTimeString("en-FJ", { hour: "2-digit", minute: "2-digit" }),
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

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const ts = new Date().toLocaleTimeString("en-FJ", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { role: "user", content: text, ts }]);
      setInput("");
      setIsStreaming(true);
      setMessages((prev) => [...prev, { role: "ai", content: "", streaming: true, ts }]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

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
              if (parsed.token) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "ai") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + parsed.token,
                    };
                  }
                  return updated;
                });
              }
              if (parsed.error) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "ai") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: `⚠️ ${parsed.error}`,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // skip
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
                  "⚠️ Could not reach the backend. Make sure it's running and your Groq API key is set.",
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
          if (last.role === "ai") {
            updated[updated.length - 1] = { ...last, streaming: false };
          }
          return updated;
        });
      }
    },
    [isStreaming]
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    if (isStreaming) abortRef.current?.abort();
    setMessages([
      {
        role: "ai",
        content: "Chat cleared. What would you like to work on, Waqa?",
        ts: new Date().toLocaleTimeString("en-FJ", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Coach</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Groq · llama-3.3-70b-versatile · Streaming
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <RotateCcw size={13} />
          Clear
        </button>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.text}
            onClick={() => sendMessage(q.text)}
            disabled={isStreaming}
            className="text-xs px-3 py-1.5 rounded-full bg-[#161b27] border border-white/10 text-slate-400 hover:text-white hover:border-violet-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                msg.role === "ai"
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600"
                  : "bg-gradient-to-br from-cyan-600 to-teal-600"
              }`}
            >
              {msg.role === "ai" ? <Bot size={15} className="text-white" /> : "W"}
            </div>

            <div className={`max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "ai"
                    ? "bg-[#161b27] border border-white/5 text-slate-200 rounded-tl-sm"
                    : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm"
                }`}
              >
                {msg.content}
                {msg.streaming && (
                  <span className="inline-block w-0.5 h-3.5 bg-violet-400 ml-0.5 align-middle animate-pulse" />
                )}
              </div>
              {msg.ts && (
                <span className="text-[10px] text-slate-600 px-1">{msg.ts}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 items-center">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={isStreaming}
          placeholder="Ask your AI coach anything…"
          className="flex-1 bg-[#161b27] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isStreaming || !input.trim()}
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isStreaming ? (
            <Zap size={16} className="text-white animate-pulse" />
          ) : (
            <Send size={16} className="text-white" />
          )}
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-2">
        Powered by <span className="text-orange-500">Groq</span> · responses stream word by word · your data stays private
      </p>
    </div>
  );
}
