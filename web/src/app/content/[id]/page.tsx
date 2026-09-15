'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ContentItem, ContentStatus, Platform } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Calendar, LayoutTemplate } from 'lucide-react';

export default function ContentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [status, setStatus] = useState<ContentStatus>('IDEA');
  const [platform, setPlatform] = useState<Platform>('LINKEDIN');
  const [targetDate, setTargetDate] = useState('');
  const [publishUrl, setPublishUrl] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await apiClient.get<ContentItem>(`/content/${id}`);
        setContent(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setContentBody(data.contentBody || '');
        setStatus(data.status);
        setPlatform(data.platform);
        setPublishUrl(data.publishUrl || '');
        if (data.targetDate) {
          const date = new Date(data.targetDate);
          setTargetDate(date.toISOString().split('T')[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat konten');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch(`/content/${id}`, {
        title,
        description,
        contentBody,
        status,
        platform,
        publishUrl,
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
      });
      // Optionally show success toast
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus konten ini?')) return;
    try {
      await apiClient.delete(`/content/${id}`);
      router.push('/content');
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-700">Konten tidak ditemukan</h2>
        <Link href="/content" className="text-indigo-600 hover:underline mt-4 inline-block">
          Kembali ke daftar konten
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/content"
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Konten</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
            title="Hapus Konten"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpdate()}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Konten</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4" />
                <span>Isi Draf Konten</span>
              </label>
              <textarea
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm font-mono bg-slate-50 leading-relaxed"
                placeholder={platform === 'THREADS' ? "Tulis thread utas panjang Anda di sini..." : "Tulis konten LinkedIn Anda di sini..."}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Status & Pengaturan</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium bg-slate-50"
              >
                <option value="IDEA">Idea</option>
                <option value="DRAFTING">Drafting</option>
                <option value="REVIEW">Review</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium bg-slate-50"
              >
                <option value="LINKEDIN">LinkedIn</option>
                <option value="THREADS">Threads</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Target Rilis
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL Publikasi (Jika sudah rilis)</label>
              <input
                type="url"
                value={publishUrl}
                onChange={(e) => setPublishUrl(e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-slate-50"
              />
            </div>
            
            <hr className="border-slate-100" />
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi / Catatan Ide</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-slate-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
