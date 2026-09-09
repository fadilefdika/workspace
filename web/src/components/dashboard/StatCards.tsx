'use client';

import { DashboardSummary } from '@/types';

interface StatCardsProps {
  summary: DashboardSummary | null;
}

export default function StatCards({ summary }: StatCardsProps) {
  const stats = [
    {
      title: 'Total Lamaran',
      value: summary?.totalApplied ?? 0,
      bgColor: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Sedang Proses',
      value: summary?.inProgress ?? 0,
      bgColor: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Penawaran (Offer)',
      value: summary?.offers ?? 0,
      bgColor: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Ditolak / Ghosted',
      value: summary?.rejected ?? 0,
      bgColor: 'bg-rose-500/10 text-rose-600',
    },
    {
      title: 'Response Rate',
      value: `${summary?.responseRate ?? 0}%`,
      bgColor: 'bg-purple-500/10 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        return (
          <div key={idx} className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="flex flex-col">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                {stat.title}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-extrabold text-slate-900">
                  {stat.value}
                </p>
                <div className={`px-2 py-1 rounded-md text-xs font-bold ${stat.bgColor}`}>
                  {stat.value !== 0 ? 'Aktif' : '-'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
