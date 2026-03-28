// ─── Core types for Claude-Fire dashboard ───────────────────────────────────

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  goal_minutes_per_day: number;
}

export interface PieSlice {
  category: string;
  minutes: number;
  color: string;
  icon: string;
  percentage?: number;
}

export interface Task {
  id: string;
  title: string;
  planned_start: string;
  planned_end: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'partial' | 'in_progress' | 'pending' | 'skipped';
  delay_minutes: number;
  completion_percentage: number;
}

export interface PrayerStats {
  streak: number;
  longest_streak: number;
  today_minutes: number;
  goal_minutes: number;
  completed: boolean;
  themes: string[];
  theme_breakdown: { theme: string; count: number }[];
  weekly_consistency: boolean[];
}

export interface HealthData {
  sleep: {
    start: string;
    end: string;
    duration_hours: number;
    quality_score: number;
  };
  water: {
    intake_ml: number;
    goal_ml: number;
    percentage: number;
    logs: { time: string; amount_ml: number }[];
  };
  meals: {
    meal_type: string;
    time: string;
    description: string;
    calories: number;
  }[];
  activity: {
    steps: number;
    active_minutes: number;
    calories_burned: number;
  };
  weight_kg: number;
}

export interface FinanceSummary {
  westpac_balance: number;
  mpaisa_balance: number;
  total_balance: number;
  currency: string;
  this_month: {
    income: number;
    expenses: number;
    savings: number;
    savings_rate: number;
  };
  today: {
    spending: number;
    transactions: number;
  };
  top_categories: { category: string; amount: number; color: string }[];
}

export interface CodingStats {
  today_minutes: number;
  today_hours: number;
  streak: number;
  projects: { name: string; minutes: number }[];
  languages: { name: string; minutes: number }[];
  top_project: string;
}

export interface MissionStats {
  antigravity: {
    total_research_hours: number;
    this_week_hours: number;
    notes_count: number;
    papers_reviewed: number;
    milestones: { date: string; milestone: string }[];
  };
  kingdom: {
    souls_reached_total: number;
    souls_reached_this_month: number;
    church_activities: number;
    evangelism_events: number;
    discipleship_sessions: number;
    milestones: { date: string; milestone: string }[];
  };
}

export interface DashboardData {
  date: string;
  execution_score: number;
  tasks: Task[];
  pie_chart: PieSlice[];
  prayer: {
    streak: number;
    today_minutes: number;
    goal_minutes: number;
    completed: boolean;
    themes: string[];
  };
  health: {
    sleep_hours: number;
    sleep_quality: number;
    water_ml: number;
    water_goal_ml: number;
    steps: number;
    active_minutes: number;
  };
  finance: {
    westpac_balance: number;
    mpaisa_balance: number;
    today_spending: number;
    monthly_savings_rate: number;
  };
  coding: {
    today_minutes: number;
    streak: number;
    top_project: string;
    languages: { name: string; minutes: number }[];
  };
  mission: {
    souls_reached_month: number;
    research_hours_week: number;
    antigravity_notes: number;
    kingdom_activities: number;
  };
  ai_tip: string;
}
