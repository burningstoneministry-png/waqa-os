"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Zap, Calendar, Award } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ComposedChart } from "recharts";

export default function XPTrackerPage() {
  const [dailyXP] = useState({
    date: new Date().toISOString().split('T')[0],
    daily_xp: 87,
    breakdown: {
      prayer: 10,
      bible_study: 10,
      water: 5,
      training: 15,
      research: 20,
      coding: 20,
      bass: 10,
    },
    progress_to_next_level: { current: 67, needed: 100, percentage: 67 }
  });

  const [weeklyXP] = useState({
    total_xp: 487,
    daily_breakdown: [
      { day: "Mon", xp: 85 },
      { day: "Tue", xp: 92 },
      { day: "Wed", xp: 71 },
      { day: "Thu", xp: 88 },
      { day: "Fri", xp: 79 },
      { day: "Sat", xp: 97 },
      { day: "Sun", xp: 75 },
    ],
    consistency: 87,
    streak: 12
  });

  const [monthlyXP] = useState({
    month: "March 2026",
    total_xp: 1850,
    days_active: 25,
    avg_daily: 74,
    best_day: 120,
    worst_day: 35,
    bonuses_earned: 150,
    trend: "↑ 12%"
  });

  const chartData = [
    { week: "Week 1", xp: 410, target: 500 },
    { week: "Week 2", xp: 460, target: 500 },
    { week: "Week 3", xp: 480, target: 500 },
    { week: "Week 4", xp: 350, target: 500 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles size={20} className="text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white">XP Tracker</h1>
          <p className="text-slate-400 text-sm">Track your daily experience points and progression</p>
        </div>
      </div>

      {/* Today's XP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Today</p>
            <Zap size={16} className="text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">{dailyXP.daily_xp}</p>
          <p className="text-xs text-slate-500 mt-2">XP Earned</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide">This Week</p>
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">{weeklyXP.total_xp}</p>
          <p className="text-xs text-slate-500 mt-2">Weekly Total</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide">This Month</p>
            <Award size={16} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">{monthlyXP.total_xp}</p>
          <p className="text-xs text-slate-500 mt-2">Monthly Total</p>
        </div>
      </div>

      {/* Streak & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <h3 className="font-bold text-white mb-3 text-sm">Consistency Streak</h3>
          <div className="flex items-end gap-3">
            <div>
              <p className="text-4xl font-bold text-orange-400">{weeklyXP.streak}</p>
              <p className="text-xs text-slate-400 mt-1">Days</p>
            </div>
            <div className="flex-1 h-12 bg-gradient-to-r from-orange-400/20 to-transparent rounded-lg" />
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <h3 className="font-bold text-white mb-3 text-sm">Level Progress</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Next Level</span>
              <span className="text-blue-400 font-bold">{dailyXP.progress_to_next_level.percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all"
                style={{ width: `${dailyXP.progress_to_next_level.percentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{dailyXP.progress_to_next_level.current} / {dailyXP.progress_to_next_level.needed} XP</p>
          </div>
        </div>
      </div>

      {/* Today's XP Breakdown */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Today's Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(dailyXP.breakdown).map(([habit, xp]) => (
            <div key={habit} className="bg-[#0f1117] rounded-lg p-3 border border-slate-600/50 text-center">
              <p className="text-2xl font-bold text-blue-400">{xp}</p>
              <p className="text-xs text-slate-400 mt-1 capitalize">{habit.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Weekly XP Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyXP.daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="xp" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Monthly Progress</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend wrapperStyle={{ paddingTop: "16px" }} />
              <Bar dataKey="xp" fill="#10b981" name="XP Earned" radius={[4, 4, 0, 0]} />
              <Line dataKey="target" stroke="#ef4444" name="Weekly Target" strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0f1117] rounded-lg p-4 border border-slate-600/50">
          <p className="text-sm text-slate-400 mb-1">Monthly Avg</p>
          <p className="text-2xl font-bold text-green-400">{monthlyXP.avg_daily}</p>
          <p className="text-xs text-slate-500 mt-1">XP/day</p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-4 border border-slate-600/50">
          <p className="text-sm text-slate-400 mb-1">Best Day</p>
          <p className="text-2xl font-bold text-yellow-400">{monthlyXP.best_day}</p>
          <p className="text-xs text-slate-500 mt-1">XP</p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-4 border border-slate-600/50">
          <p className="text-sm text-slate-400 mb-1">Bonuses</p>
          <p className="text-2xl font-bold text-purple-400">{monthlyXP.bonuses_earned}</p>
          <p className="text-xs text-slate-500 mt-1">This month</p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-4 border border-slate-600/50">
          <p className="text-sm text-slate-400 mb-1">Trend</p>
          <p className="text-2xl font-bold text-blue-400">{monthlyXP.trend}</p>
          <p className="text-xs text-slate-500 mt-1">vs last month</p>
        </div>
      </div>
    </div>
  );
}
