'use client';

import { DashboardMonthly } from'@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from'recharts';

interface MonthlyChartProps {
 monthly: DashboardMonthly[];
}

export default function MonthlyChart({ monthly }: MonthlyChartProps) {
 return (
 <div className="glass-card p-6 rounded-2xl">
 <h3 className="text-lg font-bold mb-1 text-slate-900">
 Aktivitas Melamar per Bulan
 </h3>
 <p className="text-xs text-slate-500 mb-6">
 Trend intensitas submit lamaran kerja
 </p>

 <div className="h-64 w-full">
 {monthly.length === 0 ? (
 <div className="flex items-center justify-center h-full text-slate-400 text-sm">
 Belum ada data aktivitas bulanan
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={monthly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
 <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis dataKey="month" stroke="#94a3b8" />
 <YAxis stroke="#94a3b8" allowDecimals={false} />
 <Tooltip
 contentStyle={{
 backgroundColor:'rgba(15, 23, 42, 0.9)',
 borderColor:'#334155',
 borderRadius:'12px',
 color:'#fff',
 }}
 />
 <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" />
 </AreaChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>
 );
}

