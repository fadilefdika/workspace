'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ContentItem, ContentStatus, Platform } from '@/types';
import Link from 'next/link';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Calendar,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function ContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchContents = async () => {
    try {
      const data = await apiClient.get<ContentItem[]>('/content');
      setContents(data);
    } catch (err) {
      console.error('Failed to fetch contents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ContentStatus) => {
    try {
      await apiClient.patch(`/content/${id}`, { status: newStatus });
      fetchContents();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredContents = contents.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'IDEA':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      case 'DRAFTING':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'REVIEW':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'SCHEDULED':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'PUBLISHED':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPlatformBadge = (platform: Platform) => {
    if (platform === 'LINKEDIN') return 'bg-blue-600/10 text-blue-700 border-blue-200';
    if (platform === 'THREADS') return 'bg-neutral-800/10 text-neutral-900 border-neutral-300';
    return 'bg-slate-100 text-slate-700';
  };

  const kanbanColumns: { title: string; status: ContentStatus }[] = [
    { title: 'Idea', status: 'IDEA' },
    { title: 'Drafting', status: 'DRAFTING' },
    { title: 'Review', status: 'REVIEW' },
    { title: 'Scheduled', status: 'SCHEDULED' },
    { title: 'Published', status: 'PUBLISHED' },
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Content Planner</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola ide dan jadwal publikasi konten Anda
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl glass-card border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 :text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 :text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          <Link
            href="/content/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Konten</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul konten..."
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
            <option value="IDEA">Idea</option>
            <option value="DRAFTING">Drafting</option>
            <option value="REVIEW">Review</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {kanbanColumns.map((col) => {
            const colContents = filteredContents.filter((c) => c.status === col.status);

            return (
              <div key={col.status} className="glass-card p-4 rounded-2xl border border-slate-200 flex flex-col w-[300px] shrink-0 snap-start">
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                  <h3 className="font-medium text-xs uppercase tracking-wider text-slate-700">
                    {col.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500">
                    {colContents.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {colContents.map((content) => (
                    <div key={content.id} className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500/50 transition-all shadow-sm space-y-2">
                      <Link href={`/content/${content.id}`} className="font-medium text-sm text-slate-900 hover:text-indigo-500 block">
                        {content.title}
                      </Link>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${getPlatformBadge(content.platform)}`}>
                          {content.platform}
                        </span>
                        {content.targetDate && (
                          <div className="flex items-center text-slate-500 text-[10px]">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(content.targetDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 text-right">
                        <Link href={`/content/${content.id}`} className="text-indigo-500 hover:underline text-xs font-medium">
                          Edit →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-500 font-medium uppercase tracking-wider">
                  <th className="py-3.5 px-4">Judul Konten</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Target Rilis</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      Tidak ada konten yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredContents.map((content) => (
                    <tr key={content.id} className="hover:bg-slate-100/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link href={`/content/${content.id}`} className="font-medium text-sm text-slate-900 hover:text-indigo-500 transition-colors">
                          {content.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-1 rounded-md border text-[11px] font-medium ${getPlatformBadge(content.platform)}`}>
                          {content.platform}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {content.targetDate ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(content.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={content.status}
                          onChange={(e) => handleStatusChange(content.id, e.target.value as ContentStatus)}
                          className={`px-2.5 py-1 rounded-full border text-xs font-medium bg-transparent focus:outline-none ${getStatusBadge(content.status)}`}
                        >
                          <option value="IDEA" className="bg-slate-900 text-white">IDEA</option>
                          <option value="DRAFTING" className="bg-slate-900 text-white">DRAFTING</option>
                          <option value="REVIEW" className="bg-slate-900 text-white">REVIEW</option>
                          <option value="SCHEDULED" className="bg-slate-900 text-white">SCHEDULED</option>
                          <option value="PUBLISHED" className="bg-slate-900 text-white">PUBLISHED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/content/${content.id}`}
                          className="inline-flex items-center space-x-1 p-2 rounded-lg text-indigo-600 hover:bg-indigo-500/10 font-medium transition-colors"
                        >
                          <span>Edit</span>
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
      )}
    </div>
  );
}
