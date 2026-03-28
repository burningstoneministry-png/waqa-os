"use client";

import { useState, useEffect } from "react";
import { ListTodo, CalendarClock } from "lucide-react";
import TaskList from "@/components/tasks/TaskList";
import ExecutionScore from "@/components/tasks/ExecutionScore";
import { getTasksToday, getExecutionScore } from "@/lib/api";
import { Task } from "@/lib/types";

const MOCK_TASKS: Task[] = [
  { id: "t1", title: "Morning Prayer & Bible Study", planned_start: "05:30", planned_end: "06:30", category: "Prayer", priority: "high", status: "completed", delay_minutes: 0, completion_percentage: 100 },
  { id: "t2", title: "Family Devotion with Kids", planned_start: "06:30", planned_end: "07:00", category: "Family Devotion", priority: "high", status: "completed", delay_minutes: 5, completion_percentage: 100 },
  { id: "t3", title: "Exercise / Workout", planned_start: "07:00", planned_end: "08:00", category: "Exercise", priority: "medium", status: "partial", delay_minutes: 15, completion_percentage: 75 },
  { id: "t4", title: "Deep Work — Claude-Fire Project", planned_start: "09:00", planned_end: "12:00", category: "Coding", priority: "high", status: "in_progress", delay_minutes: 0, completion_percentage: 60 },
  { id: "t5", title: "Antigravity Research Reading", planned_start: "13:00", planned_end: "14:00", category: "Research", priority: "medium", status: "pending", delay_minutes: 0, completion_percentage: 0 },
  { id: "t6", title: "Bass Guitar Practice", planned_start: "16:00", planned_end: "17:00", category: "Music Practice", priority: "medium", status: "pending", delay_minutes: 0, completion_percentage: 0 },
  { id: "t7", title: "Evening Review", planned_start: "21:30", planned_end: "22:00", category: "Evening Review", priority: "high", status: "pending", delay_minutes: 0, completion_percentage: 0 },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [scoreData, setScoreData] = useState({
    score: 74,
    grade: "B",
    breakdown: { on_time_tasks: 3, partial_tasks: 1, skipped_tasks: 0, pending_tasks: 3, total_tasks: 7 },
    category_scores: [
      { category: "Spiritual", score: 95, color: "#f59e0b" },
      { category: "Coding", score: 70, color: "#16a34a" },
      { category: "Health", score: 65, color: "#ea580c" },
      { category: "Music", score: 80, color: "#9333ea" },
      { category: "Research", score: 55, color: "#0891b2" },
    ],
  });

  useEffect(() => {
    getTasksToday().then(r => setTasks(r.data.tasks)).catch(() => {});
    getExecutionScore().then(r => setScoreData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ListTodo size={20} className="text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Task Planner</h1>
          <p className="text-slate-400 text-sm">Track planned vs actual execution</p>
        </div>
      </div>

      {/* Execution score */}
      <ExecutionScore
        score={scoreData.score}
        breakdown={scoreData.breakdown}
        categoryScores={scoreData.category_scores}
      />

      {/* Task list */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <CalendarClock size={14} className="text-slate-400" />
          {new Date().toLocaleDateString("en-FJ", { weekday: "long", day: "numeric", month: "long" })}
        </h2>
        <TaskList tasks={tasks} onUpdate={setTasks} />
      </div>
    </div>
  );
}
