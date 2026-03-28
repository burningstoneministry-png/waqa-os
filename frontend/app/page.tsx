"use client";

import { useState, useEffect } from "react";
import { getDashboardToday } from "@/lib/api";
import { DashboardData } from "@/lib/types";
import DailyPieChart from "@/components/dashboard/DailyPieChart";
import TodayPanel from "@/components/dashboard/TodayPanel";
import SpiritualPanel from "@/components/dashboard/SpiritualPanel";
import HealthPanel from "@/components/dashboard/HealthPanel";
import FinancePanel from "@/components/dashboard/FinancePanel";
import MissionPanel from "@/components/dashboard/MissionPanel";
import CodingPanel from "@/components/dashboard/CodingPanel";
import {
  RefreshCw, Trophy, Flame, Code2, Droplets,
  TrendingUp, TrendingDown,
} from "lucide-react";

const MOCK_DATA: DashboardData = {
  date: new Date().toISOString().split("T")[0],
  execution_score: 74,
  tasks: [
    { id: "t1", title: "Morning Prayer & Bible Study", planned_start: "05:30", planned_end: "06:30", category: "Prayer", priority: "high", status: "completed", delay_minutes: 0, completion_percentage: 100 },
    { id: "t2", title: "Family Devotion with Kids", planned_start: "06:30", planned_end: "07:00", category: "Family Devotion", priority: "high", status: "completed", delay_minutes: 5, completion_percentage: 100 },
    { id: "t3", title: "Exercise / Workout", planned_start: "07:00", planned_end: "08:00", category: "Exercise", priority: "medium", status: "partial", delay_minutes: 15, completion_percentage: 75 },
    { id: "t4", title: "Deep Work — Claude-Fire Project", planned_start: "09:00", planned_end: "12:00", category: "Coding", priority: "high", status: "in_progress", delay_minutes: 0, completion_percentage: 60 },
    { id: "t5", title: "Antigravity Research Reading", planned_start: "13:00", planned_end: "14:00", category: "Research", priority: "medium", status: "pending", delay_minutes: 0, completion_percentage: 0 },
    { id: "t6", title: "Bass Guitar Practice", planned_start: "16:00", planned_end: "17:00", category: "Music Practice", priority: "medium", status: "pending", delay_minutes: 0, completion_percentage: 0 },
    { id: "t7", title: "Evening Review", planned_start: "21:30", planned_end: "22:00", category: "Evening Review", priority: "high", status: "pending", delay_minutes: 0, completion_percentage: 0 },
  ],
  pie_chart: [
    { category: "Sleep", minutes: 390, color: "#1e3a5f", icon: "🌙" },
    { category: "Prayer", minutes: 50, color: "#f59e0b", icon: "🙏" },
    { category: "Bible Study", minutes: 35, color: "#7c3aed", icon: "📖" },
    { category: "Family Devotion", minutes: 30, color: "#dc2626", icon: "❤️" },
    { category: "Coding", minutes: 210, color: "#16a34a", icon: "💻" },
    { category: "Research", minutes: 65, color: "#0891b2", icon: "🔬" },
    { category: "Exercise", minutes: 45, color: "#ea580c", icon: "💪" },
    { category: "Eating", minutes: 55, color: "#92400e", icon: "🍽️" },
    { category: "Music Practice", minutes: 60, color: "#9333ea", icon: "🎸" },
    { category: "Family Time", minutes: 75, color: "#d97706", icon: "👨‍👩‍👧" },
    { category: "Evening Review", minutes: 30, color: "#0284c7", icon: "📝" },
    { category: "Free / Rest", minutes: 90, color: "#93c5fd", icon: "☕" },
    { category: "Untracked", minutes: 305, color: "#d1d5db", icon: "❓" },
  ],
  prayer: { streak: 12, today_minutes: 50, goal_minutes: 45, completed: true, themes: ["wisdom", "family", "nation"] },
  health: { sleep_hours: 6.5, sleep_quality: 78, water_ml: 1500, water_goal_ml: 2500, steps: 4200, active_minutes: 45 },
  finance: { westpac_balance: 3240.50, mpaisa_balance: 85.00, today_spending: 42.50, monthly_savings_rate: 18 },
  coding: { today_minutes: 210, streak: 7, top_project: "Claude-Fire", languages: [{ name: "TypeScript", minutes: 120 }, { name: "Python", minutes: 60 }, { name: "SQL", minutes: 30 }] },
  mission: { souls_reached_month: 23, research_hours_week: 4.5, antigravity_notes: 3, kingdom_activities: 2 },
  ai_tip: "You're 12 minutes ahead of your prayer goal. Consider adding a gratitude block after dinner to boost your evening review quality.",
};

// ── Top-level stat cards row ──────────────────────────────────────────────────
function StatCards({ data }: { data: DashboardData }) {
  const codingHours = (data.coding.today_minutes / 60).toFixed(1);
  const waterPct = Math.round((data.health.water_ml / data.health.water_goal_ml) * 100);
  const scoreColor =
    data.execution_score >= 80 ? "#6ee7b7"
    : data.execution_score >= 60 ? "#fbbf24"
    : "#f87171";

  const stats = [
    {
      label: "Execution Score",
      value: `${data.execution_score}`,
      unit: "/100",
      icon: Trophy,
      iconColor: "#4f8ef7",
      iconBg: "rgba(79,142,247,0.12)",
      trend: "+4",
      trendUp: true,
      valueColor: scoreColor,
      accent: "stat-card-blue",
    },
    {
      label: "Prayer Streak",
      value: `${data.prayer.streak}`,
      unit: "days",
      icon: Flame,
      iconColor: "#fbbf24",
      iconBg: "rgba(251,191,36,0.12)",
      trend: "+1 today",
      trendUp: true,
      valueColor: "#fbbf24",
      accent: "stat-card-amber",
    },
    {
      label: "Coding Today",
      value: codingHours,
      unit: "hrs",
      icon: Code2,
      iconColor: "#6ee7b7",
      iconBg: "rgba(110,231,183,0.12)",
      trend: `${data.coding.streak}d streak`,
      trendUp: true,
      valueColor: "#6ee7b7",
      accent: "stat-card-green",
    },
    {
      label: "Water Intake",
      value: `${waterPct}`,
      unit: "%",
      icon: Droplets,
      iconColor: waterPct >= 80 ? "#6ee7b7" : waterPct >= 50 ? "#4f8ef7" : "#f87171",
      iconBg: "rgba(79,142,247,0.12)",
      trend: `${data.health.water_ml}ml`,
      trendUp: waterPct >= 60,
      valueColor: waterPct >= 80 ? "#6ee7b7" : waterPct >= 50 ? "#4f8ef7" : "#f87171",
      accent: waterPct >= 60 ? "stat-card-blue" : "stat-card-red",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={`stat-card ${s.accent} pl-5 flex items-center gap-4`}>
            <div
              className="icon-box flex-shrink-0"
              style={{ backgroundColor: s.iconBg }}
            >
              <Icon size={17} style={{ color: s.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{s.label}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold" style={{ color: s.valueColor }}>
                  {s.value}
                </span>
                <span className="text-[11px] text-slate-500">{s.unit}</span>
              </div>
            </div>
            <div className={`text-[10px] font-semibold flex-shrink-0 ${s.trendUp ? "text-[#6ee7b7]" : "text-[#f87171]"}`}>
              {s.trendUp ? "↑" : "↓"} {s.trend}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getDashboardToday();
      setData(res.data);
    } catch {
      // keep mock data on API error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            Good {greeting}, Waqa
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-FJ", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 bg-[#1a1d2e] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white text-sm px-3.5 py-2 rounded-xl transition-all disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Row 1: 4 stat cards ── */}
      <StatCards data={data} />

      {/* ── Row 2: TodayPanel | PieChart | SpiritualPanel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TodayPanel score={data.execution_score} tasks={data.tasks} aiTip={data.ai_tip} />
        <DailyPieChart data={data.pie_chart} />
        <SpiritualPanel
          prayerStreak={data.prayer.streak}
          todayPrayerMin={data.prayer.today_minutes}
          prayerGoalMin={data.prayer.goal_minutes}
          prayerCompleted={data.prayer.completed}
          soulsReachedMonth={data.mission.souls_reached_month}
          churchActivities={data.mission.kingdom_activities}
        />
      </div>

      {/* ── Row 3: 4-column panel grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <HealthPanel
          sleepHours={data.health.sleep_hours}
          sleepQuality={data.health.sleep_quality}
          waterMl={data.health.water_ml}
          waterGoalMl={data.health.water_goal_ml}
          steps={data.health.steps}
          activeMinutes={data.health.active_minutes}
        />
        <FinancePanel
          westpacBalance={data.finance.westpac_balance}
          mpaisaBalance={data.finance.mpaisa_balance}
          todaySpending={data.finance.today_spending}
          savingsRate={data.finance.monthly_savings_rate}
        />
        <CodingPanel
          stats={{
            today_minutes: data.coding.today_minutes,
            today_hours: data.coding.today_minutes / 60,
            streak: data.coding.streak,
            projects: [{ name: data.coding.top_project, minutes: data.coding.today_minutes }],
            languages: data.coding.languages,
            top_project: data.coding.top_project,
          }}
        />
        <MissionPanel
          soulsReachedMonth={data.mission.souls_reached_month}
          researchHoursWeek={data.mission.research_hours_week}
          antigravityNotes={data.mission.antigravity_notes}
          kingdomActivities={data.mission.kingdom_activities}
        />
      </div>
    </div>
  );
}
