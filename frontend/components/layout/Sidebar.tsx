"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ListTodo, Flame, Music, BookOpen,
  Heart, Activity, DollarSign, Target, Star, BarChart2,
  Zap, Sparkles, Trophy, Gift, MapPin, TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/xp", icon: Sparkles, label: "XP Tracker" },
  { href: "/skills", icon: Trophy, label: "Skill Trees" },
  { href: "/roadmap", icon: MapPin, label: "Roadmap" },
  { href: "/consistency", icon: TrendingUp, label: "Consistency" },
  { href: "/rewards", icon: Gift, label: "Rewards" },
  { href: "/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/prayer", icon: Flame, label: "Prayer" },
  { href: "/diary", icon: BookOpen, label: "Diary / OCR" },
  { href: "/music", icon: Music, label: "Music Practice" },
  { href: "/health", icon: Activity, label: "Health" },
  { href: "/finance", icon: DollarSign, label: "Finance" },
  { href: "/mission", icon: Target, label: "Mission Board" },
  { href: "/review", icon: Star, label: "Evening Review" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now
    ? now.toLocaleTimeString("en-FJ", { hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Fiji" })
    : "--:--";
  const dateStr = now
    ? now.toLocaleDateString("en-FJ", { weekday: "short", day: "numeric", month: "short", timeZone: "Pacific/Fiji" })
    : "---";

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-[#131625] border-r border-white/5 z-40">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#a78bfa] flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight tracking-tight">Waqa-OS</p>
          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Waqa · Fiji</p>
        </div>
      </div>

      {/* ── Score / streak compact badge ── */}
      <div className="mx-4 mt-4 mb-2 bg-[#1a1d2e] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Score</p>
          <p className="text-2xl font-bold text-[#4f8ef7] leading-tight">74</p>
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Streak</p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <Flame size={13} className="text-orange-400" />
            <p className="text-lg font-bold text-orange-400 leading-tight">12</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pt-2 pb-1.5">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#4f8ef7]/10 text-[#4f8ef7] border-l-2 border-[#4f8ef7]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <item.icon
                size={15}
                className={isActive ? "text-[#4f8ef7]" : "text-slate-500"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4f8ef7]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom: date/time ── */}
      <div className="px-5 py-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-300">{dateStr}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">UTC+12 · Fiji Time</p>
          </div>
          <p className="text-sm font-bold text-[#4f8ef7] font-mono">{timeStr}</p>
        </div>
      </div>
    </aside>
  );
}
