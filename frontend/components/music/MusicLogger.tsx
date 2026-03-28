"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, Music, Trophy } from "lucide-react";
import { logMusic } from "@/lib/api";

const INSTRUMENTS = ["bass", "guitar", "keyboard", "vocals", "drums"];
const PRACTICE_TYPES = ["scales", "songs", "technique", "worship", "improvisation", "theory"];

export default function MusicLogger() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [instrument, setInstrument] = useState("bass");
  const [whatPracticed, setWhatPracticed] = useState<string[]>([]);
  const [milestone, setMilestone] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    try {
      const res = await logMusic({
        instrument,
        what_practiced: whatPracticed.join(", "),
        milestone: milestone || undefined,
      });
      setSessionId(res.data.id);
    } catch {
      setSessionId("mock-" + Date.now());
    }
    setElapsed(0);
    setIsRunning(true);
    setSaved(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setSaved(true);
  };

  const togglePracticeType = (type: string) => {
    setWhatPracticed(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-5">
      {/* Timer */}
      <div className="bg-[#1e293b] rounded-2xl p-8 text-center border border-slate-700">
        <div className="text-xl mb-2">🎸</div>
        <div className={`text-6xl font-mono font-bold mb-6 ${isRunning ? "text-purple-400 pulse-glow" : "text-white"}`}>
          {formatTime(elapsed)}
        </div>
        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`w-20 h-20 rounded-full text-white font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center mx-auto ${
            isRunning
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
              : "bg-purple-500 hover:bg-purple-600 shadow-purple-500/30"
          }`}
        >
          {isRunning ? <Square size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <p className="text-slate-400 text-sm mt-3">
          {isRunning ? "Practice in progress..." : saved ? "Session saved ✓" : "Start your practice session"}
        </p>
      </div>

      {/* Instrument */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Instrument</h3>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map(inst => (
            <button
              key={inst}
              onClick={() => !isRunning && setInstrument(inst)}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                instrument === inst
                  ? "bg-purple-500 text-white font-medium"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              } disabled:cursor-not-allowed`}
            >
              {inst}
            </button>
          ))}
        </div>
      </div>

      {/* What practiced */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">What I Practiced</h3>
        <div className="flex flex-wrap gap-2">
          {PRACTICE_TYPES.map(type => (
            <button
              key={type}
              onClick={() => togglePracticeType(type)}
              className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${
                whatPracticed.includes(type)
                  ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                  : "bg-slate-700 text-slate-400 border border-transparent hover:bg-slate-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Milestone */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" /> Milestone (optional)
        </h3>
        <input
          type="text"
          value={milestone}
          onChange={e => setMilestone(e.target.value)}
          placeholder="e.g. Learned Oceans intro riff..."
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 border border-slate-600 focus:outline-none focus:border-purple-400"
        />
      </div>

      {/* Notes */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Session Notes</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Any notes about today's practice..."
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 border border-slate-600 focus:outline-none focus:border-purple-400 resize-none"
        />
      </div>
    </div>
  );
}
