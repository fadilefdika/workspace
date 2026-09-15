'use client';

import { useState } from'react';
import { useRouter } from'next/navigation';
import { apiClient } from'@/lib/api-client';
import { Priority } from'@/types';
import { ArrowLeft, Save, Plus, X } from'lucide-react';
import Link from'next/link';

export default function NewCompanyPage() {
 const router = useRouter();
 const [submitting, setSubmitting] = useState(false);
 const [errorMsg, setErrorMsg] = useState('');

 const [formData, setFormData] = useState({
 name:'',
 industry:'',
 location:'',
 websiteUrl:'',
 careerPageUrl:'',
 priority:'MEDIUM'as Priority,
 researchNotes:'',
 });

 const [dealBreakerInput, setDealBreakerInput] = useState('');
 const [dealBreakers, setDealBreakers] = useState<string[]>([]);

 const handleAddTag = () => {
 if (!dealBreakerInput.trim()) return;
 if (!dealBreakers.includes(dealBreakerInput.trim())) {
 setDealBreakers([...dealBreakers, dealBreakerInput.trim()]);
 }
 setDealBreakerInput('');
 };

 const handleRemoveTag = (tag: string) => {
 setDealBreakers(dealBreakers.filter((t) => t !== tag));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.name.trim()) {
 setErrorMsg('Nama perusahaan wajib diisi');
 return;
 }

 setSubmitting(true);
 setErrorMsg('');

 try {
 await apiClient.post('/companies', {
 ...formData,
 dealBreakers,
 });
 router.push('/companies');
 } catch (err: any) {
 setErrorMsg(err.message ||'Gagal menyimpan perusahaan');
 } finally {
 setSubmitting(false);
 }
 };

 return (
 <div className="max-w-3xl mx-auto space-y-6">
 <div className="flex items-center space-x-3">
 <Link href="/companies" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div>
 <h1 className="text-2xl font-medium text-slate-900">Tambah Perusahaan Target</h1>
 <p className="text-xs text-slate-500">Tambahkan daftar perusahaan incaran baru</p>
 </div>
 </div>

 {errorMsg && (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
 {errorMsg}
 </div>
 )}

 <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
 {/* Name & Priority */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="sm:col-span-2">
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Nama Perusahaan *
 </label>
 <input
 type="text"
 placeholder="mis. Huawei, Chint Indonesia"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 required
 />
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Prioritas Target
 </label>
 <select
 value={formData.priority}
 onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 >
 <option value="HIGH">HIGH Priority</option>
 <option value="MEDIUM">MEDIUM Priority</option>
 <option value="LOW">LOW Priority</option>
 </select>
 </div>
 </div>

 {/* Industry & Location */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Industri / Bidang
 </label>
 <input
 type="text"
 placeholder="mis. Telecommunications, Electrical, IT"
 value={formData.industry}
 onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Kota / Lokasi Kantor
 </label>
 <input
 type="text"
 placeholder="mis. Jakarta, Morowali, Remote"
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 {/* Links */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Website Resmi
 </label>
 <input
 type="url"
 placeholder="https://..."
 value={formData.websiteUrl}
 onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Career Page Link
 </label>
 <input
 type="url"
 placeholder="https://company.com/careers"
 value={formData.careerPageUrl}
 onChange={(e) => setFormData({ ...formData, careerPageUrl: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 {/* Deal Breakers Tag Input */}
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Syarat Mutlak / Deal Breakers (Opsional)
 </label>
 <div className="flex gap-2 mb-2">
 <input
 type="text"
 placeholder="mis. butuh S2, wajib Mandarin native, WFO Morowali"
 value={dealBreakerInput}
 onChange={(e) => setDealBreakerInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==='Enter') {
 e.preventDefault();
 handleAddTag();
 }
 }}
 className="flex-1 px-4 py-2 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 <button
 type="button"
 onClick={handleAddTag}
 className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium text-xs"
 >
 + Tag
 </button>
 </div>
 {dealBreakers.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-2">
 {dealBreakers.map((tag) => (
 <span
 key={tag}
 className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20"
 >
 <span>{tag}</span>
 <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-rose-700 ml-1">
 <X className="w-3.5 h-3.5" />
 </button>
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Research Notes */}
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Catatan Riset Pribadi
 </label>
 <textarea
 rows={5}
 placeholder="Kultur kerja, benefit, review dari Glassdoor / LinkedIn, kontak karyawan internal..."
 value={formData.researchNotes}
 onChange={(e) => setFormData({ ...formData, researchNotes: e.target.value })}
 className="w-full p-4 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 {/* Submit */}
 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
 <Link
 href="/companies"
 className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 :bg-slate-800 transition-colors"
 >
 Batal
 </Link>
 <button
 type="submit"
 disabled={submitting}
 className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-lg shadow-indigo-500/25"
 >
 <Save className="w-4 h-4" />
 <span>{submitting ?'Menyimpan...':'Simpan Perusahaan'}</span>
 </button>
 </div>
 </form>
 </div>
 );
}

