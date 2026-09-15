'use client';

import { Application } from'@/types';
import Link from'next/link';
import { AlertCircle, Calendar, ArrowRight, Building2 } from'lucide-react';

interface FollowUpRemindersProps {
 followUps: Application[];
}

export default function FollowUpReminders({ followUps }: FollowUpRemindersProps) {
 if (!followUps || followUps.length === 0) {
 return (
 <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
 <div className="flex items-center space-x-3 text-emerald-600">
 <AlertCircle className="w-5 h-5" />
 <h3 className="font-medium text-sm">Tidak ada jadwal follow-up mendesak</h3>
 </div>
 <p className="text-xs text-slate-500 mt-1">
 Semua lamaran kerja Anda dalam status terkontrol.
 </p>
 </div>
 );
 }

 return (
 <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center space-x-2 text-amber-600">
 <AlertCircle className="w-5 h-5 animate-pulse" />
 <h3 className="font-medium text-base">Pengingat Follow-up ({followUps.length})</h3>
 </div>
 <span className="text-xs text-amber-600 font-medium">
 Mendekati / Jatuh Tempo
 </span>
 </div>

 <div className="space-y-3">
 {followUps.map((app) => {
 const dateStr = app.nextFollowUp
 ? new Date(app.nextFollowUp).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'})
 :'-';
 const isOverdue = app.nextFollowUp ? new Date(app.nextFollowUp) < new Date() : false;

 return (
 <div
 key={app.id}
 className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400/50 transition-all gap-3"
 >
 <div className="flex items-start space-x-3">
 <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 mt-0.5">
 <Building2 className="w-4 h-4" />
 </div>
 <div>
 <h4 className="font-medium text-sm text-slate-900">
 {app.position}
 </h4>
 <p className="text-xs text-slate-500">
 {app.company?.name ||'Perusahaan Target'}
 </p>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end space-x-4">
 <div className="flex items-center space-x-1.5 text-xs font-medium">
 <Calendar className="w-3.5 h-3.5 text-slate-400" />
 <span className={isOverdue ?'text-rose-600 font-medium':'text-slate-600'}>
 {dateStr} {isOverdue &&'(Lewat)'}
 </span>
 </div>

 <Link
 href={`/applications/${app.id}`}
 className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:underline"
 >
 <span>Detail</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

