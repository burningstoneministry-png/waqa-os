"use client";

import { useState, useEffect } from "react";
import { Target, Microscope, Globe, Plus, Trophy } from "lucide-react";
import { getMissionStats, logMission } from "@/lib/api";

export default function MissionPage() {
  const [stats, setStats] = useState({
    antigravity: {
      total_research_hours: 48.5,
      this_week_hours: 4.5,
      notes_count: 23,
      papers_reviewed: 8,
      milestones: [
        { date: "2026-03-15", milestone: "Completed literature review chapter 1" },
        { date: "2026-03-01", milestone: "First experimental hypothesis formed" },
      ],
    },
    kingdom: {
      souls_reached_total: 156,
      souls_reached_this_month: 23,
      church_activities: 8,
      evangelism_events: 3,
      discipleship_sessions: 5,
      milestones: [
        { date: "2026-03-20", milestone: "Led youth service, 8 committed" },
        { date: "2026-03-08", milestone: "Community outreach in Suva" },
      ],
    },
  });

  const [soulCount, setSoulCount] = useState(23);
  const [showLogForm, setShowLogForm] = useState(false);
  const [pillar, setPillar] = useState<"antigravity" | "kingdom">("kingdom");
  const [activity, setActivity] = useState("");
  const [milestone, setMilestone] = useState("");

  useEffect(() => {
    getMissionStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const submitLog = async () => {
    if (!activity) return;
    try {
      await logMission({ pillar, activity, milestone: milestone || undefined });
    } catch { /* continue */ }
    if (pillar === "kingdom" && activity.toLowerCase().includes("soul")) {
      setSoulCount(s => s + 1);
    }
    setActivity("");
    setMilestone("");
    setShowLogForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Target size={20} className="text-purple-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Mission Board</h1>
          <p className="text-slate-400 text-sm">Antigravity research + Kingdom expansion in Fiji</p>
        </div>
      </div>

      {/* ── ANTIGRAVITY ── */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Microscope size={18} className="text-cyan-400" />
          <h2 className="font-bold text-cyan-400 uppercase tracking-wide text-sm">Pillar 1: Antigravity Research</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{stats.antigravity.total_research_hours}h</p>
            <p className="text-xs text-slate-400">Total Research Hours</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-cyan-400">{stats.antigravity.this_week_hours}h</p>
            <p className="text-xs text-slate-400">This Week</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{stats.antigravity.notes_count}</p>
            <p className="text-xs text-slate-400">Research Notes</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{stats.antigravity.papers_reviewed}</p>
            <p className="text-xs text-slate-400">Papers Reviewed</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Trophy size={12} className="text-amber-400" /> Milestones
          </h3>
          <div className="space-y-2">
            {stats.antigravity.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-white">{m.milestone}</p>
                  <p className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString("en-FJ", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KINGDOM ── */}
      <div className="bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-amber-400" />
          <h2 className="font-bold text-amber-400 uppercase tracking-wide text-sm">Pillar 2: Kingdom Expansion</h2>
        </div>

        {/* Souls counter */}
        <div className="text-center mb-5">
          <p className="text-xs text-slate-400 mb-2">Souls Reached This Month</p>
          <button
            onClick={() => setSoulCount(s => s + 1)}
            className="text-8xl font-bold text-amber-400 hover:scale-110 transition-transform active:scale-95"
            title="Tap to count a soul reached for Christ"
          >
            {soulCount}
          </button>
          <p className="text-sm text-slate-400 mt-1">/ {stats.kingdom.souls_reached_total} all time</p>
          <p className="text-xs text-slate-500 mt-0.5">Tap number to log a new soul reached</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.kingdom.church_activities}</p>
            <p className="text-xs text-slate-400">Church Acts</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.kingdom.evangelism_events}</p>
            <p className="text-xs text-slate-400">Outreach</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.kingdom.discipleship_sessions}</p>
            <p className="text-xs text-slate-400">Discipleship</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Trophy size={12} className="text-amber-400" /> Milestones
          </h3>
          <div className="space-y-2">
            {stats.kingdom.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-white">{m.milestone}</p>
                  <p className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString("en-FJ", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log activity */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-base">Log Mission Activity</h2>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-500/30"
          >
            <Plus size={12} /> Log Activity
          </button>
        </div>
        {showLogForm && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["antigravity", "kingdom"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPillar(p)}
                  className={`flex-1 py-2 rounded-xl text-sm capitalize font-medium transition-colors ${
                    pillar === p ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {p === "antigravity" ? "🔬 Antigravity" : "🌍 Kingdom"}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={activity}
              onChange={e => setActivity(e.target.value)}
              placeholder="Activity description..."
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              value={milestone}
              onChange={e => setMilestone(e.target.value)}
              placeholder="Milestone (optional)..."
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:border-amber-400"
            />
            <div className="flex gap-2">
              <button onClick={submitLog} className="flex-1 bg-amber-500 text-slate-900 font-medium py-2.5 rounded-xl text-sm hover:bg-amber-400">Save</button>
              <button onClick={() => setShowLogForm(false)} className="flex-1 bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm hover:bg-slate-600">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
