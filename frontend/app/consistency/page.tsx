"use client";

import { useState } from "react";
import { TrendingUp, Calendar, Flame, Target } from "lucide-react";

export default function ConsistencyPage() {
  const weekData = [
    [100, 85, 75, 90, 95, 100, 80],   // Week 1
    [95, 90, 85, 75, 95, 100, 85],    // Week 2
    [90, 85, 95, 100, 90, 85, 90],    // Week 3
    [100, 95, 90, 100, 95, 100, 100], // Week 4
  ];

  const getColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 60) return 'bg-yellow-400';
    if (percentage >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp size={20} className="text-green-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Consistency Heatmap</h1>
          <p className="text-slate-400 text-sm">52-week habit tracking & daily consistency view</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 uppercase">Current Streak</p>
            <Flame size={16} className="text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-400">47</p>
          <p className="text-xs text-slate-500 mt-1">Days</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 uppercase">Best Streak</p>
            <Flame size={16} className="text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">78</p>
          <p className="text-xs text-slate-500 mt-1">Days (Jan)</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 uppercase">This Month</p>
            <Calendar size={16} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">87%</p>
          <p className="text-xs text-slate-500 mt-1">Consistency</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 uppercase">Target</p>
            <Target size={16} className="text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">90%</p>
          <p className="text-xs text-slate-500 mt-1">Goal</p>
        </div>
      </div>

      {/* This Month Heatmap */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">March 2026 Heatmap</h3>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="h-6 flex items-center justify-center text-xs text-slate-500 font-semibold">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {weekData.map((week, weekIdx) => (
            <div key={weekIdx} className="flex gap-1 items-center">
              <span className="text-xs text-slate-600 w-8">W{weekIdx + 1}</span>
              <div className="grid grid-cols-7 gap-1 flex-1">
                {week.map((percentage, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`h-8 rounded-lg ${getColor(percentage)} hover:shadow-lg transition-shadow cursor-pointer group relative`}
                    title={`${percentage}% consistency`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                      {percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-slate-400">100%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded" />
            <span className="text-slate-400">80-99%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded" />
            <span className="text-slate-400">60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-400 rounded" />
            <span className="text-slate-400">40-59%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-slate-400">&lt;40%</span>
          </div>
        </div>
      </div>

      {/* Monthly Averages */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Monthly Averages</h3>
        <div className="space-y-3">
          {[
            { month: "January", avg: 92, color: "bg-green-500" },
            { month: "February", avg: 88, color: "bg-green-400" },
            { month: "March", avg: 87, color: "bg-green-400" },
          ].map(item => (
            <div key={item.month}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">{item.month}</span>
                <span className="font-bold text-white">{item.avg}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.avg}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Breakdown for Today */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Today's Habits (March 28, 2026)</h3>
        <div className="space-y-2">
          {[
            { habit: "Prayer (20 min)", completed: true },
            { habit: "Bible Study (30 min)", completed: true },
            { habit: "Water (2.5L)", completed: false },
            { habit: "Training (60 min)", completed: true },
            { habit: "Coding (120 min)", completed: true },
            { habit: "Research (120 min)", completed: true },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#0f1117] transition-colors">
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${item.completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                {item.completed ? '✓' : '○'}
              </div>
              <span className={`text-sm ${item.completed ? 'text-slate-300' : 'text-slate-500'}`}>{item.habit}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-sm text-center">
            <span className="font-bold text-blue-400">83%</span>
            <span className="text-slate-400"> complete - 5 of 6 habits done</span>
          </p>
        </div>
      </div>
    </div>
  );
}
