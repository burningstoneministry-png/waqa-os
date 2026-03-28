"use client";

import { Code2, Flame, GitBranch, Terminal } from "lucide-react";
import { CodingStats } from "@/lib/types";

interface Props {
  stats: CodingStats;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  SQL: "#e38c00",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Go: "#00ADD8",
  Rust: "#dea584",
};

export default function CodingPanel({ stats }: Props) {
  const hours = Math.floor(stats.today_minutes / 60);
  const mins = stats.today_minutes % 60;
  const goalMins = 240; // 4h goal
  const pct = Math.min(100, Math.round((stats.today_minutes / goalMins) * 100));
  const pctColor = pct >= 100 ? "#6ee7b7" : pct >= 50 ? "#4f8ef7" : "#fbbf24";

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-5 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="icon-box icon-box-blue">
            <Code2 size={15} className="text-[#4f8ef7]" />
          </div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Coding</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/15 rounded-lg px-2.5 py-1">
          <Flame size={12} className="text-[#fbbf24]" />
          <span className="text-xs font-bold text-[#fbbf24]">{stats.streak}</span>
          <span className="text-[10px] text-slate-500">day streak</span>
        </div>
      </div>

      {/* ── Today hours as big number ── */}
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-white leading-none">{hours}<span className="text-slate-500 text-xl">h</span></span>
        <span className="text-2xl font-bold text-slate-400 leading-none mb-0.5">{mins}<span className="text-slate-600 text-base">m</span></span>
        <span className="text-[11px] text-slate-500 mb-1 ml-1">today</span>
      </div>

      {/* ── Progress toward 4h goal ── */}
      <div>
        <div className="progress-track mb-1.5">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, backgroundColor: pctColor }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-600">{pct}% of 4h daily goal</p>
          {pct >= 100 && <span className="badge badge-green">Goal hit!</span>}
        </div>
      </div>

      {/* ── Top project badge ── */}
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2">
        <GitBranch size={13} className="text-[#4f8ef7]" />
        <p className="text-[11px] text-slate-400">Top project:</p>
        <span className="text-[11px] font-semibold text-white">{stats.top_project}</span>
        <Terminal size={11} className="text-slate-600 ml-auto" />
      </div>

      {/* ── Language breakdown as horizontal bars ── */}
      <div className="space-y-2">
        <p className="section-title">Languages</p>
        {stats.languages.slice(0, 4).map((lang) => {
          const langPct = Math.round((lang.minutes / stats.today_minutes) * 100);
          const color = LANG_COLORS[lang.name] || "#64748b";
          return (
            <div key={lang.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] text-slate-300">{lang.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{lang.minutes}m</span>
                  <span className="text-[10px] text-slate-600 w-7 text-right">{langPct}%</span>
                </div>
              </div>
              <div className="progress-track-thin">
                <div
                  className="progress-fill"
                  style={{ width: `${langPct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
