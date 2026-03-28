"use client";

import { Star, Clock } from "lucide-react";
import EveningReview from "@/components/review/EveningReview";

export default function ReviewPage() {
  const now = new Date();
  const isReviewTime = now.getHours() >= 21;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Star size={20} className="text-amber-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Evening Review</h1>
          <p className="text-slate-400 text-sm">Daily reflection — recommended at 9:30 PM</p>
        </div>
      </div>

      {!isReviewTime && (
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <Clock size={16} className="text-blue-400" />
          <p className="text-sm text-blue-200">
            Evening review is best done at 9:30 PM — but you can complete it anytime.
          </p>
        </div>
      )}

      <EveningReview executionScore={74} />

      {/* Past reviews */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Past Reviews</h3>
        <div className="space-y-3">
          {[
            { date: "Wed 26 Mar", score: 81, mood: "😊", went_well: "Prayer streak maintained, finished research chapter", improve: "Sleep earlier, more water" },
            { date: "Tue 25 Mar", score: 68, mood: "😐", went_well: "Church service great, kids devotion done", improve: "Exercise skipped — must be consistent" },
            { date: "Mon 24 Mar", score: 76, mood: "😊", went_well: "Deep work session 4h, bass practice done", improve: "Family time was short" },
          ].map((review, i) => (
            <div key={i} className="bg-slate-800/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">{review.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{review.mood}</span>
                  <span className={`text-sm font-bold ${review.score >= 80 ? "text-green-400" : review.score >= 65 ? "text-amber-400" : "text-red-400"}`}>
                    {review.score}/100
                  </span>
                </div>
              </div>
              <p className="text-xs text-green-400 mb-1">✓ {review.went_well}</p>
              <p className="text-xs text-amber-400">↑ {review.improve}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
