'use client';

import { AlertTriangle } from'lucide-react';

interface DealBreakerTagsProps {
 dealBreakers?: string[];
}

export default function DealBreakerTags({ dealBreakers }: DealBreakerTagsProps) {
 if (!dealBreakers || dealBreakers.length === 0) {
 return <span className="text-xs text-slate-400 italic">Tidak ada syarat mutlak khusus</span>;
 }

 return (
 <div className="flex flex-wrap gap-2">
 {dealBreakers.map((tag, idx) => (
 <span
 key={idx}
 className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20"
 >
 <AlertTriangle className="w-3 h-3 text-rose-500" />
 <span>{tag}</span>
 </span>
 ))}
 </div>
 );
}

