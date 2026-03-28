"use client";

import { useState } from "react";
import { Trophy, Zap, ChevronRight } from "lucide-react";

export default function SkillTreesPage() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>("prayer_spirit");

  const skills = [
    {
      id: "prayer_spirit",
      name: "Prayer & Spirit",
      icon: "🙏",
      level: 5,
      current_xp: 850,
      xp_to_next: 150,
      total_earned: 2350,
      color: "#f59e0b",
      status: "ACTIVE",
      milestones: [
        { level: 1, achieved: true, name: "Daily practice", date: "2026-01-15" },
        { level: 2, achieved: true, name: "365-day streak started", date: "2026-02-20" },
        { level: 3, achieved: false, name: "Deep intercession mastery", date: null },
        { level: 4, achieved: false, name: "Prayer leadership", date: null },
        { level: 5, achieved: true, name: "Current level reached", date: "2026-03-25" },
      ]
    },
    {
      id: "antigravity",
      name: "Antigravity Research",
      icon: "🔬",
      level: 4,
      current_xp: 650,
      xp_to_next: 350,
      total_earned: 2150,
      color: "#0891b2",
      status: "ACTIVE",
      milestones: [
        { level: 1, achieved: true, name: "Thesis outline started", date: "2026-01-10" },
        { level: 2, achieved: false, name: "First paper draft", date: null },
        { level: 3, achieved: false, name: "Patent research phase", date: null },
        { level: 4, achieved: true, name: "Current level", date: "2026-03-20" },
      ]
    },
    {
      id: "kingdom_influence",
      name: "Kingdom Influence",
      icon: "👑",
      level: 5,
      current_xp: 920,
      xp_to_next: 80,
      total_earned: 2420,
      color: "#dc2626",
      status: "ACTIVE",
      milestones: [
        { level: 1, achieved: true, name: "First 100 souls reached", date: "2026-01-30" },
        { level: 2, achieved: true, name: "500 souls milestone", date: "2026-02-28" },
        { level: 3, achieved: false, name: "Leadership training begins", date: null },
        { level: 5, achieved: true, name: "Current level - 487 souls reached", date: "2026-03-22" },
      ]
    },
    {
      id: "coding_automation",
      name: "Coding & Automation",
      icon: "💻",
      level: 4,
      current_xp: 700,
      xp_to_next: 300,
      total_earned: 2200,
      color: "#16a34a",
      status: "ACTIVE",
      milestones: [
        { level: 1, achieved: true, name: "Waqa-OS v1.0 launch", date: "2026-01-20" },
        { level: 2, achieved: true, name: "5k YouTube subs reached", date: "2026-02-15" },
        { level: 3, achieved: false, name: "AI/ML integration", date: null },
        { level: 4, achieved: true, name: "Current level - 10.2k subs", date: "2026-03-24" },
      ]
    },
    {
      id: "health_discipline",
      name: "Health & Discipline",
      icon: "💪",
      level: 5,
      current_xp: 880,
      xp_to_next: 120,
      total_earned: 2380,
      color: "#ea580c",
      status: "ACTIVE",
      milestones: [
        { level: 1, achieved: true, name: "100% consistency goal", date: "2026-02-01" },
        { level: 2, achieved: true, name: "Body fat 12-15% achieved", date: "2026-02-28" },
        { level: 3, achieved: false, name: "Marathon completed", date: null },
        { level: 5, achieved: true, name: "Current level", date: "2026-03-23" },
      ]
    },
    {
      id: "spiritual_engineering",
      name: "Spiritual Engineering",
      icon: "⚙️",
      level: 3,
      current_xp: 380,
      xp_to_next: 620,
      total_earned: 880,
      color: "#9333ea",
      status: "NEW",
      milestones: [
        { level: 1, achieved: true, name: "Framework defined", date: "2026-03-01" },
        { level: 2, achieved: false, name: "8 videos recorded (8/20)", date: null },
        { level: 3, achieved: true, name: "Current level - 10.2k YouTube subs", date: "2026-03-24" },
      ]
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy size={20} className="text-purple-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Skill Trees</h1>
          <p className="text-slate-400 text-sm">6 skill trees progressing toward Phase 2 unlock</p>
        </div>
      </div>

      {/* Phase Unlock Progress */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm">Phase Unlock Requirements</h3>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Phase 1: 67% → Phase 2</span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">XP: 180k / 250k</span>
              <span className="text-blue-400">72%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: "72%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Skill Level 6+: 3 / 3 trees</span>
              <span className="text-green-400">✓ Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Trees List */}
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
            {/* Collapsed View */}
            <button
              onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-[#252d3d] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                <span className="text-3xl">{skill.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{skill.name}</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Level {skill.level}</span>
                    {skill.status === "NEW" && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">NEW</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 max-w-xs">
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(skill.current_xp / (skill.current_xp + skill.xp_to_next)) * 100}%`,
                            backgroundColor: skill.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{skill.current_xp}/{skill.current_xp + skill.xp_to_next} XP</p>
                    </div>
                    <span className="text-sm text-slate-400">Total: {skill.total_earned} XP</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className={`text-slate-400 transition-transform ${expandedSkill === skill.id ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded View */}
            {expandedSkill === skill.id && (
              <div className="border-t border-slate-700 px-5 py-4 bg-[#0f1117]">
                <h4 className="font-bold text-white text-sm mb-3">Milestones</h4>
                <div className="space-y-2">
                  {skill.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${milestone.achieved ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                        {milestone.achieved ? '✓' : 'L' + milestone.level}
                      </div>
                      <div className="flex-1">
                        <p className={milestone.achieved ? 'text-slate-300' : 'text-slate-500'}>{milestone.name}</p>
                        {milestone.date && <p className="text-xs text-slate-600">{milestone.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-[#0f1117] rounded-lg p-4 border border-slate-600/50">
          <p className="text-xs text-slate-400 mb-2">Avg Level</p>
          <p className="text-2xl font-bold text-blue-400">4.5</p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-4 border border-slate-600/50">
          <p className="text-xs text-slate-400 mb-2">Total XP</p>
          <p className="text-2xl font-bold text-green-400">13,880</p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-4 border border-slate-600/50">
          <p className="text-xs text-slate-400 mb-2">Milestones</p>
          <p className="text-2xl font-bold text-purple-400">18/25</p>
        </div>
      </div>
    </div>
  );
}
