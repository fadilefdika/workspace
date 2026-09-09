'use client';

import { useEffect, useState } from'react';
import { apiClient } from'@/lib/api-client';
import { Application, ApplicationStatus } from'@/types';
import Link from'next/link';
import FitScoreBadge from'@/components/applications/FitScoreBadge';
import {
 Plus,
 LayoutGrid,
 List,
 Search,
 Building2,
 Calendar,
 ExternalLink,
 ChevronRight,
 Filter,
} from'lucide-react';

export default function ApplicationsPage() {
 const [applications, setApplications] = useState<Application[]>([]);
 const [loading, setLoading] = useState(true);
 const [viewMode, setViewMode] = useState<'table'|'kanban'>('table');
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState<string>('ALL');

 const fetchApplications = async () => {
 try {
 const data = await apiClient.get<Application[]>('/applications');
 setApplications(data);
 } catch (err) {
 console.error('Failed to fetch applications', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchApplications();
 }, []);

 const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
 try {
 await apiClient.patch(`/applications/${appId}`, { status: newStatus });
 fetchApplications();
 } catch (err) {
 console.error('Failed to update status', err);
 }
 };

 const filteredApps = applications.filter((app) => {
 const matchesSearch =
 app.position.toLowerCase().includes(search.toLowerCase()) ||
 app.company?.name.toLowerCase().includes(search.toLowerCase());
 const matchesStatus = statusFilter ==='ALL'|| app.status === statusFilter;
 return matchesSearch && matchesStatus;
 });

 const getStatusBadge = (status: ApplicationStatus) => {
 switch (status) {
 case'APPLIED':
 return'bg-blue-500/10 text-blue-600 border-blue-500/20';
 case'SCREENING':
 case'INTERVIEW_HR':
 case'INTERVIEW_USER':
 return'bg-amber-500/10 text-amber-600 border-amber-500/20';
 case'OFFER':
 case'ACCEPTED':
 return'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
 case'REJECTED':
 case'GHOSTED':
 return'bg-rose-500/10 text-rose-600 border-rose-500/20';
 default:
 return'bg-slate-500/10 text-slate-400 border-slate-500/20';
 }
 };

 const kanbanColumns: { title: string; status: ApplicationStatus }[] = [
 { title:'Applied', status:'APPLIED'},
 { title:'Screening', status:'SCREENING'},
 { title:'Interview HR', status:'INTERVIEW_HR'},
 { title:'Interview User', status:'INTERVIEW_USER'},
 { title:'Offer / Accepted', status:'OFFER'},
 { title:'Ditolak / Ghosted', status:'REJECTED'},
 ];

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Top Header & Actions */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Daftar Lamaran Kerja</h1>
 <p className="text-xs sm:text-sm text-slate-500">
 Kelola dan pantau progres lamaran yang telah diajukan
 </p>
 </div>

 <div className="flex items-center space-x-3">
 {/* View Toggle */}
 <div className="flex items-center p-1 rounded-xl glass-card border border-slate-200">
 <button
 onClick={() => setViewMode('table')}
 className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
 viewMode ==='table'
 ?'bg-indigo-600 text-white shadow-sm'
 :'text-slate-500 hover:text-slate-900 :text-white'
 }`}
 >
 <List className="w-4 h-4" />
 <span className="hidden sm:inline">Tabel</span>
 </button>
 <button
 onClick={() => setViewMode('kanban')}
 className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
 viewMode ==='kanban'
 ?'bg-indigo-600 text-white shadow-sm'
 :'text-slate-500 hover:text-slate-900 :text-white'
 }`}
 >
 <LayoutGrid className="w-4 h-4" />
 <span className="hidden sm:inline">Kanban</span>
 </button>
 </div>

 <Link
 href="/applications/new"
 className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/25"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Lamaran</span>
 </Link>
 </div>
 </div>

 {/* Search & Filter Bar */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-80">
 <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 placeholder="Cari posisi atau nama perusahaan..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div className="flex items-center space-x-2 w-full sm:w-auto">
 <Filter className="w-4 h-4 text-slate-400" />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full sm:w-48 px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
 >
 <option value="ALL">Semua Status</option>
 <option value="APPLIED">Applied</option>
 <option value="SCREENING">Screening</option>
 <option value="INTERVIEW_HR">Interview HR</option>
 <option value="INTERVIEW_USER">Interview User</option>
 <option value="OFFER">Offer</option>
 <option value="ACCEPTED">Accepted</option>
 <option value="REJECTED">Rejected</option>
 <option value="GHOSTED">Ghosted</option>
 </select>
 </div>
 </div>

 {/* Table View */}
 {viewMode ==='table'? (
 <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-500 font-bold uppercase tracking-wider">
 <th className="py-3.5 px-4">Posisi & Perusahaan</th>
 <th className="py-3.5 px-4">Tanggal Apply</th>
 <th className="py-3.5 px-4">Sumber</th>
 <th className="py-3.5 px-4">Fit Score</th>
 <th className="py-3.5 px-4">Status</th>
 <th className="py-3.5 px-4 text-right">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {filteredApps.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-400 italic">
 Tidak ada lamaran yang cocok.
 </td>
 </tr>
 ) : (
 filteredApps.map((app) => (
 <tr key={app.id} className="hover:bg-slate-100/50 :bg-slate-900/40 transition-colors">
 <td className="py-3.5 px-4">
 <div>
 <Link href={`/applications/${app.id}`} className="font-bold text-sm text-slate-900 hover:text-indigo-500 transition-colors">
 {app.position}
 </Link>
 <div className="flex items-center space-x-1.5 text-slate-500 mt-0.5">
 <Building2 className="w-3.5 h-3.5" />
 <span>{app.company?.name}</span>
 </div>
 </div>
 </td>
 <td className="py-3.5 px-4 text-slate-600 font-medium">
 <div className="flex items-center space-x-1">
 <Calendar className="w-3.5 h-3.5 text-slate-400" />
 <span>{new Date(app.appliedDate).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'})}</span>
 </div>
 </td>
 <td className="py-3.5 px-4">
 <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[11px]">
 {app.source}
 </span>
 </td>
 <td className="py-3.5 px-4">
 <FitScoreBadge score={app.fitScore} notes={app.fitNotes} />
 </td>
 <td className="py-3.5 px-4">
 <select
 value={app.status}
 onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
 className={`px-2.5 py-1 rounded-full border text-xs font-bold bg-transparent focus:outline-none ${getStatusBadge(app.status)}`}
 >
 <option value="APPLIED" className="bg-slate-900 text-white">APPLIED</option>
 <option value="SCREENING" className="bg-slate-900 text-white">SCREENING</option>
 <option value="INTERVIEW_HR" className="bg-slate-900 text-white">INTERVIEW HR</option>
 <option value="INTERVIEW_USER" className="bg-slate-900 text-white">INTERVIEW USER</option>
 <option value="OFFER" className="bg-slate-900 text-white">OFFER</option>
 <option value="ACCEPTED" className="bg-slate-900 text-white">ACCEPTED</option>
 <option value="REJECTED" className="bg-slate-900 text-white">REJECTED</option>
 <option value="GHOSTED" className="bg-slate-900 text-white">GHOSTED</option>
 </select>
 </td>
 <td className="py-3.5 px-4 text-right">
 <Link
 href={`/applications/${app.id}`}
 className="inline-flex items-center space-x-1 p-2 rounded-lg text-indigo-600 hover:bg-indigo-500/10 font-bold transition-colors"
 >
 <span>Detail</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 ) : (
 /* Kanban Board View */
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
 {kanbanColumns.map((col) => {
 const colApps = filteredApps.filter((app) => {
 if (col.status ==='OFFER') return app.status ==='OFFER'|| app.status ==='ACCEPTED';
 if (col.status ==='REJECTED') return app.status ==='REJECTED'|| app.status ==='GHOSTED';
 return app.status === col.status;
 });

 return (
 <div key={col.status} className="glass-card p-4 rounded-2xl border border-slate-200 flex flex-col min-w-[240px]">
 <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
 <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
 {col.title}
 </h3>
 <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500">
 {colApps.length}
 </span>
 </div>

 <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
 {colApps.map((app) => (
 <div key={app.id} className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500/50 transition-all shadow-sm space-y-2">
 <Link href={`/applications/${app.id}`} className="font-bold text-sm text-slate-900 hover:text-indigo-500 block">
 {app.position}
 </Link>
 <p className="text-xs text-slate-500 flex items-center space-x-1">
 <Building2 className="w-3.5 h-3.5" />
 <span>{app.company?.name}</span>
 </p>
 <div className="flex items-center justify-between pt-1">
 <FitScoreBadge score={app.fitScore} />
 <Link href={`/applications/${app.id}`} className="text-indigo-500 hover:underline text-xs font-bold">
 Detail →
 </Link>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}

