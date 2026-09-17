'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ContentItem, ContentStatus, Platform } from '@/types';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Calendar,
  ChevronRight,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Quick Capture State
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [qcTitle, setQcTitle] = useState('');
  const [qcPlatform, setQcPlatform] = useState<Platform>('LINKEDIN');
  const [qcTheme, setQcTheme] = useState('');

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
      
      if (newStatus === 'PUBLISHED') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcTitle.trim()) return;
    try {
      await apiClient.post('/content', {
        title: qcTitle,
        platform: qcPlatform,
        themeTag: qcTheme || undefined,
        status: 'IDEA',
      });
      setShowQuickCapture(false);
      setQcTitle('');
      setQcTheme('');
      fetchContents();
    } catch (err) {
      alert('Gagal capture ide');
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ContentStatus;
    
    // Update local state optimistically
    const newContents = [...contents];
    const draggedItemIndex = newContents.findIndex(c => c.id === draggableId);
    
    if (draggedItemIndex !== -1) {
      newContents[draggedItemIndex] = { ...newContents[draggedItemIndex], status: newStatus };
      setContents(newContents);
      
      handleStatusChange(draggableId, newStatus);
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
        return 'bg-black/5 text-ink-secondary border-black/10';
      case 'DRAFT':
        return 'bg-black/5 text-ink border-black/10';
      case 'READY':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'PUBLISHED':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-black/5 text-ink-secondary border-black/10';
    }
  };

  const getPlatformBadge = (platform: Platform) => {
    if (platform === 'LINKEDIN') return 'bg-accent/10 text-accent border-accent/20';
    if (platform === 'THREADS') return 'bg-black/5 text-ink border-black/10';
    return 'bg-black/5 text-ink-secondary border-black/10';
  };

  const kanbanColumns: { title: string; status: ContentStatus }[] = [
    { title: 'Idea', status: 'IDEA' },
    { title: 'Draft', status: 'DRAFT' },
    { title: 'Siap Publish', status: 'READY' },
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
          <h1 className="text-2xl leading-tight font-semibold text-ink">Content Planner</h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Kelola ide dan jadwal publikasi konten Anda
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-black/5 border border-black/5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          <button
            onClick={() => setShowQuickCapture(true)}
            className="inline-flex items-center justify-center space-x-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-ink text-[13px] font-medium px-4 py-2 transition-colors duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Idea</span>
          </button>

          <Link
            href="/content/new"
            className="inline-flex items-center justify-center space-x-1.5 rounded-full bg-accent hover:bg-accent-hover text-white text-[13px] font-medium px-4 py-2 transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-accent/25 outline-none"
          >
            <span>Buka Form</span>
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
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-white border border-black/5 text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl text-sm bg-white border border-black/5 text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          >
            <option value="ALL">Semua Status</option>
            <option value="IDEA">Idea</option>
            <option value="DRAFT">Draft</option>
            <option value="READY">Siap Publish</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {kanbanColumns.map((col) => {
              const colContents = filteredContents.filter((c) => c.status === col.status);

              return (
                <Droppable key={col.status} droppableId={col.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`glass-card p-4 rounded-2xl border flex flex-col w-[300px] shrink-0 snap-start transition-colors ${
                        snapshot.isDraggingOver ? 'border-accent bg-accent/5' : 'border-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-black/5 pb-2">
                        <h3 className="font-medium text-[13px] text-ink-secondary">
                          {col.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 text-ink-secondary">
                          {colContents.length}
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] no-scrollbar">
                        {colContents.map((content, index) => (
                          <Draggable key={content.id} draggableId={content.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 rounded-xl bg-white border transition-all shadow-sm space-y-2 ${
                                  snapshot.isDragging ? 'border-accent shadow-elevated rotate-1' : 'border-black/5 hover:border-black/15'
                                }`}
                              >
                                <Link href={`/content/${content.id}`} className="font-semibold text-[15px] leading-snug text-ink hover:text-accent block">
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
                                  <Link href={`/content/${content.id}`} className="text-accent hover:underline text-xs font-medium">
                                    Edit →
                                  </Link>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl overflow-hidden border border-black/5 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-black/5 text-ink-secondary font-medium">
                  <th className="py-3.5 px-4">Judul Konten</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Target Rilis</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-tertiary italic">
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
                      <td className="py-3.5 px-4 text-ink-secondary">
                        {content.targetDate ? (
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-ink-tertiary" />
                            <span>{new Date(content.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        ) : (
                          <span className="text-ink-tertiary">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={content.status}
                          onChange={(e) => handleStatusChange(content.id, e.target.value as ContentStatus)}
                          className={`px-2.5 py-1 rounded-full border text-xs font-medium bg-transparent focus:outline-none ${getStatusBadge(content.status)}`}
                        >
                          <option value="IDEA" className="bg-canvas text-ink">IDEA</option>
                          <option value="DRAFT" className="bg-canvas text-ink">DRAFT</option>
                          <option value="READY" className="bg-canvas text-ink">READY</option>
                          <option value="PUBLISHED" className="bg-canvas text-ink">PUBLISHED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/content/${content.id}`}
                          className="inline-flex items-center space-x-1 p-2 rounded-full text-accent hover:bg-accent/10 font-medium transition-colors"
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

      {/* Quick Capture Modal */}
      {showQuickCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Quick Idea</h2>
              <button onClick={() => setShowQuickCapture(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleQuickCapture} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Ide</label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={qcTitle}
                  onChange={(e) => setQcTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-[15px] bg-canvas transition-colors"
                  placeholder="Misal: Tips belajar coding di usia 30"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-ink-secondary mb-2">Platform</label>
                <select
                  value={qcPlatform}
                  onChange={(e) => setQcPlatform(e.target.value as Platform)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-[15px] bg-canvas transition-colors"
                >
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="THREADS">Threads</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tag Tema (Opsional)</label>
                <input
                  type="text"
                  value={qcTheme}
                  onChange={(e) => setQcTheme(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-[15px] bg-canvas transition-colors"
                  placeholder="Misal: Career, Tech, Personal"
                />
              </div>
              <div className="pt-4 mt-2">
                <button
                  type="submit"
                  disabled={!qcTitle.trim()}
                  className="w-full py-3 rounded-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium text-[15px] transition-colors focus-visible:ring-4 focus-visible:ring-accent/25 outline-none"
                >
                  Simpan Ide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
