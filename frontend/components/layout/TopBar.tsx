"use client";

import { useState, useEffect } from "react";
import { Bell, Zap, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/prayer": "Prayer",
  "/diary": "Diary / OCR",
  "/music": "Music Practice",
  "/health": "Health",
  "/finance": "Finance",
  "/mission": "Mission Board",
  "/review": "Evening Review",
  "/analytics": "Analytics",
};

export default function TopBar() {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-FJ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Pacific/Fiji",
        })
      );
      setDate(
        now.toLocaleDateString("en-FJ", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Pacific/Fiji",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? "Claude-Fire";

  return (
    <header className="sticky top-0 z-30 bg-[#131625]/95 backdrop-blur-sm border-b border-white/5 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">

        {/* ── Left: mobile logo + page title ── */}
        <div className="flex items-center gap-3">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#a78bfa] flex items-center justify-center">
              <Zap size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-sm">Waqa-OS</span>
          </div>
          {/* Page title (desktop) */}
          <div className="hidden lg:block">
            <h1 className="text-base font-semibold text-white">{pageTitle}</h1>
          </div>
        </div>

        {/* ── Center: Fiji time clock (desktop) ── */}
        <div className="hidden lg:flex items-center gap-3 bg-[#1a1d2e] border border-white/5 rounded-lg px-4 py-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7] pulse-glow" />
            <span className="text-[11px] text-slate-500">{date}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <span className="font-mono text-sm font-bold text-[#4f8ef7]">{time}</span>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] text-slate-600 font-medium">UTC+12</span>
        </div>

        {/* ── Right: score badge + bell + avatar ── */}
        <div className="flex items-center gap-2">
          {/* Score badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Score</span>
            <span className="text-sm font-bold text-[#4f8ef7]">74</span>
            <span className="text-[10px] text-slate-600">/100</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg bg-[#1a1d2e] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Notification bell */}
          <button
            aria-label="Notifications"
            className="relative w-8 h-8 rounded-lg bg-[#1a1d2e] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all"
          >
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#f87171]" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#a78bfa] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            W
          </div>
        </div>
      </div>
    </header>
  );
}
