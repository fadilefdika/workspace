'use client';

import { useEffect, useState } from'react';
import { useParams, useRouter } from'next/navigation';
import { apiClient } from'@/lib/api-client';
import { Company, Application } from'@/types';
import DealBreakerTags from'@/components/companies/DealBreakerTags';
import Link from'next/link';
import {
 ArrowLeft,
 Building2,
 MapPin,
 Globe,
 ExternalLink,
 Plus,
 Trash2,
 Save,
 Briefcase,
 Calendar,
} from'lucide-react';

export default function CompanyDetailPage() {
 const params = useParams();
 const router = useRouter();
 const slug = params.slug as string;

 const [company, setCompany] = useState<Company | null>(null);
 const [loading, setLoading] = useState(true);
 const [editingNotes, setEditingNotes] = useState(false);
 const [researchNotes, setResearchNotes] = useState('');

 const fetchDetail = async () => {
 try {
 const data = await apiClient.get<Company>(`/companies/${slug}`);
 setCompany(data);
 setResearchNotes(data.researchNotes ||'');
 } catch (err) {
 console.error('Failed to load company detail', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (slug) fetchDetail();
 }, [slug]);

 const handleSaveNotes = async () => {
 try {
 const updated = await apiClient.patch<Company>(`/companies/${slug}`, { researchNotes });
 setCompany(updated);
 setEditingNotes(false);
 } catch (err) {
 console.error('Failed to save research notes', err);
 }
 };

 const handleDelete = async () => {
 if (!confirm('Apakah Anda yakin ingin menghapus perusahaan target ini?')) return;
 try {
 await apiClient.delete(`/companies/${slug}`);
 router.push('/companies');
 } catch (err) {
 console.error('Failed to delete company', err);
 }
 };

 if (loading || !company) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <Link href="/companies" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div className="flex items-center space-x-3">
 <Link
 href={`/applications/new?companyId=${company.id}`}
 className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/25"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Lamaran ke Perusahaan Ini</span>
 </Link>
 <button
 onClick={handleDelete}
 className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
 title="Hapus Perusahaan"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Main Info Card */}
 <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
 <div>
 <span className="inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-2 bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
 {company.priority} Priority
 </span>
 <h1 className="text-2xl sm:text-3xl font-medium text-slate-900">
 {company.name}
 </h1>
 <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
 {company.industry && (
 <div className="flex items-center space-x-1.5">
 <Building2 className="w-4 h-4 text-slate-400" />
 <span>{company.industry}</span>
 </div>
 )}
 {company.location && (
 <div className="flex items-center space-x-1.5">
 <MapPin className="w-4 h-4 text-slate-400" />
 <span>{company.location}</span>
 </div>
 )}
 </div>
 </div>

 <div className="flex flex-col sm:items-end space-y-2 text-xs">
 {company.websiteUrl && (
 <a
 href={company.websiteUrl}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center space-x-1.5 text-indigo-500 hover:underline font-medium"
 >
 <Globe className="w-4 h-4" />
 <span>Official Website</span>
 <ExternalLink className="w-3 h-3" />
 </a>
 )}
 {company.careerPageUrl && (
 <a
 href={company.careerPageUrl}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center space-x-1.5 text-purple-500 hover:underline font-medium"
 >
 <Briefcase className="w-4 h-4" />
 <span>Career Page</span>
 <ExternalLink className="w-3 h-3" />
 </a>
 )}
 </div>
 </div>

 {/* Deal Breakers Tag List */}
 <div>
 <h3 className="font-medium text-xs uppercase tracking-wider text-slate-400 mb-2">
 Syarat Mutlak / Deal Breakers
 </h3>
 <DealBreakerTags dealBreakers={company.dealBreakers} />
 </div>

 {/* Research Notes */}
 <div className="space-y-2 pt-4 border-t border-slate-200">
 <div className="flex items-center justify-between">
 <h3 className="font-medium text-sm text-slate-900">Catatan Riset Pribadi</h3>
 <button
 onClick={() => setEditingNotes(!editingNotes)}
 className="text-xs text-indigo-500 hover:underline font-medium"
 >
 {editingNotes ?'Batal':'Edit Catatan'}
 </button>
 </div>
 {editingNotes ? (
 <div className="space-y-2">
 <textarea
 rows={5}
 value={researchNotes}
 onChange={(e) => setResearchNotes(e.target.value)}
 className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
 />
 <button
 onClick={handleSaveNotes}
 className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs"
 >
 <Save className="w-3.5 h-3.5" />
 <span>Simpan Riset</span>
 </button>
 </div>
 ) : (
 <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 min-h-[100px] whitespace-pre-wrap">
 {company.researchNotes ||'Belum ada catatan riset untuk perusahaan ini.'}
 </div>
 )}
 </div>
 </div>

 {/* Application History for this company */}
 <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="font-medium text-lg text-slate-900">Riwayat Lamaran</h3>
 <span className="text-xs text-slate-400 font-medium">
 Total: {company.applications?.length || 0} Lamaran
 </span>
 </div>

 {!company.applications || company.applications.length === 0 ? (
 <p className="text-xs text-slate-400 italic py-6 text-center">
 Belum ada lamaran yang diajukan ke perusahaan ini.
 </p>
 ) : (
 <div className="space-y-3">
 {company.applications.map((app) => (
 <div
 key={app.id}
 className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-4 hover:border-indigo-500/40 transition-all"
 >
 <div>
 <Link href={`/applications/${app.id}`} className="font-medium text-sm text-slate-900 hover:text-indigo-500">
 {app.position}
 </Link>
 <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
 <Calendar className="w-3.5 h-3.5 text-slate-400" />
 <span>Apply: {new Date(app.appliedDate).toLocaleDateString('id-ID')}</span>
 <span>•</span>
 <span className="uppercase font-medium">{app.source}</span>
 </div>
 </div>

 <div className="flex items-center space-x-3">
 <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
 {app.status}
 </span>
 <Link
 href={`/applications/${app.id}`}
 className="text-xs font-medium text-indigo-500 hover:underline"
 >
 Detail →
 </Link>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
