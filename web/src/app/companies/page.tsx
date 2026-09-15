'use client';

import { useEffect, useState } from'react';
import { apiClient } from'@/lib/api-client';
import { Company, Priority } from'@/types';
import Link from'next/link';
import DealBreakerTags from'@/components/companies/DealBreakerTags';
import { Plus, Search, Building2, MapPin, Briefcase, ChevronRight, ShieldAlert } from'lucide-react';

export default function CompaniesPage() {
 const [companies, setCompanies] = useState<Company[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

 useEffect(() => {
 async function loadCompanies() {
 try {
 const data = await apiClient.get<Company[]>('/companies');
 setCompanies(data);
 } catch (err) {
 console.error('Failed to load companies', err);
 } finally {
 setLoading(false);
 }
 }
 loadCompanies();
 }, []);

 const filtered = companies.filter((c) => {
 const matchesSearch =
 c.name.toLowerCase().includes(search.toLowerCase()) ||
 (c.industry && c.industry.toLowerCase().includes(search.toLowerCase())) ||
 (c.location && c.location.toLowerCase().includes(search.toLowerCase()));
 const matchesPriority = priorityFilter ==='ALL'|| c.priority === priorityFilter;
 return matchesSearch && matchesPriority;
 });

 const getPriorityBadge = (priority: Priority) => {
 switch (priority) {
 case'HIGH':
 return'bg-rose-500/10 text-rose-600 border-rose-500/20';
 case'MEDIUM':
 return'bg-amber-500/10 text-amber-600 border-amber-500/20';
 case'LOW':
 return'bg-slate-500/10 text-slate-500 border-slate-500/20';
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header & Actions */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-medium text-slate-900">
 Direktori Perusahaan Incaran
 </h1>
 <p className="text-xs sm:text-sm text-slate-500">
 Daftar target perusahaan impian beserta catatan riset & riwayat lamaran
 </p>
 </div>

 <Link
 href="/companies/new"
 className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-500/25"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Perusahaan</span>
 </Link>
 </div>

 {/* Search & Priority Filter */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-80">
 <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 placeholder="Cari perusahaan, industri, atau lokasi..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <select
 value={priorityFilter}
 onChange={(e) => setPriorityFilter(e.target.value)}
 className="w-full sm:w-48 px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
 >
 <option value="ALL">Semua Prioritas</option>
 <option value="HIGH">Prioritas HIGH</option>
 <option value="MEDIUM">Prioritas MEDIUM</option>
 <option value="LOW">Prioritas LOW</option>
 </select>
 </div>

 {/* Grid Companies */}
 {filtered.length === 0 ? (
 <div className="glass-card p-12 text-center rounded-2xl">
 <p className="text-slate-400 text-xs italic">Tidak ada perusahaan yang ditemukan.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filtered.map((company) => (
 <div
 key={company.id}
 className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/50 transition-all group"
 >
 <div className="space-y-4">
 <div className="flex items-start justify-between">
 <div>
 <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-2 ${getPriorityBadge(company.priority)}`}>
 {company.priority} Priority
 </span>
 <h3 className="text-lg font-medium text-slate-900 group-hover:text-indigo-500 transition-colors">
 {company.name}
 </h3>
 </div>
 <span className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-xl">
 <Briefcase className="w-3.5 h-3.5" />
 <span>{company.applicationCount ?? 0}</span>
 </span>
 </div>

 <div className="space-y-1.5 text-xs text-slate-500">
 {company.industry && (
 <div className="flex items-center space-x-1.5">
 <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
 <span>{company.industry}</span>
 </div>
 )}
 {company.location && (
 <div className="flex items-center space-x-1.5">
 <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
 <span>{company.location}</span>
 </div>
 )}
 </div>

 {company.dealBreakers && company.dealBreakers.length > 0 && (
 <div className="pt-2 border-t border-slate-200">
 <DealBreakerTags dealBreakers={company.dealBreakers} />
 </div>
 )}
 </div>

 <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
 <Link
 href={`/companies/${company.slug}`}
 className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:underline"
 >
 <span>Detail & Riset</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 <Link
 href={`/applications/new?companyId=${company.id}`}
 className="text-xs text-slate-400 hover:text-slate-200 font-medium"
 >
 + Apply
 </Link>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}

