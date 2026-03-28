"use client";

import { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Calendar, Zap } from "lucide-react";
import { getDashboardWeekly } from "@/lib/api";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell
} from "recharts";

export default function AnalyticsPage() {
  const [weekly, setWeekly] = useState({
    days: [
      { date: "2026-03-21", day: "Fri", execution_score: 82, prayer_minutes: 55, coding_minutes: 240, sleep_hours: 7.0, water_ml: 2200 },
      { date: "2026-03-22", day: "Sat", execution_score: 71, prayer_minutes: 45, coding_minutes: 180, sleep_hours: 7.5, water_ml: 1800 },
      { date: "2026-03-23", day: "Sun", execution_score: 65, prayer_minutes: 60, coding_minutes: 90, sleep_hours: 8.0, water_ml: 2000 },
      { date: "2026-03-24", day: "Mon", execution_score: 88, prayer_minutes: 50, coding_minutes: 300, sleep_hours: 6.5, water_ml: 2400 },
      { date: "2026-03-25", day: "Tue", execution_score: 76, prayer_minutes: 40, coding_minutes: 220, sleep_hours: 6.5, water_ml: 1900 },
      { date: "2026-03-26", day: "Wed", execution_score: 69, prayer_minutes: 45, coding_minutes: 195, sleep_hours: 6.0, water_ml: 1600 },
      { date: "2026-03-27", day: "Thu", execution_score: 74, prayer_minutes: 50, coding_minutes: 210, sleep_hours: 6.5, water_ml: 1500 },
    ],
    weekly_score: 76,
    best_day: "Monday",
    worst_day: "Wednesday",
    top_improvement: "Water intake consistency",
    ai_analysis: "This week you maintained strong spiritual discipline (prayer streak: 12 days). Coding output was high Mon–Tue but dropped mid-week. Exercise was skipped 3 days. Focus next week: consistent exercise and better mid-week energy management.",
  });

  useEffect(() => {
    getDashboardWeekly().then(r => setWeekly(r.data)).catch(() => {});
  }, []);

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 65 ? "#f59e0b" : "#ef4444";

  // Category consistency data (mock monthly)
  const consistencyData = [
    { category: "Prayer", percentage: 87, color: "#f59e0b" },
    { category: "Family Dev.", percentage: 74, color: "#dc2626" },
    { category: "Exercise", percentage: 57, color: "#ea580c" },
    { category: "Coding", percentage: 92, color: "#16a34a" },
    { category: "Music", percentage: 70, color: "#9333ea" },
    { category: "Research", percentage: 48, color: "#0891b2" },
    { category: "Water Goal", percentage: 43, color: "#60a5fa" },
    { category: "7h Sleep", percentage: 35, color: "#1e3a5f" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 size={20} className="text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm">Weekly and monthly performance overview</p>
        </div>
      </div>

      {/* Weekly score summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1e293b] rounded-2xl p-4 text-center border border-slate-700">
          <p className="text-3xl font-bold text-amber-400">{weekly.weekly_score}</p>
          <p className="text-xs text-slate-400 mt-1">Weekly Score</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 text-center border border-slate-700">
          <p className="text-sm font-bold text-green-400">{weekly.best_day}</p>
          <p className="text-xs text-slate-400 mt-1">Best Day</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 text-center border border-slate-700">
          <p className="text-sm font-bold text-red-400">{weekly.worst_day}</p>
          <p className="text-xs text-slate-400 mt-1">Worst Day</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 text-center border border-slate-700">
          <p className="text-xs font-bold text-blue-400">{weekly.top_improvement}</p>
          <p className="text-xs text-slate-400 mt-1">Top Improvement</p>
        </div>
      </div>

      {/* Daily execution scores */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4">Daily Execution Scores</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly.days} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(v: number) => [v, "Score"]}
              />
              <Bar dataKey="execution_score" radius={[4, 4, 0, 0]}>
                {weekly.days.map((entry, i) => (
                  <Cell key={i} fill={scoreColor(entry.execution_score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prayer + Coding minutes */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4">Activity Minutes This Week</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly.days} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              <Line type="monotone" dataKey="prayer_minutes" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} name="Prayer" />
              <Line type="monotone" dataKey="coding_minutes" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 3 }} name="Coding" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep + Water */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4">Sleep &amp; Hydration</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly.days} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis yAxisId="sleep" orientation="left" domain={[0, 10]} tick={{ fontSize: 10, fill: "#60a5fa" }} tickFormatter={v => `${v}h`} />
              <YAxis yAxisId="water" orientation="right" tick={{ fontSize: 10, fill: "#22d3ee" }} tickFormatter={v => `${(v/1000).toFixed(1)}L`} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar yAxisId="sleep" dataKey="sleep_hours" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Sleep (h)" />
              <Bar yAxisId="water" dataKey="water_ml" fill="#0e7490" radius={[4, 4, 0, 0]} name="Water (ml)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consistency table */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" /> Category Consistency (This Month)
        </h2>
        <div className="space-y-2.5">
          {consistencyData.map(item => (
            <div key={item.category} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-24 flex-shrink-0">{item.category}</span>
              <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right" style={{ color: item.color }}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-amber-400" />
          <h2 className="font-bold text-amber-400">AI Weekly Analysis</h2>
        </div>
        <p className="text-sm text-amber-100">{weekly.ai_analysis}</p>
      </div>
    </div>
  );
}
