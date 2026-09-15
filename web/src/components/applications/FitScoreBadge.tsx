'use client';

import { useState } from'react';
import { Target, Info } from'lucide-react';

interface FitScoreBadgeProps {
 score?: number | null;
 notes?: string | null;
}

export default function FitScoreBadge({ score, notes }: FitScoreBadgeProps) {
 const [showNotes, setShowNotes] = useState(false);

 if (score === undefined || score === null) {
 return <span className="text-xs text-slate-400 italic">Belum dinilai</span>;
 }

 let colorClasses ='bg-rose-500/10 text-rose-600 border-rose-500/20';
 if (score > 40 && score <= 70) {
 colorClasses ='bg-amber-500/10 text-amber-600 border-amber-500/20';
 } else if (score > 70) {
 colorClasses ='bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
 }

 return (
 <div className="relative inline-block">
 <button
 onClick={() => notes && setShowNotes(!showNotes)}
 type="button"
 className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-transform hover:scale-105 ${colorClasses}`}
 >
 <Target className="w-3.5 h-3.5" />
 <span>Fit Score: {score}%</span>
 {notes && <Info className="w-3 h-3 opacity-70" />}
 </button>

 {showNotes && notes && (
 <div className="absolute z-20 left-0 top-8 w-64 p-3 rounded-xl glass-card border border-slate-700 shadow-xl text-xs text-slate-200">
 <div className="font-medium text-slate-100 mb-1 flex items-center justify-between">
 <span>Catatan Kecocokan</span>
 <button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-white">
 ✕
 </button>
 </div>
 <p className="text-slate-300 leading-relaxed">{notes}</p>
 </div>
 )}
 </div>
 );
}

