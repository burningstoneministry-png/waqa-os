"use client";

import { useState } from "react";
import { Plus, Minus, Droplets } from "lucide-react";
import { addWater } from "@/lib/api";

interface Props {
  initialMl: number;
  goalMl: number;
}

const LOG_AMOUNTS = [150, 250, 350, 500];

export default function WaterTracker({ initialMl, goalMl }: Props) {
  const [water, setWater] = useState(initialMl);
  const [log, setLog] = useState<{ time: string; amount: number }[]>([]);
  const pct = Math.min(100, Math.round((water / goalMl) * 100));
  const segments = Math.floor((water / goalMl) * 8);

  const add = async (amount: number) => {
    try {
      await addWater(amount);
    } catch { /* continue */ }
    const now = new Date().toLocaleTimeString("en-FJ", { hour: "2-digit", minute: "2-digit" });
    setWater(prev => prev + amount);
    setLog(prev => [{ time: now, amount }, ...prev].slice(0, 8));
  };

  const remove = (amount: number) => {
    setWater(prev => Math.max(0, prev - amount));
  };

  const fillColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#60a5fa" : pct >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-5">
      {/* Big water bottle visual */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 text-center">
        <h2 className="font-bold text-white text-base mb-4">Daily Water Intake</h2>

        <div className="flex items-end justify-center gap-8 mb-6">
          {/* Water bottle */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Bottle neck */}
              <div className="w-10 h-4 bg-slate-600 rounded-t-lg mx-auto" />
              {/* Bottle body */}
              <div className="relative w-24 h-48 border-2 border-slate-500 rounded-b-2xl overflow-hidden bg-slate-800">
                {/* Fill */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b-2xl"
                  style={{ height: `${pct}%`, backgroundColor: fillColor + "60", borderTop: `2px solid ${fillColor}` }}
                />
                {/* Wave effect */}
                <div
                  className="absolute left-0 right-0 h-3 transition-all duration-500"
                  style={{ bottom: `calc(${pct}% - 6px)`, backgroundColor: fillColor + "80" }}
                />
                {/* Level markers */}
                {[25, 50, 75].map(level => (
                  <div
                    key={level}
                    className="absolute left-2 right-2 border-t border-dashed border-slate-600 opacity-50"
                    style={{ bottom: `${level}%` }}
                  >
                    <span className="absolute right-0 text-[10px] text-slate-500 -top-3">{level}%</span>
                  </div>
                ))}
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white drop-shadow">{pct}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              <span className="text-white font-medium">{water}ml</span> / {goalMl}ml
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-3 text-left">
            <div>
              <p className="text-xs text-slate-400">Consumed</p>
              <p className="text-2xl font-bold text-white">{(water / 1000).toFixed(2)}L</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Remaining</p>
              <p className="text-xl font-bold text-amber-400">{Math.max(0, goalMl - water)}ml</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Goal</p>
              <p className="text-sm font-medium text-slate-300">{(goalMl / 1000).toFixed(1)}L/day</p>
            </div>
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          {LOG_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => add(amt)}
              className="flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-colors active:scale-95"
            >
              <Droplets size={14} /> +{amt}ml
            </button>
          ))}
        </div>

        {water > 0 && (
          <button
            onClick={() => remove(250)}
            className="mt-2 flex items-center gap-1.5 text-slate-500 text-xs mx-auto hover:text-slate-300 transition-colors"
          >
            <Minus size={12} /> Remove last 250ml
          </button>
        )}

        {pct >= 100 && (
          <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <p className="text-green-400 font-medium text-sm">🎉 Daily water goal reached!</p>
          </div>
        )}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Today&apos;s Log</h3>
          <div className="space-y-1.5">
            {log.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{entry.time}</span>
                <span className="text-blue-400 font-medium">+{entry.amount}ml</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
