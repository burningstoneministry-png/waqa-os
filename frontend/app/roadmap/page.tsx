"use client";

import { useState } from "react";
import { MapPin, Lock, Unlock, CheckCircle, Clock } from "lucide-react";

export default function RoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  const phases = [
    {
      num: 1,
      name: "FOUNDATION & BREAKTHROUGH",
      ageRange: "36-40",
      years: "2026-2030",
      progress: 67,
      status: "ACTIVE",
      xp_required: 250000,
      xp_earned: 180000,
      milestones: [
        { done: true, text: "Prayer 365-day streak" },
        { done: true, text: "Reach 500 souls" },
        { done: true, text: "Mentor 3 leaders" },
        { done: true, text: "Hit 5k YouTube subs" },
        { done: false, text: "Publish 3 papers (1 done)" },
        { done: false, text: "Prototype v1 (80% done)" },
      ],
      description: "Prove antigravity theory fundamentals, plant spiritual kingdom seeds"
    },
    {
      num: 2,
      name: "SCALE & INFLUENCE",
      ageRange: "41-45",
      years: "2031-2035",
      progress: 0,
      status: "LOCKED",
      xp_required: 250000,
      xp_earned: 0,
      milestones: [
        { done: false, text: "Patent granted" },
        { done: false, text: "Startup founded ($500k)" },
        { done: false, text: "5,000 souls reached" },
        { done: false, text: "50 leaders trained" },
        { done: false, text: "100k YouTube subs" },
        { done: false, text: "1 church plant" },
      ],
      description: "Scale research + kingdom impact goes viral"
    },
    {
      num: 3,
      name: "BREAKTHROUGH",
      ageRange: "46-50",
      years: "2036-2040",
      progress: 0,
      status: "LOCKED",
      xp_required: 250000,
      xp_earned: 0,
      milestones: [
        { done: false, text: "Working prototype v2" },
        { done: false, text: "$5M Series A funding" },
        { done: false, text: "20,000 souls reached" },
        { done: false, text: "200 leaders trained" },
        { done: false, text: "500k YouTube subs" },
        { done: false, text: "5 church plants" },
      ],
      description: "Prototype works, movement scales globally"
    },
    {
      num: 4,
      name: "MARKET ENTRY",
      ageRange: "51-55",
      years: "2041-2045",
      progress: 0,
      status: "LOCKED",
      xp_required: 250000,
      xp_earned: 0,
      milestones: [
        { done: false, text: "10+ patents filed" },
        { done: false, text: "Commercial prototype ready" },
        { done: false, text: "100,000 souls reached" },
        { done: false, text: "$50M+ valuation" },
        { done: false, text: "First paying customer" },
        { done: false, text: "Global impact" },
      ],
      description: "Commercialize, establish global presence"
    },
    {
      num: 5,
      name: "LEGACY BUILD",
      ageRange: "56-60",
      years: "2046-2050",
      progress: 0,
      status: "LOCKED",
      xp_required: 250000,
      xp_earned: 0,
      milestones: [
        { done: false, text: "Company public/acquired" },
        { done: false, text: "Research foundation" },
        { done: false, text: "500,000 souls reached" },
        { done: false, text: "5,000 leaders trained" },
        { done: false, text: "Endowed university chair" },
        { done: false, text: "Leadership academy" },
      ],
      description: "Establish lasting institutions and legacy"
    },
    {
      num: 6,
      name: "MASTERY & MENTORING",
      ageRange: "61-65",
      years: "2051-2055",
      progress: 0,
      status: "LOCKED",
      xp_required: 250000,
      xp_earned: 0,
      milestones: [
        { done: false, text: "Autobiography published" },
        { done: false, text: "Mentor 20 future leaders" },
        { done: false, text: "Strategic sabbatical" },
        { done: false, text: "Wisdom legacy recorded" },
        { done: false, text: "Next generation equipped" },
        { done: false, text: "Vision extension" },
      ],
      description: "Shape next generation of leaders"
    },
    {
      num: 7,
      name: "LEGACY & REST",
      ageRange: "66-70",
      years: "2056-2060",
      progress: 0,
      status: "LOCKED",
      xp_required: 250000,
      xp_earned: 0,
      milestones: [
        { done: false, text: "Final manifesto" },
        { done: false, text: "Family legacy documented" },
        { done: false, text: "Advisory roles active" },
        { done: false, text: "Strategic travels" },
        { done: false, text: "Rest earned" },
        { done: false, text: "Kingdom impact 1B+" },
      ],
      description: "Wisdom, reflection, and family"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MapPin size={20} className="text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white">34-Year Life Roadmap</h1>
          <p className="text-slate-400 text-sm">Age 36-70: From breakthrough to legacy</p>
        </div>
      </div>

      {/* Current Phase Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-5 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-300 uppercase tracking-wide mb-1">Currently Active</p>
            <h2 className="text-lg font-bold text-white">Phase 1: Foundation & Breakthrough</h2>
            <p className="text-sm text-blue-200 mt-1">Age 36-40 (2026-2030) — 67% progress</p>
          </div>
          <Unlock size={32} className="text-blue-400" />
        </div>
      </div>

      {/* Timeline Toggle */}
      <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
        <span>Roadmap View:</span>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-full">Detailed</button>
        <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full hover:bg-slate-600 transition-colors">Timeline</button>
      </div>

      {/* Phase Details */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.num}
            className={`rounded-2xl border overflow-hidden transition-all ${
              phase.status === "ACTIVE"
                ? "bg-[#1e293b] border-slate-700"
                : "bg-[#0f1117] border-slate-700/50"
            }`}
          >
            {/* Phase Header */}
            <button
              onClick={() => setExpandedPhase(expandedPhase === phase.num ? null : phase.num)}
              className="w-full p-5 flex items-center justify-between hover:bg-opacity-75 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                {/* Phase number circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                  phase.status === "LOCKED" ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 text-white'
                }`}>
                  {phase.num}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-sm">{phase.name}</h3>
                    {phase.status === "LOCKED" && <Lock size={14} className="text-slate-500" />}
                    {phase.status === "ACTIVE" && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Active</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Age {phase.ageRange}</span>
                    <span>•</span>
                    <span>{phase.years}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${phase.status === "LOCKED" ? 'bg-slate-600' : 'bg-blue-500'}`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-8">{phase.progress}%</span>
                </div>
              </div>

              {/* Expand/Collapse Icon */}
              <div className="text-slate-400 ml-2">
                {expandedPhase === phase.num ? '▼' : '▶'}
              </div>
            </button>

            {/* Expanded Details */}
            {expandedPhase === phase.num && (
              <div className="border-t border-slate-700/50 px-5 py-4 bg-[#0f1117] space-y-4">
                {/* Description */}
                <div>
                  <p className="text-sm text-slate-300">{phase.description}</p>
                </div>

                {/* XP Progress */}
                {phase.status === "ACTIVE" && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">XP Required: {phase.xp_earned.toLocaleString()} / {phase.xp_required.toLocaleString()}</span>
                      <span className="text-blue-400 font-bold">{Math.round((phase.xp_earned / phase.xp_required) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${Math.round((phase.xp_earned / phase.xp_required) * 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Milestones Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wide">Milestones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {phase.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {milestone.done ? (
                          <>
                            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                            <span className="text-slate-400 line-through">{milestone.text}</span>
                          </>
                        ) : (
                          <>
                            <Clock size={14} className="text-slate-600 flex-shrink-0" />
                            <span className="text-slate-400">{milestone.text}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unlock Requirements (for locked phases) */}
                {phase.status === "LOCKED" && (
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-bold mb-2">Unlock Requirements:</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li>• 250,000+ XP accumulated</li>
                      <li>• 80% of Phase {phase.num - 1} milestones complete</li>
                      <li>• Level 6+ in 3 skill trees</li>
                      <li>• Quarterly review reflection</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Key Life Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">34</p>
            <p className="text-xs text-slate-400 mt-1">Year Span</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">7</p>
            <p className="text-xs text-slate-400 mt-1">Phases</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">6</p>
            <p className="text-xs text-slate-400 mt-1">Skill Trees</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">1B+</p>
            <p className="text-xs text-slate-400 mt-1">Souls Target</p>
          </div>
        </div>
      </div>
    </div>
  );
}
