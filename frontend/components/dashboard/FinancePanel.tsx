"use client";

import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

interface Props {
  westpacBalance: number;
  mpaisaBalance: number;
  todaySpending: number;
  savingsRate: number;
}

function formatKina(amount: number) {
  return `FJ$${amount.toLocaleString("en-FJ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function FinancePanel({
  westpacBalance,
  mpaisaBalance,
  todaySpending,
  savingsRate,
}: Props) {
  const totalBalance = westpacBalance + mpaisaBalance;

  const savingsColor =
    savingsRate >= 20 ? "#6ee7b7" : savingsRate >= 10 ? "#fbbf24" : "#f87171";
  const savingsBadgeClass =
    savingsRate >= 20 ? "badge badge-green" : savingsRate >= 10 ? "badge badge-amber" : "badge badge-red";

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-5 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <div className="icon-box icon-box-green">
          <DollarSign size={15} className="text-[#6ee7b7]" />
        </div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Finance <span className="text-slate-600 normal-case font-normal text-xs">(FJD)</span></h3>
      </div>

      {/* ── Two balance cards side by side ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Westpac */}
        <div className="stat-card stat-card-blue pl-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CreditCard size={11} className="text-[#4f8ef7]" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Westpac</p>
          </div>
          <p className="text-base font-bold text-white">{formatKina(westpacBalance)}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Main account</p>
        </div>

        {/* M-Paisa */}
        <div className="stat-card stat-card-amber pl-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Wallet size={11} className="text-[#fbbf24]" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">M-Paisa</p>
          </div>
          <p className="text-base font-bold text-white">{formatKina(mpaisaBalance)}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Mobile wallet</p>
        </div>
      </div>

      {/* ── Total balance ── */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Balance</p>
          <p className="text-xl font-bold text-white mt-0.5">{formatKina(totalBalance)}</p>
        </div>
        <div className="text-right">
          <span className="badge badge-green">FJD</span>
        </div>
      </div>

      {/* ── Today's spending + savings rate ── */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={12} className="text-[#f87171]" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Spent Today</p>
          </div>
          <p className="text-sm font-bold text-[#f87171]">{formatKina(todaySpending)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} style={{ color: savingsColor }} />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Savings Rate</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold" style={{ color: savingsColor }}>{savingsRate}%</p>
            <span className={savingsBadgeClass}>
              {savingsRate >= 20 ? "↑ Great" : savingsRate >= 10 ? "~ Fair" : "↓ Low"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Savings rate progress bar ── */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span className="text-slate-500">Monthly savings rate</span>
          <span className="text-slate-400 font-medium">Goal: 25%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (savingsRate / 25) * 100)}%`, backgroundColor: savingsColor }}
          />
        </div>
      </div>
    </div>
  );
}
