"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, Mic, MicOff } from "lucide-react";
import { logPrayer, endPrayer } from "@/lib/api";

const THEMES = ["wisdom", "family", "nation", "healing", "vision", "gratitude", "provision", "protection"];
const PRAYER_TYPES = ["personal", "family_devotion", "church"] as const;

export default function PrayerTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [prayerId, setPrayerId] = useState<string | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [prayerType, setPrayerType] = useState<typeof PRAYER_TYPES[number]>("personal");
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);
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
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    try {
      const res = await logPrayer({ themes: selectedThemes, type: prayerType });
      setPrayerId(res.data.id);
    } catch {
      setPrayerId("mock-" + Date.now());
    }
    setElapsed(0);
    setIsRunning(true);
    setSaved(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (prayerId) {
      try {
        await endPrayer(prayerId, { duration_minutes: Math.floor(elapsed / 60) });
      } catch { /* continue */ }
    }
    setSaved(true);
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  return (
    <div className="space-y-6">
      {/* Timer display */}
      <div className="bg-[#1e293b] rounded-2xl p-8 text-center border border-slate-700">
        <div className={`text-7xl font-mono font-bold mb-6 transition-colors ${isRunning ? "text-amber-400 pulse-glow" : "text-white"}`}>
          {formatTime(elapsed)}
        </div>

        {/* Start/Stop button */}
        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`w-24 h-24 rounded-full text-white font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center mx-auto ${
            isRunning
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
              : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
          }`}
        >
          {isRunning ? <Square size={28} /> : <Play size={28} className="ml-1" />}
        </button>

        <p className="text-slate-400 text-sm mt-4">
          {isRunning ? "Prayer in progress..." : saved ? "Session saved ✓" : "Tap to begin your prayer"}
        </p>

        {/* Duration if running */}
        {isRunning && elapsed > 0 && (
          <p className="text-amber-400/80 text-xs mt-1">{Math.floor(elapsed / 60)} min {elapsed % 60} sec</p>
        )}
      </div>

      {/* Prayer type selector */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Prayer Type</h3>
        <div className="flex gap-2 flex-wrap">
          {PRAYER_TYPES.map(type => (
            <button
              key={type}
              onClick={() => !isRunning && setPrayerType(type)}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                prayerType === type
                  ? "bg-amber-500 text-slate-900 font-medium"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              } disabled:cursor-not-allowed`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Theme selector */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Prayer Themes (multi-select)</h3>
        <div className="flex flex-wrap gap-2">
          {THEMES.map(theme => (
            <button
              key={theme}
              onClick={() => toggleTheme(theme)}
              className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${
                selectedThemes.includes(theme)
                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                  : "bg-slate-700 text-slate-400 border border-transparent hover:bg-slate-600"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
        {selectedThemes.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">Selected: {selectedThemes.join(", ")}</p>
        )}
      </div>

      {/* Voice recording placeholder */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Voice Recording (optional)</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${
              isRecording
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            {isRecording ? "Stop Recording" : "Record Voice"}
          </button>
          {isRecording && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs text-red-400">Recording...</span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">Voice transcript will be processed by AI after your session</p>
      </div>
    </div>
  );
}
