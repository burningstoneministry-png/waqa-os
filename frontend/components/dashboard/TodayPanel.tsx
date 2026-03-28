"use client";

import { useState } from "react";
import {
  CheckCircle2, AlertCircle, XCircle, Clock,
  Zap, Play, SkipForward, Trophy, ListTodo, Activity,
} from "lucide-react";
import { Task } from "@/lib/types";

interface Props {
  score: number;
  tasks: Task[];
  aiTip: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-[#6ee7b7]",
    badgeClass: "badge badge-green",
    label: "Completed",
  },
  partial: {
    icon: AlertCircle,
    color: "text-[#fbbf24]",
    badgeClass: "badge badge-amber",
    label: "Partial",
  },
  in_progress: {
    icon: Activity,
    color: "text-[#4f8ef7]",
    badgeClass: "badge badge-blue",
    label: "In Progress",
  },
  pending: {
    icon: Clock,
    color: "text-slate-500",
    badgeClass: "badge badge-gray",
    label: "Pending",
  },
  skipped: {
    icon: XCircle,
    color: "text-[#f87171]",
    badgeClass: "badge badge-red",
    label: "Skipped",
  },
};

const priorityAccent = {
  high: "border-l-[#f87171]",
  medium: "border-l-[#fbbf24]",
  low: "border-l-slate-600",
};

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? "#6ee7b7" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 1.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[10px] text-slate-500 mt-0.5">/100</span>
      </div>
    </div>
  );
}

export default function TodayPanel({ score, tasks, aiTip }: Props) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-5 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <Trophy size={15} className="text-[#4f8ef7]" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Today's Execution</h3>
      </div>

      {/* ── Score + mini stat row ── */}
      <div className="flex items-center gap-4">
        <ScoreRing score={score} />
        <div className="flex-1 grid grid-cols-3 gap-2">
          <div className="bg-[#6ee7b7]/10 border border-[#6ee7b7]/10 rounded-lg py-2 text-center">
            <p className="text-lg font-bold text-[#6ee7b7]">{completed}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Done</p>
          </div>
          <div className="bg-[#4f8ef7]/10 border border-[#4f8ef7]/10 rounded-lg py-2 text-center">
            <p className="text-lg font-bold text-[#4f8ef7]">{inProgress}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Active</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-lg py-2 text-center">
            <p className="text-lg font-bold text-slate-400">{pending}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Pending</p>
          </div>
        </div>
      </div>

      {/* ── AI Tip ── */}
      <div className="flex gap-3 bg-[#fbbf24]/8 border border-[#fbbf24]/15 rounded-xl p-3">
        <Zap size={14} className="text-[#fbbf24] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-300 leading-relaxed">{aiTip}</p>
      </div>

      {/* ── Task list ── */}
      <div className="space-y-1.5">
        <p className="section-title flex items-center gap-1.5">
          <ListTodo size={11} />
          Tasks
        </p>
        {tasks.map((task) => {
          const cfg = statusConfig[task.status];
          const Icon = cfg.icon;
          const isExpanded = expandedTask === task.id;

          return (
            <div
              key={task.id}
              className={`border-l-2 ${priorityAccent[task.priority]} bg-white/[0.025] hover:bg-white/[0.04] rounded-r-xl overflow-hidden transition-colors`}
            >
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                <Icon size={14} className={cfg.color} />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-medium truncate ${
                      task.status === "completed"
                        ? "text-slate-500 line-through"
                        : "text-slate-200"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {task.planned_start} – {task.planned_end}
                    {task.delay_minutes > 0 && (
                      <span className="text-[#fbbf24] ml-2">+{task.delay_minutes}m late</span>
                    )}
                  </p>
                </div>
                <span className={cfg.badgeClass}>{cfg.label}</span>
              </button>

              {/* Expanded action buttons */}
              {isExpanded && task.status === "pending" && (
                <div className="flex gap-2 px-3 pb-3">
                  <button className="flex items-center gap-1.5 bg-[#6ee7b7]/10 text-[#6ee7b7] text-[11px] font-medium px-3 py-1.5 rounded-lg hover:bg-[#6ee7b7]/20 transition-colors">
                    <Play size={11} /> Start
                  </button>
                  <button className="flex items-center gap-1.5 bg-[#fbbf24]/10 text-[#fbbf24] text-[11px] font-medium px-3 py-1.5 rounded-lg hover:bg-[#fbbf24]/20 transition-colors">
                    <Clock size={11} /> Delay
                  </button>
                  <button className="flex items-center gap-1.5 bg-[#f87171]/10 text-[#f87171] text-[11px] font-medium px-3 py-1.5 rounded-lg hover:bg-[#f87171]/20 transition-colors">
                    <SkipForward size={11} /> Skip
                  </button>
                </div>
              )}
              {isExpanded && task.status === "in_progress" && (
                <div className="flex gap-2 px-3 pb-3">
                  <button className="flex items-center gap-1.5 bg-[#6ee7b7]/10 text-[#6ee7b7] text-[11px] font-medium px-3 py-1.5 rounded-lg hover:bg-[#6ee7b7]/20 transition-colors">
                    <CheckCircle2 size={11} /> Complete
                  </button>
                  <button className="flex items-center gap-1.5 bg-[#fbbf24]/10 text-[#fbbf24] text-[11px] font-medium px-3 py-1.5 rounded-lg hover:bg-[#fbbf24]/20 transition-colors">
                    <AlertCircle size={11} /> Partial
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
