'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ContentItem } from '@/types';
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DashboardStats {
  statusStats: { IDEA: number; DRAFT: number; READY: number; PUBLISHED: number };
  weeklyStreak: number;
  totalReach: number;
  totalLikes: number;
  completionRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, contentsData] = await Promise.all([
          apiClient.get<DashboardStats>('/content/dashboard-stats'),
          apiClient.get<ContentItem[]>('/content'),
        ]);
        setStats(statsData);
        setContents(contentsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Data untuk chart (5 konten terakhir yg di-publish)
  const chartData = contents
    .filter((c) => c.status === 'PUBLISHED')
    .sort((a, b) => new Date(a.publishedDate || a.createdAt).getTime() - new Date(b.publishedDate || b.createdAt).getTime())
    .slice(-5)
    .map(c => ({
      name: c.title.substring(0, 15) + '...',
      Reach: c.metricsReach || 0,
      Likes: c.metricsLikes || 0,
      Comments: c.metricsComments || 0,
      Shares: c.metricsShares || 0,
    }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/content"
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl leading-tight font-semibold text-ink">Dashboard Konten</h1>
          <p className="text-[13px] text-ink-secondary mt-1">Ringkasan produktivitas dan performa konten Anda</p>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-card p-5 rounded-2xl border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Weekly Streak</span>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.weeklyStreak} <span className="text-lg font-medium text-slate-500">minggu</span></div>
            <p className="text-xs text-slate-500 mt-1">Konsisten publish tiap minggu</p>
          </div>
          {stats.weeklyStreak > 0 && (
            <div className="absolute -bottom-4 -right-4 opacity-5">
              <Flame className="w-32 h-32 text-orange-500" />
            </div>
          )}
        </div>

        {/* Completion */}
        <div className="glass-card p-5 rounded-2xl border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completion Rate</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.completionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Ide menjadi karya</p>
          </div>
        </div>

        {/* Reach */}
        <div className="glass-card p-5 rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Reach</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalReach.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Akumulasi audiens</p>
          </div>
        </div>

        {/* Status Count */}
        <div className="glass-card p-5 rounded-2xl border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Ide</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.statusStats.IDEA}</div>
            <p className="text-xs text-slate-500 mt-1">Ide menanti dieksekusi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
            Performa 5 Konten Terakhir
          </h3>
          {chartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Reach" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Likes" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Comments" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex items-center justify-center text-slate-400 text-sm">
              Belum ada data performa dari konten yang di-publish.
            </div>
          )}
        </div>

        {/* Pipeline Summary */}
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <LayoutGrid className="w-4 h-4 mr-2 text-indigo-500" />
            Status Pipeline
          </h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-sm font-medium text-slate-700">Idea</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{stats.statusStats.IDEA}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm font-medium text-slate-700">Draft</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{stats.statusStats.DRAFT}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-slate-700">Siap Publish</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{stats.statusStats.READY}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-800">Published</span>
              </div>
              <span className="text-sm font-bold text-emerald-900">{stats.statusStats.PUBLISHED}</span>
            </div>
          </div>
          <Link href="/content" className="mt-6 w-full text-center py-2.5 rounded-full bg-ink hover:bg-ink/80 text-white font-medium text-[15px] transition-colors block">
            Lihat Board Kanban
          </Link>
        </div>
      </div>
    </div>
  );
}
