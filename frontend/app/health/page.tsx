"use client";

import { useState, useEffect } from "react";
import { Activity, Moon, Utensils, Plus } from "lucide-react";
import WaterTracker from "@/components/health/WaterTracker";
import { getHealthToday, logMeal } from "@/lib/api";

export default function HealthPage() {
  const [health, setHealth] = useState({
    sleep: { start: "22:30", end: "05:00", duration_hours: 6.5, quality_score: 78 },
    water: { intake_ml: 1500, goal_ml: 2500, percentage: 60, logs: [] as { time: string; amount_ml: number }[] },
    meals: [
      { meal_type: "breakfast", time: "07:00", description: "Sago with vegetables", calories: 380 },
      { meal_type: "lunch", time: "12:30", description: "Rice with chicken", calories: 620 },
    ] as { meal_type: string; time: string; description: string; calories: number }[],
    activity: { steps: 4200, active_minutes: 45, calories_burned: 320 },
    weight_kg: 78.5,
  });
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealDesc, setMealDesc] = useState("");
  const [mealType, setMealType] = useState("snack");

  useEffect(() => {
    getHealthToday().then(r => setHealth(r.data)).catch(() => {});
  }, []);

  const addMeal = async () => {
    if (!mealDesc) return;
    try {
      await logMeal({ meal_type: mealType, food_description: mealDesc });
    } catch { /* continue */ }
    setHealth(prev => ({
      ...prev,
      meals: [...prev.meals, { meal_type: mealType, time: new Date().toLocaleTimeString("en-FJ", { hour: "2-digit", minute: "2-digit" }), description: mealDesc, calories: 0 }],
    }));
    setMealDesc("");
    setShowMealForm(false);
  };

  const sleepColor = health.sleep.duration_hours >= 7 ? "text-green-400" : health.sleep.duration_hours >= 6 ? "text-amber-400" : "text-red-400";
  const qualityColor = health.sleep.quality_score >= 80 ? "#22c55e" : health.sleep.quality_score >= 60 ? "#f59e0b" : "#ef4444";
  const totalCalories = health.meals.reduce((s, m) => s + (m.calories || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Activity size={20} className="text-green-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Health Dashboard</h1>
          <p className="text-slate-400 text-sm">Sleep, water, nutrition, and movement</p>
        </div>
      </div>

      {/* Sleep */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Moon size={16} className="text-blue-400" />
          <h2 className="font-bold text-white text-base">Last Night&apos;s Sleep</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className={`text-2xl font-bold ${sleepColor}`}>{health.sleep.duration_hours}</p>
            <p className="text-xs text-slate-400">Hours</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-2xl font-bold" style={{ color: qualityColor }}>{health.sleep.quality_score}%</p>
            <p className="text-xs text-slate-400">Quality</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-sm font-bold text-white">{health.sleep.start}</p>
            <p className="text-xs text-slate-400">Bedtime</p>
            <p className="text-sm font-bold text-white mt-1">{health.sleep.end}</p>
            <p className="text-xs text-slate-400">Wake</p>
          </div>
        </div>
        {health.sleep.duration_hours < 7 && (
          <p className="text-xs text-amber-400 mt-3 text-center">Goal: 7h sleep — aim for 9:30 PM bedtime</p>
        )}
      </div>

      {/* Water tracker */}
      <WaterTracker initialMl={health.water.intake_ml} goalMl={health.water.goal_ml} />

      {/* Activity */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <Activity size={16} className="text-orange-400" /> Activity
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-2xl font-bold text-orange-400">{health.activity.steps.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Steps</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-2xl font-bold text-green-400">{health.activity.active_minutes}</p>
            <p className="text-xs text-slate-400">Active min</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-2xl font-bold text-red-400">{health.activity.calories_burned}</p>
            <p className="text-xs text-slate-400">Calories</p>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <Utensils size={16} className="text-yellow-600" /> Meals
            <span className="text-xs text-slate-400 font-normal">{totalCalories > 0 && `~${totalCalories} cal`}</span>
          </h2>
          <button
            onClick={() => setShowMealForm(!showMealForm)}
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            <Plus size={12} /> Log Meal
          </button>
        </div>

        {showMealForm && (
          <div className="bg-slate-800 rounded-xl p-4 mb-3 space-y-3">
            <select
              value={mealType}
              onChange={e => setMealType(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none"
            >
              {["breakfast", "lunch", "dinner", "snack"].map(t => (
                <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input
              type="text"
              value={mealDesc}
              onChange={e => setMealDesc(e.target.value)}
              placeholder="What did you eat? (e.g. Rice with greens)"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-amber-400"
            />
            <div className="flex gap-2">
              <button onClick={addMeal} className="flex-1 bg-amber-500 text-slate-900 font-medium text-sm py-2 rounded-lg hover:bg-amber-400">Save</button>
              <button onClick={() => setShowMealForm(false)} className="flex-1 bg-slate-700 text-slate-300 text-sm py-2 rounded-lg hover:bg-slate-600">Cancel</button>
            </div>
          </div>
        )}

        {health.meals.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No meals logged yet</p>
        ) : (
          <div className="space-y-2">
            {health.meals.map((meal, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3">
                <span className="text-xl">{meal.meal_type === "breakfast" ? "🌅" : meal.meal_type === "lunch" ? "☀️" : meal.meal_type === "dinner" ? "🌙" : "🍎"}</span>
                <div className="flex-1">
                  <p className="text-sm text-white capitalize font-medium">{meal.meal_type}</p>
                  <p className="text-xs text-slate-400">{meal.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{meal.time}</p>
                  {meal.calories > 0 && <p className="text-xs text-amber-400">{meal.calories} cal</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weight */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Current Weight</p>
          <p className="text-3xl font-bold text-white">{health.weight_kg} kg</p>
        </div>
        <p className="text-4xl">⚖️</p>
      </div>
    </div>
  );
}
