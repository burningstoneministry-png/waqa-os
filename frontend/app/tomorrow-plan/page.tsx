"use client";

import { useState } from "react";
import { Moon, Sun, Star, Zap, ChevronRight, RefreshCw, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function TomorrowPlanPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [form, setForm] = useState({
    execution_score: 74,
    went_well: "",
    improve_tomorrow: "",
    mood: 4,
    pending_tasks: [] as string[],
  });
  const [pendingInput, setPendingInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const moodLabels: Record<number, string> = {
    1: "😔 Difficult", 2: "😐 Low", 3: "🙂 Okay", 4: "😊 Good", 5: "🔥 Excellent"
  };

  const addPending = () => {
    if (pendingInput.trim()) {
      setForm(f => ({ ...f, pending_tasks: [...f.pending_tasks, pendingInput.trim()] }));
      setPendingInput("");
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/tomorrow-plan/generate", form);
      setPlan(res.data);
      setSubmitted(true);
    } catch {
      // Fallback to mock plan
      setPlan({
        for_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        plan: {
          morning_anchor: {
            prayer: "Deep intercession — focus on research vision and family",
            bible: "Proverbs 3:5-6 — wisdom for the day ahead",
            water: "2.5L target — start with 500ml on waking",
          },
          focus_task: {
            title: "Antigravity research — chapter outline + literature notes",
            duration: "4 hours (9am–1pm)",
            why: "Phase 1 priority — publishing your first paper requires consistent deep work",
            xp: 40,
          },
          secondary_tasks: [
            { title: "Waqa-OS coding — connect XP to Supabase", duration: "2h", xp: 20 },
            { title: "Bass guitar practice — worship set", duration: "1h", xp: 10 },
            { title: "Training / gym session", duration: "1h", xp: 15 },
          ],
          evening: "9:30pm — Evening review + diary upload",
          projected_xp: 120,
          encouragement: "The same God who called you to antigravity research is ordering your steps tomorrow — trust the process.",
        },
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Moon size={20} className="text-indigo-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Tomorrow Plan</h1>
          <p className="text-slate-400 text-sm">AI-generated daily plan from your evening review</p>
        </div>
      </div>

      {!submitted ? (
        /* ── Evening Review Form ── */
        <div className="space-y-4">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
            <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
              <Star size={15} className="text-yellow-400" /> Evening Review (2pm or 9:30pm)
            </h3>

            {/* Score */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">
                Today's Execution Score: <span className="text-blue-400 font-bold">{form.execution_score}/100</span>
              </label>
              <input
                type="range" min={0} max={100} value={form.execution_score}
                onChange={e => setForm(f => ({ ...f, execution_score: +e.target.value }))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Mood */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">
                Mood: <span className="text-yellow-400 font-bold">{moodLabels[form.mood]}</span>
              </label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(m => (
                  <button
                    key={m}
                    onClick={() => setForm(f => ({ ...f, mood: m }))}
                    className={`flex-1 py-2 rounded-lg text-lg transition-all ${form.mood === m ? 'bg-yellow-500/30 border border-yellow-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                  >
                    {["😔","😐","🙂","😊","🔥"][m-1]}
                  </button>
                ))}
              </div>
            </div>

            {/* What went well */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">What went well today?</label>
              <textarea
                value={form.went_well}
                onChange={e => setForm(f => ({ ...f, went_well: e.target.value }))}
                placeholder="e.g. Prayer and coding sessions were strong..."
                className="w-full bg-[#0f1117] border border-slate-600 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-600 resize-none h-20 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Improve tomorrow */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">What to improve tomorrow?</label>
              <textarea
                value={form.improve_tomorrow}
                onChange={e => setForm(f => ({ ...f, improve_tomorrow: e.target.value }))}
                placeholder="e.g. Water intake, training session, research hours..."
                className="w-full bg-[#0f1117] border border-slate-600 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-600 resize-none h-20 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Pending tasks */}
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Carry-over tasks (optional)</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={pendingInput}
                  onChange={e => setPendingInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addPending()}
                  placeholder="Add unfinished task..."
                  className="flex-1 bg-[#0f1117] border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button onClick={addPending} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg text-sm transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.pending_tasks.map((t, i) => (
                  <span key={i} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                    {t}
                    <button onClick={() => setForm(f => ({ ...f, pending_tasks: f.pending_tasks.filter((_,j)=>j!==i) }))} className="text-slate-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-base disabled:opacity-60"
          >
            {loading ? (
              <><RefreshCw size={18} className="animate-spin" /> Generating your plan...</>
            ) : (
              <><Zap size={18} /> Generate Tomorrow's Plan with AI</>
            )}
          </button>
        </div>
      ) : (
        /* ── Generated Plan View ── */
        <div className="space-y-4">
          {/* Plan Date */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-2xl p-4 border border-indigo-700/50 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-wide">Tomorrow's Plan</p>
              <p className="text-lg font-bold text-white">{plan?.for_date}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Projected XP</p>
              <p className="text-2xl font-bold text-yellow-400">{plan?.plan?.projected_xp || 87}</p>
            </div>
          </div>

          {/* Morning Anchor */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-amber-700/30">
            <div className="flex items-center gap-2 mb-4">
              <Sun size={16} className="text-amber-400" />
              <h3 className="font-bold text-white text-sm">🌅 Morning Anchor (6am–8am)</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: "🙏 Prayer", value: plan?.plan?.morning_anchor?.prayer },
                { label: "📖 Bible", value: plan?.plan?.morning_anchor?.bible },
                { label: "💧 Water", value: plan?.plan?.morning_anchor?.water },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-slate-400 w-16 flex-shrink-0">{item.label}</span>
                  <span className="text-slate-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Task */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-blue-700/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-blue-400" />
                <h3 className="font-bold text-white text-sm">⭐ Focus Task</h3>
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-bold">+{plan?.plan?.focus_task?.xp || 40} XP</span>
            </div>
            <p className="font-bold text-white mb-1">{plan?.plan?.focus_task?.title}</p>
            <p className="text-xs text-slate-400 mb-2">{plan?.plan?.focus_task?.duration}</p>
            <p className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 italic">
              💡 {plan?.plan?.focus_task?.why}
            </p>
          </div>

          {/* Secondary Tasks */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
            <h3 className="font-bold text-white text-sm mb-4">📋 Secondary Tasks</h3>
            <div className="space-y-3">
              {(plan?.plan?.secondary_tasks || []).map((task: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0f1117] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">{i+1}</div>
                    <div>
                      <p className="text-sm text-slate-300">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.duration}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-400 font-bold">+{task.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evening */}
          <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 flex items-center gap-3">
            <Moon size={16} className="text-indigo-400 flex-shrink-0" />
            <p className="text-sm text-slate-300">{plan?.plan?.evening}</p>
          </div>

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-5 border border-purple-700/30">
            <p className="text-sm text-purple-200 italic leading-relaxed">
              ✨ {plan?.plan?.encouragement}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setSubmitted(false)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} /> Regenerate
            </button>
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={15} /> Accept Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
