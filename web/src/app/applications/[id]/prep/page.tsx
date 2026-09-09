'use client';

import { useEffect, useState } from'react';
import { useParams } from'next/navigation';
import { apiClient } from'@/lib/api-client';
import { Application } from'@/types';
import Link from'next/link';
import { ArrowLeft, CheckSquare, Square, BookOpen, Building2, Briefcase, FileText, CheckCircle2 } from'lucide-react';

interface ChecklistItem {
 id: string;
 title: string;
 category: string;
 completed: boolean;
}

export default function ApplicationPrepPage() {
 const params = useParams();
 const id = params.id as string;

 const [application, setApplication] = useState<Application | null>(null);
 const [loading, setLoading] = useState(true);

 const [checklist, setChecklist] = useState<ChecklistItem[]>([
 { id:'1', category:'Riset Perusahaan', title:'Pelajari visi, misi, dan produk utama perusahaan', completed: false },
 { id:'2', category:'Riset Perusahaan', title:'Cek kultur kerja & review Glassdoor / LinkedIn perusahaan', completed: false },
 { id:'3', category:'Riset Perusahaan', title:'Cari tahu berita/isu terkini seputar perusahaan & kompetitor', completed: false },
 { id:'4', category:'STAR Method Prep', title:'Siapkan 3 contoh proyek terbaik (Situation, Task, Action, Result)', completed: false },
 { id:'5', category:'STAR Method Prep', title:'Siapkan cerita menghadapi tantangan atau konflik teknis', completed: false },
 { id:'6', category:'Job Description Review', title:'Review kesesuaian skill Anda dengan Archived Job Description', completed: false },
 { id:'7', category:'Job Description Review', title:'Siapkan 3 pertanyaan strategis untuk ditanyakan di akhir interview', completed: false },
 { id:'8', category:'Persiapan Teknis', title:'Cek koneksi internet, mikrofon, & latar kamera jika online', completed: false },
 ]);

 useEffect(() => {
 async function loadData() {
 try {
 const data = await apiClient.get<Application>(`/applications/${id}`);
 setApplication(data);
 } catch (err) {
 console.error('Failed to load application', err);
 } finally {
 setLoading(false);
 }
 }
 if (id) loadData();
 }, [id]);

 const toggleCheck = (itemId: string) => {
 setChecklist((prev) =>
 prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
 );
 };

 const completedCount = checklist.filter((c) => c.completed).length;
 const progressPercent = Math.round((completedCount / checklist.length) * 100);

 if (loading || !application) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex items-center space-x-3">
 <Link href={`/applications/${id}`} className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div>
 <h1 className="text-2xl font-bold text-slate-900">Persiapan Interview (Prep Checklist)</h1>
 <p className="text-xs text-slate-500">
 {application.position} di {application.company?.name}
 </p>
 </div>
 </div>

 {/* Progress Bar Card */}
 <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center space-x-2">
 <BookOpen className="w-5 h-5 text-indigo-500" />
 <h3 className="font-bold text-base text-slate-900">Progres Kesiapan Interview</h3>
 </div>
 <span className="text-sm font-extrabold text-indigo-600">
 {completedCount} / {checklist.length} ({progressPercent}%)
 </span>
 </div>
 <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
 style={{ width: `${progressPercent}%` }}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Checklist Items */}
 <div className="lg:col-span-2 space-y-4">
 {['Riset Perusahaan','STAR Method Prep','Job Description Review','Persiapan Teknis'].map((cat) => {
 const items = checklist.filter((c) => c.category === cat);
 return (
 <div key={cat} className="glass-card p-5 rounded-2xl space-y-3">
 <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-500 flex items-center space-x-2">
 <CheckCircle2 className="w-4 h-4" />
 <span>{cat}</span>
 </h4>
 <div className="space-y-2">
 {items.map((item) => (
 <button
 key={item.id}
 onClick={() => toggleCheck(item.id)}
 className={`w-full flex items-start space-x-3 p-3 rounded-xl text-left text-xs transition-all border ${
 item.completed
 ?'bg-emerald-500/5 border-emerald-500/20 text-slate-400 line-through'
 :'bg-white border-slate-200 text-slate-800 hover:border-indigo-500/40'
 }`}
 >
 {item.completed ? (
 <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
 ) : (
 <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
 )}
 <span className="leading-relaxed font-medium">{item.title}</span>
 </button>
 ))}
 </div>
 </div>
 );
 })}
 </div>

 {/* Sidebar Snapshot JD */}
 <div className="space-y-4">
 <div className="glass-card p-5 rounded-2xl space-y-3">
 <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
 <FileText className="w-4 h-4 text-purple-500" />
 <span>Job Description Snapshot</span>
 </h3>
 <p className="text-[11px] text-slate-400">
 Gunakan ringkasan persyaratan ini untuk menyesuaikan jawaban interview Anda.
 </p>
 <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono">
 {application.archivedJobDescription ||'Tidak ada snapshot lowongan.'}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
