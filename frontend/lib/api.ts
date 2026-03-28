/**
 * API client for Claude-Fire backend
 * All calls go to Flask backend at NEXT_PUBLIC_API_URL
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://waqa-os.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboardToday = () => api.get('/api/dashboard/today');
export const getDashboardWeekly = () => api.get('/api/dashboard/weekly');
export const getPieChartToday = () => api.get('/api/pie-chart/today');

// ─── Prayer ─────────────────────────────────────────────────────────────────
export const logPrayer = (data: {themes: string[], type: string}) => api.post('/api/prayer/log', data);
export const endPrayer = (id: string, data: {duration_minutes: number, voice_transcript?: string}) => api.put(`/api/prayer/end/${id}`, data);
export const getPrayerStats = () => api.get('/api/prayer/stats');

// ─── Family Devotion ─────────────────────────────────────────────────────────
export const logFamilyDevotion = (data: {participants: string[], passage_studied: string, notes?: string}) =>
  api.post('/api/family-devotion/log', data);

// ─── Music ──────────────────────────────────────────────────────────────────
export const logMusic = (data: {instrument: string, what_practiced: string, milestone?: string}) =>
  api.post('/api/music/log', data);
export const getMusicStats = () => api.get('/api/music/stats');

// ─── Diary ──────────────────────────────────────────────────────────────────
export const uploadDiary = (formData: FormData) =>
  api.post('/api/diary/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}});

// ─── Tasks ──────────────────────────────────────────────────────────────────
export const getTasksToday = () => api.get('/api/tasks/today');
export const logTaskExecution = (data: object) => api.post('/api/tasks/execution', data);
export const syncCalendar = (task_ids: string[]) => api.post('/api/tasks/sync-calendar', {task_ids});

// ─── Execution ──────────────────────────────────────────────────────────────
export const getExecutionScore = () => api.get('/api/execution/score');
export const getWeeklyAnalysis = () => api.get('/api/execution/weekly-analysis');

// ─── Evening Review ──────────────────────────────────────────────────────────
export const submitEveningReview = (data: object) => api.post('/api/evening-review', data);

// ─── Health ─────────────────────────────────────────────────────────────────
export const getHealthToday = () => api.get('/api/health/today');
export const addWater = (amount_ml: number) => api.post('/api/health/water', {amount_ml});
export const logMeal = (data: object) => api.post('/api/health/meal', data);

// ─── Finance ────────────────────────────────────────────────────────────────
export const getFinanceSummary = () => api.get('/api/finance/summary');
export const getFinanceTransactions = () => api.get('/api/finance/transactions');

// ─── Coding ─────────────────────────────────────────────────────────────────
export const getCodingStats = () => api.get('/api/coding/stats');

// ─── Mission ────────────────────────────────────────────────────────────────
export const logMission = (data: object) => api.post('/api/mission/log', data);
export const getMissionStats = () => api.get('/api/mission/stats');

// ─── Notifications ───────────────────────────────────────────────────────────
export const checkNotifications = () => api.get('/api/notifications/check');

// ─── XP Gamification ─────────────────────────────────────────────────────────
export const getXPToday     = () => api.get('/api/xp/today');
export const getXPWeekly    = () => api.get('/api/xp/weekly');
export const getXPMonthly   = () => api.get('/api/xp/monthly');

// ─── Skill Trees ─────────────────────────────────────────────────────────────
export const getSkillLevels = () => api.get('/api/skills/levels');

// ─── Rewards ─────────────────────────────────────────────────────────────────
export const getRewardsStatus  = () => api.get('/api/rewards/status');
export const getRewardsHistory = () => api.get('/api/rewards/history');
export const claimReward       = (data: object) => api.post('/api/rewards/claim', data);

// ─── Phases & Consistency ────────────────────────────────────────────────────
export const getCurrentPhase      = () => api.get('/api/phases/current');
export const getConsistencyHeatmap = () => api.get('/api/consistency/heatmap');

// ─── Tomorrow Plan (AI) ──────────────────────────────────────────────────────
export const generateTomorrowPlan = (data: object) => api.post('/api/tomorrow-plan/generate', data);
export const getLatestTomorrowPlan = () => api.get('/api/tomorrow-plan/latest');

// ─── YouTube Analytics ───────────────────────────────────────────────────────
export const getYouTubeStats      = () => api.get('/api/youtube/stats');
export const getYouTubeVideos     = () => api.get('/api/youtube/videos');
export const getYouTubeMilestones = () => api.get('/api/youtube/milestones');
