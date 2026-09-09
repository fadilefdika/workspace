'use client';

import { DashboardFunnel } from'@/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from'recharts';

interface FunnelChartProps {
 funnel: DashboardFunnel | null;
}

export default function FunnelChart({ funnel }: FunnelChartProps) {
 const data = [
 { name:'Applied', count: funnel?.applied ?? 0, color:'#6366f1'},
 { name:'Screening', count: funnel?.screening ?? 0, color:'#f59e0b'},
 { name:'Interview', count: funnel?.interview ?? 0, color:'#ec4899'},
 { name:'Offer', count: funnel?.offer ?? 0, color:'#10b981'},
 { name:'Accepted', count: funnel?.accepted ?? 0, color:'#059669'},
 ];

 return (
 <div className="glass-card p-6 rounded-2xl">
 <h3 className="text-lg font-bold mb-1 text-slate-900">
 Funnel Tahapan Lamaran
 </h3>
 <p className="text-xs text-slate-500 mb-6">
 Progres konversi dari apply hingga penawaran kerja
 </p>

 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
 <XAxis type="number" stroke="#94a3b8" />
 <YAxis dataKey="name" type="category" stroke="#94a3b8" />
 <Tooltip
 contentStyle={{
 backgroundColor:'rgba(15, 23, 42, 0.9)',
 borderColor:'#334155',
 borderRadius:'12px',
 color:'#fff',
 }}
 />
 <Bar dataKey="count" radius={[0, 8, 8, 0]}>
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 );
}

