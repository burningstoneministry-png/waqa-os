"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Clock, Play, SkipForward, ChevronDown, ChevronUp } from "lucide-react";
import { logTaskExecution } from "@/lib/api";
import { Task } from "@/lib/types";

interface Props {
  tasks: Task[];
  onUpdate?: (tasks: Task[]) => void;
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10", border: "border-l-green-500", label: "Done", emoji: "✅" },
  partial: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-l-amber-500", label: "Partial", emoji: "⚠️" },
  in_progress: { icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-l-blue-500", label: "Active", emoji: "🔄" },
  pending: { icon: Clock, color: "text-slate-400", bg: "bg-slate-800", border: "border-l-slate-600", label: "Pending", emoji: "⏳" },
  skipped: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-l-red-500", label: "Skipped", emoji: "❌" },
};

export default function TaskList({ tasks: initialTasks, onUpdate }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const updateTask = async (taskId: string, update: Partial<Task>, executionData?: object) => {
    setLoading(taskId);
    try {
      if (executionData) {
        await logTaskExecution({ task_id: taskId, ...executionData });
      }
    } catch { /* continue */ }
    const updated = tasks.map(t => t.id === taskId ? { ...t, ...update } : t);
    setTasks(updated);
    onUpdate?.(updated);
    setLoading(null);
    setExpanded(null);
  };

  const handleStart = (task: Task) =>
    updateTask(task.id, { status: "in_progress" }, {
      actual_start: new Date().toISOString(),
      status: "in_progress",
    });

  const handleComplete = (task: Task) =>
    updateTask(task.id, { status: "completed", completion_percentage: 100 }, {
      actual_end: new Date().toISOString(),
      status: "completed",
      completion_percentage: 100,
    });

  const handlePartial = (task: Task) =>
    updateTask(task.id, { status: "partial", completion_percentage: 50 }, {
      actual_end: new Date().toISOString(),
      status: "partial",
      completion_percentage: 50,
    });

  const handleSkip = (task: Task) =>
    updateTask(task.id, { status: "skipped" }, {
      status: "skipped",
      skip_reason: skipReason,
    });

  const handleDelay = (task: Task) => {
    const delayMins = 15;
    updateTask(task.id, { delay_minutes: task.delay_minutes + delayMins }, {
      status: "late",
      delay_minutes: delayMins,
    });
  };

  const completed = tasks.filter(t => t.status === "completed").length;
  const score = Math.round((completed / tasks.length) * 100);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-3 bg-[#1e293b] rounded-xl p-3 border border-slate-700">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-sm font-bold text-green-400 w-16 text-right">{completed}/{tasks.length} done</span>
      </div>

      {/* Task items */}
      {tasks.map((task) => {
        const cfg = STATUS_CONFIG[task.status];
        const Icon = cfg.icon;
        const isExpanded = expanded === task.id;
        const isLoading = loading === task.id;

        return (
          <div
            key={task.id}
            className={`border-l-2 ${cfg.border} bg-[#1e293b] rounded-r-xl overflow-hidden border border-slate-700 border-l-2`}
          >
            {/* Main row */}
            <button
              className="w-full flex items-center gap-3 p-3.5 text-left"
              onClick={() => setExpanded(isExpanded ? null : task.id)}
            >
              <Icon size={16} className={cfg.color} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "completed" || task.status === "skipped" ? "line-through text-slate-500" : "text-white"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500">{task.planned_start} – {task.planned_end}</p>
                  {task.delay_minutes > 0 && (
                    <span className="text-xs text-amber-400">+{task.delay_minutes}m late</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    task.priority === "high" ? "bg-red-500/20 text-red-400" :
                    task.priority === "medium" ? "bg-amber-500/20 text-amber-400" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.emoji} {cfg.label}</span>
                {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </div>
            </button>

            {/* Expanded actions */}
            {isExpanded && (
              <div className="px-3.5 pb-3.5 border-t border-slate-700/50 pt-3">
                {task.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStart(task)}
                      disabled={!!isLoading}
                      className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <Play size={12} /> Mark Started
                    </button>
                    <button
                      onClick={() => handleDelay(task)}
                      disabled={!!isLoading}
                      className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs px-3 py-2 rounded-lg hover:bg-amber-500/30 transition-colors"
                    >
                      <Clock size={12} /> Delay 15min
                    </button>
                    <button
                      onClick={() => handleSkip(task)}
                      disabled={!!isLoading}
                      className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <SkipForward size={12} /> Skip
                    </button>
                  </div>
                )}
                {task.status === "in_progress" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleComplete(task)}
                      disabled={!!isLoading}
                      className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Complete ✅
                    </button>
                    <button
                      onClick={() => handlePartial(task)}
                      disabled={!!isLoading}
                      className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs px-3 py-2 rounded-lg hover:bg-amber-500/30 transition-colors"
                    >
                      <AlertCircle size={12} /> Partial ⚠️
                    </button>
                    <button
                      onClick={() => handleSkip(task)}
                      disabled={!!isLoading}
                      className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <XCircle size={12} /> Skip ❌
                    </button>
                  </div>
                )}
                {(task.status === "completed" || task.status === "skipped") && (
                  <p className="text-xs text-slate-500">
                    {task.status === "completed" ? "✅ Task completed" : "❌ Task skipped"}
                  </p>
                )}
                {isLoading && <p className="text-xs text-slate-400 mt-2">Saving...</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
