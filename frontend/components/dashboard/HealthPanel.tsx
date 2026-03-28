"use client";

import { useState } from "react";
import { Moon, Droplets, Footprints, Activity, Plus, TrendingUp } from "lucide-react";
import { addWater } from "@/lib/api";

interface Props {
  sleepHours: number;
  sleepQuality: number;
  waterMl: number;
  waterGoalMl: number;
  steps: number;
  activeMinutes: number;
}

export default function HealthPanel({
  sleepHours,
  sleepQuality,
  waterMl,
  waterGoalMl,
  steps,
  activeMinutes,
}: Props) {
  const [water, setWater] = useState(waterMl);
  const waterPct = Math.min(100, Math.round((water / waterGoalMl) * 100));

  const handleAddWater = async (amount: number) => {
    try {
      await addWater(amount);
      setWater((prev) => Math.min(prev + amount, waterGoalMl + 500));
    } catch {
      setWater((prev) => prev + amount);
    }
  };

  const sleepColor =
    sleepHours >= 7 ? "#6ee7b7" : sleepHours >= 6 ? "#fbbf24" : "#f87171";
  const sleepLabel =
    sleepHours >= 7 ? "Good" : sleepHours >= 6 ? "Fair" : "Poor";
  const sleepBadgeClass =
    sleepHours >= 7 ? "badge badge-green" : sleepHours >= 6 ? "badge badge-amber" : "badge badge-red";
  const qualityColor =
    sleepQuality >= 80 ? "#6ee7b7" : sleepQuality >= 60 ? "#fbbf24" : "#f87171";

  const stepGoal = 8000;
  const stepPct = Math.min(100, Math.round((steps / stepGoal) * 100));

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-5 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <div className="icon-box icon-box-green">
          <Activity size={15} className="text-[#6ee7b7]" />
        </div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Health</h3>
      </div>

      {/* ── Sleep row ── */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-4">
        <div className="icon-box icon-box-blue">
          <Moon size={15} className="text-[#93c5fd]" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Sleep</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold" style={{ color: sleepColor }}>
              {sleepHours}
            </span>
            <span className="text-slate-500 text-xs">hrs</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <span className={sleepBadgeClass}>{sleepLabel}</span>
          <p className="text-xs font-semibold" style={{ color: qualityColor }}>
            {sleepQuality}% quality
          </p>
        </div>
      </div>

      {/* ── Water intake ── */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={14} className="text-[#4f8ef7]" />
            <p className="text-[11px] text-slate-400 font-medium">Water Intake</p>
          </div>
          <p className="text-[11px] text-white font-semibold">
            {water}
            <span className="text-slate-500 font-normal"> / {waterGoalMl}ml</span>
          </p>
        </div>

        {/* Horizontal progress bar */}
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${waterPct}%`,
              backgroundColor: waterPct >= 100 ? "#6ee7b7" : "#4f8ef7",
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-600">{waterPct}% of {(waterGoalMl / 1000).toFixed(1)}L goal</p>
          <div className="flex gap-1.5">
            {[250, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddWater(amt)}
                className="flex items-center gap-1 bg-[#4f8ef7]/10 text-[#4f8ef7] text-[10px] font-medium px-2.5 py-1 rounded-lg hover:bg-[#4f8ef7]/20 transition-colors"
              >
                <Plus size={9} />
                {amt}ml
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Steps + Active minutes ── */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Footprints size={13} className="text-orange-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Steps</span>
          </div>
          <p className="text-lg font-bold text-white">{steps.toLocaleString()}</p>
          <div className="progress-track-thin mt-2">
            <div
              className="progress-fill"
              style={{ width: `${stepPct}%`, backgroundColor: "#fb923c" }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1">{stepPct}% of {stepGoal.toLocaleString()}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={13} className="text-[#6ee7b7]" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Active</span>
          </div>
          <p className="text-lg font-bold text-white">{activeMinutes}</p>
          <p className="text-[10px] text-slate-500 mt-1">minutes today</p>
          {activeMinutes >= 30 && (
            <span className="badge badge-green mt-1.5">Goal hit</span>
          )}
        </div>
      </div>
    </div>
  );
}
