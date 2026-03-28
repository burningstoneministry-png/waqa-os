"use client";

import { useState, useEffect } from "react";
import { Flame, TrendingUp, Calendar } from "lucide-react";
import PrayerTimer from "@/components/prayer/PrayerTimer";
import { getPrayerStats } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PrayerPage() {
  const [stats, setStats] = useState({
    streak: 12,
    longest_streak: 21,
    this_month: { days: 24, total_minutes: 1080, average_minutes: 45 },
    theme_breakdown: [
      { theme: "vision", count: 20 },
      { theme: "wisdom", count: 18 },
      { theme: "family", count: 15 },
      { theme: "nation", count: 12 },
      { theme: "healing", count: 8 },
    ],
    weekly_consistency: [true, true, true, false, true, true, true],
    ai_insight: "Your prayer consistency is in the top percentile. Vision-themed prayers have been most frequent this month — consider journaling your vision revelations.",
  });

  useEffect(() => {
    getPrayerStats().then(res => setStats(res.data)).catch(() => {});
  }, []);

  const weeklyData = DAYS.map((day, i) => ({
    day,
    minutes: stats.weekly_consistency[i] ? 40 + Math.floor(Math.random() * 20) : 0,
    done: stats.weekly_consistency[i],
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Flame size={20} className="text-amber-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Prayer Tracker</h1>
          <p className="text-slate-400 text-sm">Track your daily prayer sessions</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1e293b] rounded-2xl p-4 text-center border border-slate-700">
          <p className="text-3xl font-bold text-amber-400">{stats.streak}</p>
          <p className="text-xs text-slate-400 mt-1">Current Streak</p>
          <p className="text-xs text-slate-500">🔥 days</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 text-center border border-slate-700">
          <p className="text-3xl font-bold text-white">{stats.longest_streak}</p>
          <p className="text-xs text-slate-400 mt-1">Longest Streak</p>
          <p className="text-xs text-slate-500">all time</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 text-center border border-slate-700">
          <p className="text-3xl font-bold text-purple-400">{stats.this_month.average_minutes}</p>
          <p className="text-xs text-slate-400 mt-1">Avg Minutes</p>
          <p className="text-xs text-slate-500">per session</p>
        </div>
      </div>

      {/* This week grid */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                stats.weekly_consistency[i] ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-500"
              }`}>
                {stats.weekly_consistency[i] ? "🙏" : "—"}
              </div>
              <span className="text-xs text-slate-500">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly minutes chart */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Weekly Minutes</h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#f59e0b" }}
                formatter={(v: number) => [`${v} min`, "Prayer"]}
              />
              <Bar dataKey="minutes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Theme breakdown */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Prayer Themes — This Month</h3>
        <div className="space-y-2">
          {stats.theme_breakdown.map(item => {
            const max = stats.theme_breakdown[0].count;
            return (
              <div key={item.theme} className="flex items-center gap-3">
                <span className="text-slate-400 text-xs capitalize w-20">{item.theme}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
                </div>
                <span className="text-slate-300 text-xs font-medium w-4">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
        <p className="text-xs text-amber-400 font-semibold mb-2">🤖 AI Insight</p>
        <p className="text-sm text-amber-100">{stats.ai_insight}</p>
      </div>

      {/* Timer */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Start Prayer Session</h2>
        <PrayerTimer />
      </div>
    </div>
  );
}
