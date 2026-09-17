'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Company, ApplicationStatus } from '@/types';
import { ArrowLeft, Save, Plus, Check } from 'lucide-react';
import Link from 'next/link';

function NewApplicationForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const initialCompanyId = searchParams.get('companyId') || '';

 const [companies, setCompanies] = useState<Company[]>([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [errorMsg, setErrorMsg] = useState('');

 const [formData, setFormData] = useState({
 companyId: initialCompanyId,
 newCompanyName: '',
 position: '',
 appliedDate: new Date().toISOString().split('T')[0],
 source: 'LinkedIn',
 applicationLink: '',
 status: 'APPLIED' as ApplicationStatus,
 contactPerson: '',
 contactInfo: '',
 nextFollowUp: '',
 salaryRange: '',
 archivedJobDescription: '',
 fitScore: '' as string | number,
 fitNotes: '',
 notes: '',
 });

 const [companySearchQuery, setCompanySearchQuery] = useState('');
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 const [sourceSearchQuery, setSourceSearchQuery] = useState('LinkedIn');
 const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
 const sourceDropdownRef = useRef<HTMLDivElement>(null);
 const PREDEFINED_SOURCES = ['LinkedIn', 'Jobstreet', 'Glints', 'Website Perusahaan', 'Referral', 'Career Fair', 'Kalibrr', 'Tech in Asia'];

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsDropdownOpen(false);
 }
 if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
 setIsSourceDropdownOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 useEffect(() => {
 async function loadCompanies() {
 try {
 const data = await apiClient.get<Company[]>('/companies');
 setCompanies(data);
 if (initialCompanyId) {
 const comp = data.find(c => c.id === initialCompanyId);
 if (comp) setCompanySearchQuery(comp.name);
 } else if (data.length > 0) {
 setFormData((prev) => ({ ...prev, companyId: data[0].id }));
 setCompanySearchQuery(data[0].name);
 }
 } catch (err) {
 console.error('Failed to load companies', err);
 } finally {
 setLoading(false);
 }
 }
 loadCompanies();
 }, [initialCompanyId]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if ((!formData.companyId && !formData.newCompanyName) || !formData.position || !formData.appliedDate) {
 setErrorMsg('Perusahaan, posisi, dan tanggal apply wajib diisi');
 return;
 }

 setSubmitting(true);
 setErrorMsg('');

 try {
 await apiClient.post('/applications', {
 ...formData,
 fitScore: formData.fitScore !== '' ? Number(formData.fitScore) : null,
 nextFollowUp: formData.nextFollowUp ? new Date(formData.nextFollowUp).toISOString() : null,
 });
 router.push('/applications');
 } catch (err: any) {
 setErrorMsg(err.message || 'Gagal menyimpan lamaran');
 } finally {
 setSubmitting(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[40vh]">
 <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
 {errorMsg && (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
 {errorMsg}
 </div>
 )}

 {/* Company & Position */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Perusahaan Target *
 </label>
 <div className="relative" ref={dropdownRef}>
 <input
 type="text"
 value={companySearchQuery}
 onChange={(e) => {
 setCompanySearchQuery(e.target.value);
 setIsDropdownOpen(true);
 setFormData({ ...formData, companyId: '', newCompanyName: e.target.value });
 }}
 onFocus={() => setIsDropdownOpen(true)}
 placeholder="Ketik nama perusahaan..."
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 required={!formData.companyId && !formData.newCompanyName}
 />
 {isDropdownOpen && (
 <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
 {companySearchQuery.trim() && !companies.some(c => c.name.toLowerCase() === companySearchQuery.toLowerCase()) && (
 <button
 type="button"
 onClick={() => {
 setFormData({ ...formData, companyId: '', newCompanyName: companySearchQuery.trim() });
 setIsDropdownOpen(false);
 }}
 className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-indigo-600 flex items-center space-x-2 border-b border-slate-100"
 >
 <Plus className="w-3.5 h-3.5" />
 <span className="font-medium">Tambahkan "{companySearchQuery.trim()}"</span>
 </button>
 )}
 {companies.filter(c => c.name.toLowerCase().includes(companySearchQuery.toLowerCase())).map(c => (
 <button
 key={c.id}
 type="button"
 onClick={() => {
 setFormData({ ...formData, companyId: c.id, newCompanyName: '' });
 setCompanySearchQuery(c.name);
 setIsDropdownOpen(false);
 }}
 className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between"
 >
 <span>{c.name}</span>
 {formData.companyId === c.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Posisi yang Dilamar *
 </label>
 <input
 type="text"
 placeholder="mis. Frontend Engineer, Power Engineer"
 value={formData.position}
 onChange={(e) => setFormData({ ...formData, position: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 required
 />
 </div>
 </div>

 {/* Date, Source, Status */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Tanggal Apply *
 </label>
 <input
 type="date"
 value={formData.appliedDate}
 onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 required
 />
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Sumber Lowongan *
 </label>
 <div className="relative" ref={sourceDropdownRef}>
 <input
 type="text"
 value={sourceSearchQuery}
 onChange={(e) => {
 setSourceSearchQuery(e.target.value);
 setIsSourceDropdownOpen(true);
 setFormData({ ...formData, source: e.target.value });
 }}
 onFocus={() => setIsSourceDropdownOpen(true)}
 placeholder="Ketik sumber lowongan..."
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 required
 />
 {isSourceDropdownOpen && (
 <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
 {sourceSearchQuery.trim() && !PREDEFINED_SOURCES.some(s => s.toLowerCase() === sourceSearchQuery.toLowerCase()) && (
 <button
 type="button"
 onClick={() => {
 setFormData({ ...formData, source: sourceSearchQuery.trim() });
 setIsSourceDropdownOpen(false);
 }}
 className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-indigo-600 flex items-center space-x-2 border-b border-slate-100"
 >
 <Plus className="w-3.5 h-3.5" />
 <span className="font-medium">Tambahkan "{sourceSearchQuery.trim()}"</span>
 </button>
 )}
 {PREDEFINED_SOURCES.filter(s => s.toLowerCase().includes(sourceSearchQuery.toLowerCase())).map(s => (
 <button
 key={s}
 type="button"
 onClick={() => {
 setFormData({ ...formData, source: s });
 setSourceSearchQuery(s);
 setIsSourceDropdownOpen(false);
 }}
 className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between"
 >
 <span>{s}</span>
 {formData.source === s && <Check className="w-3.5 h-3.5 text-indigo-600" />}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Status Awal
 </label>
 <select
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 >
 <option value="APPLIED">APPLIED</option>
 <option value="SCREENING">SCREENING</option>
 <option value="INTERVIEW_HR">INTERVIEW HR</option>
 <option value="INTERVIEW_USER">INTERVIEW USER</option>
 <option value="OFFER">OFFER</option>
 </select>
 </div>
 </div>

 {/* Links & Salary */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Link Lowongan
 </label>
 <input
 type="url"
 placeholder="https://..."
 value={formData.applicationLink}
 onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Range Gaji (Opsional)
 </label>
 <input
 type="text"
 placeholder="mis. Rp 10.000.000 - Rp 15.000.000"
 value={formData.salaryRange}
 onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 {/* HR Contact & Next Follow Up */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Nama Kontak HR
 </label>
 <input
 type="text"
 placeholder="mis. Sarah Recruiter"
 value={formData.contactPerson}
 onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Kontak HR (Email/WA)
 </label>
 <input
 type="text"
 placeholder="hr@company.com / +62..."
 value={formData.contactInfo}
 onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Jadwal Follow-up
 </label>
 <input
 type="date"
 value={formData.nextFollowUp}
 onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 {/* Fit Score & Notes */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Fit Score (0-100)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 placeholder="85"
 value={formData.fitScore}
 onChange={(e) => setFormData({ ...formData, fitScore: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div className="sm:col-span-2">
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Alasan Fit Score (Fit Notes)
 </label>
 <input
 type="text"
 placeholder="mis. Skill React & Node cocok, lokasi sesuai"
 value={formData.fitNotes}
 onChange={(e) => setFormData({ ...formData, fitNotes: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 {/* Job Description Snapshot */}
 <div>
 <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 mb-2">
 Archived Job Description (Snapshot Teks Lowongan)
 </label>
 <textarea
 rows={5}
 placeholder="Paste teks persyaratan & deskripsi lowongan di sini untuk cadangan saat listing hilang..."
 value={formData.archivedJobDescription}
 onChange={(e) => setFormData({ ...formData, archivedJobDescription: e.target.value })}
 className="w-full p-4 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 {/* Submit */}
 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
 <Link
 href="/applications"
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
 <span>{submitting ?'Menyimpan...':'Simpan Lamaran'}</span>
 </button>
 </div>
 </form>
 );
}

export default function NewApplicationPage() {
 return (
 <div className="max-w-3xl mx-auto space-y-6">
 <div className="flex items-center space-x-3">
 <Link href="/applications" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div>
 <h1 className="text-2xl font-medium text-slate-900">Tambah Lamaran Kerja</h1>
 <p className="text-xs text-slate-500">Catat lamaran baru ke dalam tracker</p>
 </div>
 </div>

 <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat form...</div>}>
 <NewApplicationForm />
 </Suspense>
 </div>
 );
}

