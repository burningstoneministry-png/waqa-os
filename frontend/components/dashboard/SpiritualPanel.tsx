"use client";

import { Flame, BookOpen, Heart, Globe, CheckCircle } from "lucide-react";

interface Props {
  prayerStreak: number;
  todayPrayerMin: number;
  prayerGoalMin: number;
  prayerCompleted: boolean;
  soulsReachedMonth: number;
  churchActivities: number;
}

function MiniStat({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={13} style={{ color }} />
      </div>
      <p className="text-base font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

export default function SpiritualPanel({
  prayerStreak,
  todayPrayerMin,
  prayerGoalMin,
  prayerCompleted,
  soulsReachedMonth,
  churchActivities,
}: Props) {
  const prayerPct = Math.min(100, Math.round((todayPrayerMin / prayerGoalMin) * 100));

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-5 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="icon-box icon-box-amber">
            <Flame size={15} className="text-[#fbbf24]" />
          </div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Spiritual Life</h3>
        </div>
        {prayerCompleted && (
          <span className="badge badge-green flex items-center gap-1">
            <CheckCircle size={9} /> Prayed
          </span>
        )}
      </div>

      {/* ── Prayer streak as hero number ── */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-[#fbbf24]/8 to-[#f87171]/5 border border-[#fbbf24]/12 rounded-xl px-4 py-3">
        <div className="flex-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Prayer Streak</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-[#fbbf24]">{prayerStreak}</span>
            <span className="text-slate-500 text-sm">days</span>
          </div>
        </div>
        <Flame size={36} className="text-[#fbbf24]/30" />
      </div>

      {/* ── Prayer progress bar ── */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-500">Today's Prayer</span>
          <span className="text-white font-semibold">{todayPrayerMin}<span className="text-slate-500 font-normal"> / {prayerGoalMin} min</span></span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${prayerPct}%`,
              backgroundColor: prayerPct >= 100 ? "#6ee7b7" : "#fbbf24",
            }}
          />
        </div>
        <p className="text-[10px] text-slate-600 mt-1">{prayerPct}% of daily goal</p>
      </div>

      {/* ── Mini streaks grid ── */}
      <div className="grid grid-cols-4 gap-2">
        <MiniStat icon={Flame} value={prayerStreak} label="Prayer" color="#fbbf24" bgColor="rgba(251,191,36,0.12)" />
        <MiniStat icon={BookOpen} value={12} label="Bible" color="#a78bfa" bgColor="rgba(167,139,250,0.12)" />
        <MiniStat icon={Heart} value={8} label="Devotion" color="#f87171" bgColor="rgba(248,113,113,0.12)" />
        <MiniStat icon={Globe} value={churchActivities} label="Church" color="#6ee7b7" bgColor="rgba(110,231,183,0.12)" />
      </div>

      {/* ── Souls counter ── */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl p-3">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Souls Reached</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-[#fbbf24]">{soulsReachedMonth}</span>
            <span className="text-[10px] text-slate-600">this month</span>
          </div>
        </div>
        <div className="text-3xl opacity-60">🌍</div>
      </div>
    </div>
  );
}
