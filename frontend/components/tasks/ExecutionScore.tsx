"use client";

interface Props {
  score: number;
  breakdown: {
    on_time_tasks: number;
    partial_tasks: number;
    skipped_tasks: number;
    pending_tasks: number;
    total_tasks: number;
  };
  categoryScores?: { category: string; score: number; color: string }[];
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size / 2) - 10;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 1.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">{grade}</span>
      </div>
    </div>
  );
}

export default function ExecutionScore({ score, breakdown, categoryScores }: Props) {
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
      <h2 className="font-bold text-white text-base mb-4">Execution Score</h2>

      <div className="flex items-center gap-6 mb-5">
        <ScoreRing score={score} />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">On-time tasks</span>
            <span className="text-green-400 font-medium">{breakdown.on_time_tasks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Partial tasks</span>
            <span className="text-amber-400 font-medium">{breakdown.partial_tasks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Skipped</span>
            <span className="text-red-400 font-medium">{breakdown.skipped_tasks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pending</span>
            <span className="text-slate-300 font-medium">{breakdown.pending_tasks}</span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryScores && categoryScores.length > 0 && (
        <div className="space-y-2 border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">By Category</p>
          {categoryScores.map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-20">{cat.category}</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right" style={{ color: cat.color }}>{cat.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
