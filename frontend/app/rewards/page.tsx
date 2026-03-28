"use client";

import { useState } from "react";
import { Gift, Zap, CheckCircle, Clock, Lock, Camera } from "lucide-react";

export default function RewardsPage() {
  const [showPhotos, setShowPhotos] = useState(false);

  const rewards = [
    {
      tier: 1,
      name: "Weekly Wins",
      icon: "🎉",
      eligible: true,
      reward: "🍔 McDonald's / Nice restaurant with kids",
      budget: "$30 FJD",
      progress: 71,
      trigger: "6/7 days consistency (71%+)",
      next_eligible_in: "1 day",
      status: "earned",
    },
    {
      tier: 2,
      name: "Monthly Excellence",
      icon: "🍽️",
      eligible: true,
      reward: "Upscale restaurant dinner with family",
      budget: "$120 FJD",
      progress: 74,
      trigger: "90%+ month consistency + 2 skill level-ups",
      next_eligible_in: "4 days",
      status: "in_progress",
    },
    {
      tier: 3,
      name: "Phase Milestone",
      icon: "🏖️",
      eligible: false,
      reward: "Beach day / Full day picnic with kids",
      budget: "$400 FJD",
      progress: 72,
      trigger: "80% of phase milestones complete",
      next_eligible_in: "8 months",
      status: "locked",
    },
    {
      tier: 4,
      name: "Skill Mastery",
      icon: "✈️",
      eligible: false,
      reward: "Family vacation (1-2 weeks international)",
      budget: "$3000+ FJD",
      progress: 50,
      trigger: "Reach Level 10 in any skill tree",
      next_eligible_in: "3 years",
      status: "locked",
    },
  ];

  const history = [
    { date: "2026-03-22", tier: 1, reward: "McDonald's with kids", status: "claimed", photo: true },
    { date: "2026-03-15", tier: 1, reward: "Ice cream outing", status: "claimed", photo: true },
    { date: "2026-03-08", tier: 1, reward: "Restaurant night", status: "claimed", photo: true },
    { date: "2026-02-28", tier: 2, reward: "Upscale dinner", status: "claimed", photo: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gift size={20} className="text-red-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Reward Tracker</h1>
          <p className="text-slate-400 text-sm">Family celebration rewards aligned with your XP milestones</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Monthly Budget</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Total Budget</span>
            <span className="font-bold text-white">$300 FJD</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Spent This Month</span>
            <span className="font-bold text-orange-400">$180 FJD</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Remaining</span>
            <span className="font-bold text-green-400">$120 FJD</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-2">
            <div className="bg-orange-500 h-full" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="space-y-4">
        {rewards.map((tier) => (
          <div key={tier.tier} className={`rounded-2xl p-5 border ${tier.eligible ? 'bg-[#1e293b] border-slate-700' : 'bg-[#0f1117] border-slate-700/50'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{tier.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{tier.name}</h3>
                    {tier.eligible && <CheckCircle size={16} className="text-green-400" />}
                    {!tier.eligible && tier.status === "locked" && <Lock size={16} className="text-slate-500" />}
                  </div>
                  <p className="text-sm text-slate-400">{tier.reward}</p>
                  <p className="text-xs text-slate-600 mt-1">Budget: {tier.budget}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-bold ${
                tier.eligible ? 'bg-green-500/20 text-green-300' :
                tier.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-slate-600 text-slate-400'
              }`}>
                {tier.status === 'earned' && '🎉 Earned'}
                {tier.status === 'in_progress' && '⏳ In Progress'}
                {tier.status === 'locked' && '🔒 Locked'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">{tier.trigger}</span>
                  <span className="font-bold" style={{ color: tier.progress >= 80 ? '#10b981' : '#f59e0b' }}>
                    {tier.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${tier.progress >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${tier.progress}%` }}
                  />
                </div>
              </div>

              {tier.eligible && (
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors text-sm">
                  ✓ Claim Reward
                </button>
              )}
              {!tier.eligible && (
                <p className="text-xs text-slate-500 text-center py-2">Next eligible in {tier.next_eligible_in}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reward History */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm">Recent Rewards</h3>
          <button
            onClick={() => setShowPhotos(!showPhotos)}
            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors"
          >
            <Camera size={14} />
            Photos
          </button>
        </div>

        <div className="space-y-2">
          {history.map((item, idx) => (
            <div key={idx} className="bg-[#0f1117] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-2 h-2 rounded-full ${item.tier === 1 ? 'bg-blue-400' : item.tier === 2 ? 'bg-purple-400' : 'bg-yellow-400'}`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-300">{item.reward}</p>
                  <p className="text-xs text-slate-600">Tier {item.tier}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.photo && <Camera size={14} className="text-slate-600" />}
                <span className="text-xs text-slate-500">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Celebration Gallery (if showing photos) */}
      {showPhotos && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <h3 className="font-bold text-white text-sm mb-4">Celebration Moments</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
                <Camera size={24} className="text-slate-600" />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 text-center mt-3">Upload family celebration photos here!</p>
        </div>
      )}
    </div>
  );
}
