"use client";

import { useEffect, useState } from "react";
import { Music, Trophy, Flame } from "lucide-react";
import MusicLogger from "@/components/music/MusicLogger";
import { getMusicStats } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MusicPage() {
  const [stats, setStats] = useState({
    streak: 8,
    this_week_minutes: 320,
    this_month_minutes: 1240,
    average_session_minutes: 55,
    top_focus: "worship songs",
    milestones: [
      { date: "2026-03-20", milestone: "Learned 'Oceans' intro riff" },
      { date: "2026-03-15", milestone: "Completed C major scale exercise" },
      { date: "2026-03-10", milestone: "First full worship song played" },
    ],
    weekly_minutes: [45, 60, 50, 0, 55, 60, 50],
  });

  useEffect(() => {
    getMusicStats().then(res => setStats(res.data)).catch(() => {});
  }, []);

  const chartData = DAYS.map((day, i) => ({ day, minutes: stats.weekly_minutes[i] }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Music size={20} className="text-purple-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Music Practice</h1>
          <p className="text-slate-400 text-sm">Bass guitar and worship music tracker</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-amber-400" />
            <span className="text-xs text-slate-400">Practice Streak</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{stats.streak}</p>
          <p className="text-xs text-slate-500">consecutive days</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">This Month</p>
          <p className="text-3xl font-bold text-white">{Math.floor(stats.this_month_minutes / 60)}h</p>
          <p className="text-xs text-slate-500">{stats.this_month_minutes} min total</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Avg Session</p>
          <p className="text-3xl font-bold text-purple-400">{stats.average_session_minutes}m</p>
          <p className="text-xs text-slate-500">per session</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Top Focus</p>
          <p className="text-base font-bold text-white capitalize">{stats.top_focus}</p>
          <p className="text-xs text-slate-500">this month</p>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">This Week (minutes)</h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                formatter={(v: number) => [`${v} min`, "Practice"]}
              />
              <Bar dataKey="minutes" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" /> Recent Milestones
        </h3>
        <div className="space-y-3">
          {stats.milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white">{m.milestone}</p>
                <p className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString("en-FJ", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logger */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Log Practice Session</h2>
        <MusicLogger />
      </div>
    </div>
  );
}
