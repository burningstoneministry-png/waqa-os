"use client";

import { BookOpen } from "lucide-react";
import DiaryCamera from "@/components/diary/DiaryCamera";

export default function DiaryPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen size={20} className="text-amber-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Diary &amp; OCR</h1>
          <p className="text-slate-400 text-sm">Photograph your handwritten diary and extract tasks</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-sm text-amber-200">
          <strong>How it works:</strong> Take a photo of your handwritten diary page → OCR extracts the text →
          AI summarizes and detects tasks → Push tasks to Google Calendar automatically.
        </p>
      </div>

      <DiaryCamera />

      {/* Recent entries placeholder */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Diary Entries</h3>
        <div className="space-y-3">
          {[
            { date: "Thu 27 Mar", summary: "Prayer, coding sprint on Claude-Fire, bass practice goal", tags: ["prayer", "coding", "music"] },
            { date: "Wed 26 Mar", summary: "Family devotion Psalm 23, research session, evening review submitted", tags: ["family", "research"] },
            { date: "Tue 25 Mar", summary: "Church service notes, exercise completed, WakaTime 4h", tags: ["church", "health", "coding"] },
          ].map((entry, i) => (
            <div key={i} className="bg-slate-800/60 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300">{entry.date}</span>
              </div>
              <p className="text-sm text-slate-400">{entry.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full capitalize">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
