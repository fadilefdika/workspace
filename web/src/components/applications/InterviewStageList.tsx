'use client';

import { useState } from'react';
import { InterviewStage, StageOutcome } from'@/types';
import { apiClient } from'@/lib/api-client';
import { Calendar, Plus, CheckCircle, XCircle, Clock, MessageSquare, Save } from'lucide-react';

interface InterviewStageListProps {
 applicationId: string;
 stages: InterviewStage[];
 onRefresh: () => void;
}

export default function InterviewStageList({ applicationId, stages, onRefresh }: InterviewStageListProps) {
 const [showAddForm, setShowAddForm] = useState(false);
 const [newStageName, setNewStageName] = useState('');
 const [newScheduledAt, setNewScheduledAt] = useState('');
 const [loading, setLoading] = useState(false);

 const [editingStageId, setEditingStageId] = useState<string | null>(null);
 const [editOutcome, setEditOutcome] = useState<StageOutcome>('PENDING');
 const [editFeedback, setEditFeedback] = useState('');

 const handleAddStage = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newStageName.trim()) return;

 setLoading(true);
 try {
 await apiClient.post(`/applications/${applicationId}/stages`, {
 stageName: newStageName,
 scheduledAt: newScheduledAt ? new Date(newScheduledAt).toISOString() : null,
 });
 setNewStageName('');
 setNewScheduledAt('');
 setShowAddForm(false);
 onRefresh();
 } catch (err) {
 console.error('Failed to add stage', err);
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateStage = async (stageId: string) => {
 setLoading(true);
 try {
 await apiClient.patch(`/applications/${applicationId}/stages/${stageId}`, {
 outcome: editOutcome,
 feedback: editFeedback,
 });
 setEditingStageId(null);
 onRefresh();
 } catch (err) {
 console.error('Failed to update stage', err);
 } finally {
 setLoading(false);
 }
 };

 const startEditing = (stage: InterviewStage) => {
 setEditingStageId(stage.id);
 setEditOutcome(stage.outcome);
 setEditFeedback(stage.feedback ||'');
 };

 return (
 <div className="glass-card p-6 rounded-2xl">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-lg font-medium text-slate-900">Tahapan Interview</h3>
 <p className="text-xs text-slate-500">
 Timeline dan catatan hasil tiap ronde wawancara
 </p>
 </div>
 <button
 onClick={() => setShowAddForm(!showAddForm)}
 className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Ronde</span>
 </button>
 </div>

 {showAddForm && (
 <form onSubmit={handleAddStage} className="p-4 rounded-xl bg-slate-100 mb-6 space-y-3 border border-slate-300">
 <h4 className="text-xs font-medium uppercase tracking-wider text-indigo-500">Tambah Ronde Baru</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-slate-600 mb-1">Nama Ronde</label>
 <input
 type="text"
 placeholder="mis. HR Screening, User Interview"
 value={newStageName}
 onChange={(e) => setNewStageName(e.target.value)}
 className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-600 mb-1">Jadwal (Opsional)</label>
 <input
 type="datetime-local"
 value={newScheduledAt}
 onChange={(e) => setNewScheduledAt(e.target.value)}
 className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>
 <div className="flex justify-end space-x-2 pt-1">
 <button
 type="button"
 onClick={() => setShowAddForm(false)}
 className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs"
 >
 Simpan
 </button>
 </div>
 </form>
 )}

 {stages.length === 0 ? (
 <p className="text-xs text-slate-400 italic text-center py-6">Belum ada tahap interview yang dicatat.</p>
 ) : (
 <div className="relative border-l-2 border-slate-300 ml-4 space-y-6">
 {stages.map((stage) => {
 const isEditing = editingStageId === stage.id;
 const scheduledStr = stage.scheduledAt
 ? new Date(stage.scheduledAt).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})
 :'Belum dijadwalkan';

 return (
 <div key={stage.id} className="relative pl-6">
 <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
 </div>

 <div className="p-4 rounded-xl glass-card border border-slate-200">
 <div className="flex items-center justify-between">
 <h4 className="font-medium text-sm text-slate-900">{stage.stageName}</h4>
 <div>
 {stage.outcome ==='PASSED'&& (
 <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
 <CheckCircle className="w-3.5 h-3.5" />
 <span>PASSED</span>
 </span>
 )}
 {stage.outcome ==='FAILED'&& (
 <span className="inline-flex items-center space-x-1 text-xs font-medium text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
 <XCircle className="w-3.5 h-3.5" />
 <span>FAILED</span>
 </span>
 )}
 {stage.outcome ==='PENDING'&& (
 <span className="inline-flex items-center space-x-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
 <Clock className="w-3.5 h-3.5" />
 <span>PENDING</span>
 </span>
 )}
 </div>
 </div>

 <div className="flex items-center space-x-2 text-xs text-slate-500 mt-2">
 <Calendar className="w-3.5 h-3.5" />
 <span>Jadwal: {scheduledStr}</span>
 </div>

 {isEditing ? (
 <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
 <div>
 <label className="block text-xs font-medium text-slate-400 mb-1">Hasil Outcome</label>
 <select
 value={editOutcome}
 onChange={(e) => setEditOutcome(e.target.value as StageOutcome)}
 className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white"
 >
 <option value="PENDING">PENDING</option>
 <option value="PASSED">PASSED</option>
 <option value="FAILED">FAILED</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-400 mb-1">Catatan / Feedback</label>
 <textarea
 rows={3}
 value={editFeedback}
 onChange={(e) => setEditFeedback(e.target.value)}
 placeholder="Feedback interview, pertanyaan teknis yang ditanyakan, dll"
 className="w-full p-2.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none"
 />
 </div>
 <div className="flex justify-end space-x-2">
 <button
 type="button"
 onClick={() => setEditingStageId(null)}
 className="px-3 py-1 rounded text-xs text-slate-400"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={() => handleUpdateStage(stage.id)}
 disabled={loading}
 className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
 >
 <Save className="w-3.5 h-3.5" />
 <span>Simpan Update</span>
 </button>
 </div>
 </div>
 ) : (
 <div className="mt-3 pt-3 border-t border-slate-200 flex items-start justify-between">
 <div className="flex items-start space-x-2 text-xs text-slate-600">
 <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
 <span>{stage.feedback ||'Belum ada catatan feedback.'}</span>
 </div>
 <button
 onClick={() => startEditing(stage)}
 className="text-xs text-indigo-500 hover:underline font-medium ml-2 flex-shrink-0"
 >
 Edit Ronde
 </button>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}

