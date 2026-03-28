"use client";

import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { PieSlice } from "@/lib/types";
import { PieChart as PieIcon, BarChart2 } from "lucide-react";

interface Props {
  data: PieSlice[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PieSlice }[];
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const pct = ((item.minutes / 1440) * 100).toFixed(1);
    return (
      <div className="bg-[#131625] border border-white/10 rounded-xl p-3 text-sm shadow-2xl">
        <p className="font-semibold text-white flex items-center gap-2">
          <span>{item.icon}</span>
          <span>{item.category}</span>
        </p>
        <p className="text-slate-400 mt-1 text-xs">
          {item.minutes} min · {pct}% of day
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {Math.floor(item.minutes / 60)}h {item.minutes % 60}m
        </p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const CustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="rgba(255,255,255,0.85)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight="700"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DailyPieChart({ data }: Props) {
  const [view, setView] = useState<"pie" | "bar">("pie");

  const sorted = [...data].sort((a, b) => b.minutes - a.minutes);
  const totalTracked = data.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">24-Hour Breakdown</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {totalTracked} of 1440 min tracked
          </p>
        </div>
        <div className="flex gap-1 bg-[#131625] border border-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setView("pie")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              view === "pie"
                ? "bg-[#4f8ef7] text-white shadow"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <PieIcon size={12} />
            Pie
          </button>
          <button
            onClick={() => setView("bar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              view === "bar"
                ? "bg-[#4f8ef7] text-white shadow"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <BarChart2 size={12} />
            Bar
          </button>
        </div>
      </div>

      {view === "pie" ? (
        <div className="flex flex-col gap-4">
          {/* Pie chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={36}
                  dataKey="minutes"
                  nameKey="category"
                  labelLine={false}
                  label={CustomLabel}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      stroke="#1a1d2e"
                      strokeWidth={1.5}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-44 overflow-y-auto pr-1">
            {sorted.map((item) => (
              <div key={item.category} className="flex items-center gap-2 group">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] text-slate-400 truncate flex-1">{item.category}</span>
                <span className="text-[10px] text-slate-600 font-mono">
                  {((item.minutes / 1440) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ left: 85, right: 20, top: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="rgba(255,255,255,0.1)"
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={82}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value} min (${((value / 1440) * 100).toFixed(1)}%)`,
                  "Duration",
                ]}
                contentStyle={{
                  backgroundColor: "#131625",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
                itemStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
                {sorted.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
