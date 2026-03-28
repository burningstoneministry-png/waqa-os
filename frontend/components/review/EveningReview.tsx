"use client";

import { useState } from "react";
import { Star, Send, CheckCircle, Upload } from "lucide-react";
import { submitEveningReview } from "@/lib/api";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😞", label: "Rough" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🔥", label: "Great" },
];

interface Props {
  executionScore: number;
}

export default function EveningReview({ executionScore }: Props) {
  const [mood, setMood] = useState(0);
  const [wentWell, setWentWell] = useState("");
  const [improve, setImprove] = useState("");
  const [diaryImage, setDiaryImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiInsights, setAiInsights] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDiaryImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!mood || !wentWell || !improve) return;
    setSubmitting(true);
    try {
      const res = await submitEveningReview({
        execution_score: executionScore,
        went_well: wentWell,
        improve_tomorrow: improve,
        mood,
        diary_image_url: diaryImage,
      });
      setAiInsights(res.data.ai_insights || "Great review! Keep the discipline going tomorrow.");
      setSubmitted(true);
    } catch {
      setAiInsights("Great effort today! Keep the discipline going tomorrow. Every day of consistency builds your future.");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Review Saved</h2>
          <p className="text-slate-400 text-sm">Great work completing your evening review, Waqa!</p>
        </div>

        {aiInsights && (
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-amber-500/20">
            <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <Star size={14} /> AI Insights
            </h3>
            <p className="text-slate-300 text-sm">{aiInsights}</p>
          </div>
        )}

        <button
          onClick={() => { setSubmitted(false); setMood(0); setWentWell(""); setImprove(""); setAiInsights(""); }}
          className="w-full bg-slate-700 text-slate-300 py-3 rounded-xl text-sm hover:bg-slate-600 transition-colors"
        >
          Start New Review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Execution score display */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700 text-center">
        <p className="text-slate-400 text-sm mb-2">Today&apos;s Execution Score</p>
        <div className={`text-6xl font-bold ${executionScore >= 80 ? "text-green-400" : executionScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
          {executionScore}
        </div>
        <p className="text-slate-500 text-sm mt-1">out of 100</p>
      </div>

      {/* Mood selector */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">How was your day overall?</h3>
        <div className="flex justify-between gap-2">
          {MOOD_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setMood(option.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                mood === option.value
                  ? "bg-amber-500/20 border border-amber-500/50 scale-105"
                  : "bg-slate-800 border border-transparent hover:bg-slate-700"
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-xs text-slate-400">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* What went well */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">What went well today?</h3>
        <textarea
          value={wentWell}
          onChange={e => setWentWell(e.target.value)}
          rows={4}
          placeholder="Prayer was consistent, finished the coding task, family devotion done..."
          className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 border border-slate-600 focus:outline-none focus:border-amber-400 resize-none"
        />
      </div>

      {/* Improve tomorrow */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">What will I improve tomorrow?</h3>
        <textarea
          value={improve}
          onChange={e => setImprove(e.target.value)}
          rows={4}
          placeholder="Wake up 30 min earlier, drink more water, don't skip exercise..."
          className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 border border-slate-600 focus:outline-none focus:border-amber-400 resize-none"
        />
      </div>

      {/* Diary image upload */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Attach Diary Page (optional)</h3>
        {diaryImage ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={diaryImage} alt="Diary page" className="w-full rounded-xl max-h-40 object-cover" />
            <button
              onClick={() => setDiaryImage(null)}
              className="absolute top-2 right-2 bg-slate-800/80 text-slate-300 text-xs px-2 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-600 rounded-xl p-6 cursor-pointer hover:border-slate-500 transition-colors">
            <Upload size={18} className="text-slate-400" />
            <span className="text-slate-400 text-sm">Upload diary photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!mood || !wentWell || !improve || submitting}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
      >
        <Send size={18} />
        {submitting ? "Saving review..." : "Submit Evening Review"}
      </button>

      {(!mood || !wentWell || !improve) && (
        <p className="text-xs text-slate-500 text-center">
          Fill in mood, what went well, and improvement area to submit
        </p>
      )}
    </div>
  );
}
