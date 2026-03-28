"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getFinanceSummary, getFinanceTransactions } from "@/lib/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

function formatKina(amount: number) {
  return `FJ$${amount.toLocaleString("en-FJ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function FinancePage() {
  const [summary, setSummary] = useState({
    westpac_balance: 3240.50, mpaisa_balance: 85.00, total_balance: 3325.50, currency: "FJD",
    this_month: { income: 4800.00, expenses: 3920.00, savings: 880.00, savings_rate: 18.3 },
    today: { spending: 42.50, transactions: 3 },
    top_categories: [
      { category: "Food & Groceries", amount: 1200.00, color: "#92400e" },
      { category: "Transport", amount: 620.00, color: "#6b7280" },
      { category: "Church / Tithe", amount: 480.00, color: "#b91c1c" },
      { category: "Bills / Utilities", amount: 850.00, color: "#0891b2" },
      { category: "Entertainment", amount: 370.00, color: "#ec4899" },
    ],
  });

  const [transactions, setTransactions] = useState([
    { id: "1", date: new Date().toISOString().split("T")[0], source: "mpaisa", type: "expense", amount: 25.00, description: "BSP transfer", merchant: "BSP", category: "Transfer", currency: "FJD" },
    { id: "2", date: new Date().toISOString().split("T")[0], source: "cash", type: "expense", amount: 12.50, description: "Market", merchant: "Market", category: "Food", currency: "FJD" },
    { id: "3", date: new Date().toISOString().split("T")[0], source: "westpac", type: "expense", amount: 5.00, description: "Coffee", merchant: "CP Coffee", category: "Food", currency: "FJD" },
    { id: "4", date: new Date(Date.now() - 86400000).toISOString().split("T")[0], source: "westpac", type: "income", amount: 1200.00, description: "Freelance payment", merchant: "Client", category: "Income", currency: "FJD" },
  ] as { id: string; date: string; source: string; type: string; amount: number; description: string; merchant: string; category: string; currency: string }[]);

  useEffect(() => {
    getFinanceSummary().then(r => setSummary(r.data)).catch(() => {});
    getFinanceTransactions().then(r => setTransactions(r.data.transactions)).catch(() => {});
  }, []);

  const monthlyData = [
    { month: "Jan", income: 4200, expenses: 3800 },
    { month: "Feb", income: 4500, expenses: 4100 },
    { month: "Mar", income: 4800, expenses: 3920 },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign size={20} className="text-green-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Finance</h1>
          <p className="text-slate-400 text-sm">Fiji Kina (FJD) · FJ$ symbol</p>
        </div>
      </div>

      {/* Total balance */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-400 mb-2">Total Balance</p>
        <p className="text-5xl font-bold text-white">{formatKina(summary.total_balance)}</p>
        <p className="text-sm text-slate-400 mt-2">Fiji Kina</p>
      </div>

      {/* Account breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-xs text-slate-400">Westpac</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatKina(summary.westpac_balance)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-xs text-slate-400">M-Paisa</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatKina(summary.mpaisa_balance)}</p>
        </div>
      </div>

      {/* This month */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4">March 2026</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-500/10 rounded-xl p-3">
            <ArrowUpRight size={16} className="text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">{formatKina(summary.this_month.income)}</p>
            <p className="text-xs text-slate-400">Income</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3">
            <ArrowDownRight size={16} className="text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-400">{formatKina(summary.this_month.expenses)}</p>
            <p className="text-xs text-slate-400">Expenses</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3">
            <TrendingUp size={16} className="text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-amber-400">{summary.this_month.savings_rate}%</p>
            <p className="text-xs text-slate-400">Saved</p>
          </div>
        </div>
      </div>

      {/* Spending pie chart */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4">Spending Categories</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.top_categories} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={70} innerRadius={30}>
                  {summary.top_categories.map((cat, i) => <Cell key={i} fill={cat.color} stroke="#1e293b" strokeWidth={2} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [formatKina(v), ""]} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 w-full">
            {summary.top_categories.map(cat => (
              <div key={cat.category} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 flex-1 text-xs">{cat.category}</span>
                <span className="text-slate-300 font-medium text-xs">{formatKina(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income vs expenses bar chart */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4">Monthly Overview</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `K${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatKina(v), ""]} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h2 className="font-bold text-white text-base mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${tx.type === "income" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                {tx.type === "income" ? "💰" : tx.source === "mpaisa" ? "📱" : "💳"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{tx.description}</p>
                <p className="text-xs text-slate-400 capitalize">{tx.source} · {tx.category}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatKina(tx.amount)}
                </p>
                <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString("en-FJ", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
