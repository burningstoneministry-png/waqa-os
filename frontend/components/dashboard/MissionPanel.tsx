"use client";

import { useState } from "react";
import { Target, Microscope, Globe, Plus, BookOpen, Users } from "lucide-react";

interface Props {
  soulsReachedMonth: number;
  researchHoursWeek: number;
  antigravityNotes: number;
  kingdomActivities: number;
}

const BILLION = 1_000_000_000;

export default function MissionPanel({
  soulsReachedMonth,
  researchHoursWeek,
  antigravityNotes,
  kingdomActivities,
}: Props) {
  const [soulCount, setSoulCount] = useState(soulsReachedMonth);

  // Progress toward 1 billion (very small but visible)
  const totalSoulsEver = 23; // approximate placeholder
  const progressPct = (totalSoulsEver / BILLION) * 100;
  const progressWidth = Math.max(0.3, progressPct); // always show tiny sliver

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-5 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <div className="icon-box icon-box-purple">
          <Target size={15} className="text-[#a78bfa]" />
        </div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Mission Board</h3>
      </div>

      {/* ── Two mission pillars side by side ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Kingdom pillar */}
        <div className="bg-gradient-to-br from-[#fbbf24]/6 to-[#f87171]/5 border border-[#fbbf24]/12 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-[#fbbf24]" />
            <p className="text-[10px] font-semibold text-[#fbbf24] uppercase tracking-wider">Kingdom</p>
          </div>

          {/* Big tappable soul counter */}
          <button
            className="flex items-baseline gap-1.5 group"
            onClick={() => setSoulCount((s) => s + 1)}
            title="Tap to count a soul reached"
          >
            <span className="text-3xl font-bold text-[#fbbf24] group-hover:scale-110 group-active:scale-95 transition-transform inline-block">
              {soulCount}
            </span>
            <span className="text-[10px] text-slate-500">souls / mo</span>
          </button>

          <button
            onClick={() => setSoulCount((s) => s + 1)}
            className="flex items-center gap-1 text-[10px] text-[#fbbf24]/70 hover:text-[#fbbf24] transition-colors"
          >
            <Plus size={10} /> Add soul
          </button>

          <div className="pt-1 space-y-0.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 flex items-center gap-1"><Users size={9} /> Church</span>
              <span className="text-white font-medium">{kingdomActivities}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Events</span>
              <span className="text-white font-medium">3</span>
            </div>
          </div>
        </div>

        {/* Antigravity pillar */}
        <div className="bg-gradient-to-br from-[#22d3ee]/6 to-[#4f8ef7]/5 border border-[#22d3ee]/12 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Microscope size={12} className="text-[#22d3ee]" />
            <p className="text-[10px] font-semibold text-[#22d3ee] uppercase tracking-wider">Antigravity</p>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#22d3ee]">{researchHoursWeek}</span>
            <span className="text-[10px] text-slate-500">hrs / wk</span>
          </div>

          <p className="text-[10px] text-slate-600">Research this week</p>

          <div className="pt-1 space-y-0.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 flex items-center gap-1"><BookOpen size={9} /> Notes</span>
              <span className="text-white font-medium">{antigravityNotes}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Papers</span>
              <span className="text-white font-medium">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress toward 1 billion ── */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span className="text-slate-600">Journey to 1 billion souls</span>
          <span className="text-slate-700">{totalSoulsEver.toLocaleString()} / 1B</span>
        </div>
        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#fbbf24]/60"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className="text-[9px] text-slate-700 mt-1 text-center">Every soul counts — keep going</p>
      </div>
    </div>
  );
}
