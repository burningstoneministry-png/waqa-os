"use client";

import { useState, useEffect } from "react";
import { Youtube, TrendingUp, Eye, ThumbsUp, Users, ExternalLink, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function YouTubePage() {
  const [stats, setStats] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePlaylist, setActivePlaylist] = useState<"all" | "spiritual" | "worship">("all");

  useEffect(() => {
    Promise.all([
      api.get("/api/youtube/stats").catch(() => null),
      api.get("/api/youtube/videos").catch(() => null),
      api.get("/api/youtube/milestones").catch(() => null),
    ]).then(([statsRes, videosRes, msRes]) => {
      if (statsRes) setStats(statsRes.data);
      if (videosRes) setVideos(videosRes.data.videos || []);
      if (msRes) setMilestones(msRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const channel  = stats?.channel  || { subscribers: 62, total_views: 3241, total_videos: 15, live: false };
  const growth   = stats?.growth   || { weekly_history: [], milestones: [] };
  const playlists = stats?.playlists || {};

  const filteredVideos = videos.filter(v =>
    activePlaylist === "all" ? true :
    activePlaylist === "spiritual" ? v.playlist === "Spiritual Engineering" :
    v.playlist === "Worship Music"
  );

  const weeklyData = growth.weekly_history || [
    { week: "Week 1", subs: 55 },
    { week: "Week 2", subs: 58 },
    { week: "Week 3", subs: 60 },
    { week: "Week 4", subs: 62 },
  ];

  const nextMilestone = (milestones?.milestones || growth.milestones || [])
    .find((m: any) => !m.reached);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Youtube size={20} className="text-red-400" />
        <div>
          <h1 className="text-xl font-bold text-white">YouTube Analytics</h1>
          <p className="text-slate-400 text-sm">Waqa's Channel — Worship + Spiritual Engineering</p>
        </div>
        {!channel.live && (
          <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded flex items-center gap-1">
            <AlertCircle size={12} /> Mock Data
          </span>
        )}
        {channel.live && (
          <span className="ml-auto text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
            🔴 Live
          </span>
        )}
      </div>

      {/* API Key Notice */}
      {!channel.live && (
        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4">
          <p className="text-yellow-300 text-sm font-bold mb-1">⚡ Connect Live YouTube Data</p>
          <p className="text-yellow-200/70 text-xs">Add <code className="bg-yellow-900/40 px-1 rounded">YOUTUBE_API_KEY</code> and <code className="bg-yellow-900/40 px-1 rounded">YOUTUBE_CHANNEL_ID</code> to your Render environment variables to see real-time stats.</p>
        </div>
      )}

      {/* Channel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 text-center">
          <Users size={16} className="text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{channel.subscribers?.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Subscribers</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 text-center">
          <Eye size={16} className="text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{channel.total_views?.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total Views</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 text-center">
          <Youtube size={16} className="text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{channel.total_videos}</p>
          <p className="text-xs text-slate-400 mt-1">Videos</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700 text-center">
          <TrendingUp size={16} className="text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">+{growth.estimated_weekly_growth || 5}</p>
          <p className="text-xs text-slate-400 mt-1">Est. Weekly</p>
        </div>
      </div>

      {/* Playlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm">🎵 Worship Music</h3>
            <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded">Maintenance</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{playlists?.worship_music?.videos || 15}</p>
          <p className="text-xs text-slate-400 mt-1">Videos</p>
          <p className="text-xs text-slate-500 mt-2">{playlists?.worship_music?.status || "1-2 videos/month"}</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-5 border border-purple-700/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm">⚙️ Spiritual Engineering</h3>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-purple-400">{playlists?.spiritual_engineering?.videos || 8}</p>
            <p className="text-sm text-slate-500">/ {playlists?.spiritual_engineering?.target || 20} (Phase 1)</p>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: `${((playlists?.spiritual_engineering?.videos || 8) / (playlists?.spiritual_engineering?.target || 20)) * 100}%` }} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{playlists?.spiritual_engineering?.status || "1 video/week"}</p>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Subscriber Growth</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line type="monotone" dataKey="subs" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa" }} name="Subscribers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Progress */}
      {nextMilestone && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          <h3 className="font-bold text-white mb-4 text-sm">Next Milestone</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">{nextMilestone.label}</span>
            <span className="text-blue-400 font-bold">{nextMilestone.remaining?.toLocaleString()} to go</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${Math.min(100, ((channel.subscribers || 62) / nextMilestone.target) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{channel.subscribers?.toLocaleString()} current</span>
            <span>{nextMilestone.target?.toLocaleString()} target</span>
          </div>
        </div>
      )}

      {/* Phase Targets */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <h3 className="font-bold text-white mb-4 text-sm">Roadmap Targets</h3>
        <div className="space-y-3">
          {[
            { phase: "Phase 1 (Age 36-40)", target: 10000, icon: "🎯" },
            { phase: "Phase 2 (Age 41-45)", target: 100000, icon: "📈" },
            { phase: "Phase 3 (Age 46-50)", target: 500000, icon: "🚀" },
            { phase: "Phase 4 (Age 51-55)", target: 1000000, icon: "🌍" },
          ].map((item, i) => {
            const current = channel.subscribers || 62;
            const pct = Math.min(100, (current / item.target) * 100);
            const reached = current >= item.target;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{item.icon} {item.phase}</span>
                  <span className={reached ? "text-green-400 font-bold" : "text-slate-400"}>
                    {reached ? "✓ Reached" : `${item.target.toLocaleString()}`}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all ${reached ? 'bg-green-500' : 'bg-purple-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Videos */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm">Recent Videos</h3>
          <div className="flex gap-1">
            {["all","spiritual","worship"].map(p => (
              <button
                key={p}
                onClick={() => setActivePlaylist(p as any)}
                className={`text-xs px-2 py-1 rounded transition-colors capitalize ${activePlaylist === p ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {p === "all" ? "All" : p === "spiritual" ? "Spiritual Eng." : "Worship"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filteredVideos.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">No videos to display</p>
          )}
          {filteredVideos.map((video, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#0f1117] rounded-lg p-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${video.playlist === "Spiritual Engineering" ? "bg-purple-400" : "bg-blue-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">{video.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Eye size={11} />{video.views?.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={11} />{video.likes?.toLocaleString()}</span>
                  <span>{video.published_at}</span>
                </div>
              </div>
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
