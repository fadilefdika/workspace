'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Platform } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, LayoutTemplate, Sparkles } from 'lucide-react';

export default function NewContentPage() {
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [platform, setPlatform] = useState<Platform>('LINKEDIN');
  const [targetDate, setTargetDate] = useState('');
  const [themeTag, setThemeTag] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !targetDate) {
      setError('Judul konten dan Target Rilis harus diisi');
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      await apiClient.post('/content', {
        title,
        description,
        contentBody,
        platform,
        themeTag: themeTag || undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      });
      
      // Clear state
      setTitle('');
      setDescription('');
      setContentBody('');
      setPlatform('LINKEDIN');
      setTargetDate('');
      setThemeTag('');

      router.push('/content');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan ide konten');
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!contentBody) return;
    const originalText = contentBody;
    setIsEnhancing(true);
    setContentBody('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${apiUrl}/content/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Gagal menghubungi server AI');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Streaming tidak didukung browser ini');

      let done = false;
      let buffer = '';
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              const data = line.trim().slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  setContentBody((prev) => prev + parsed.text);
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e: any) {
                if (e.message !== 'Unexpected end of JSON input') throw e;
              }
            }
          }
        }
      }
    } catch (err: any) {
      alert(err.message || 'Gagal meningkatkan teks dengan AI');
      setContentBody(originalText);
    } finally {
      setIsEnhancing(false);
    }
  };

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
            <h1 className="text-2xl leading-tight font-semibold text-ink">Tambah Ide Konten</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            href="/content"
            className="px-5 py-2.5 rounded-full text-sm font-medium text-ink-secondary hover:bg-black/[0.04] transition-colors"
          >
            Batal
          </Link>
          <button
            onClick={() => handleSubmit()}
            disabled={saving || !title.trim() || !targetDate}
            className="inline-flex items-center justify-center space-x-2 rounded-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-[15px] font-medium px-5 py-2.5 transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-accent/25 outline-none"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Ide</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Konten <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all font-medium text-ink bg-canvas"
                placeholder="Misal: 5 hal yang saya pelajari dari menolak offer kerja"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <LayoutTemplate className="w-4 h-4" />
                  <span>Isi Draf Konten</span>
                </label>
                <button
                  type="button"
                  onClick={handleEnhanceWithAI}
                  disabled={isEnhancing || !contentBody}
                  className="inline-flex items-center space-x-1 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50 transition-colors"
                >
                  {isEnhancing ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tingkatkan dengan AI</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm font-mono bg-canvas text-ink leading-relaxed"
                placeholder={platform === 'THREADS' ? "Tulis thread utas panjang Anda di sini..." : "Tulis konten LinkedIn Anda di sini..."}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="font-bold text-slate-900 border-b border-black/5 pb-2">Pengaturan</h3>
            
            <div>
              <label className="block text-[13px] font-bold text-ink-secondary uppercase tracking-wider mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm font-medium bg-canvas text-ink"
              >
                <option value="LINKEDIN">LinkedIn</option>
                <option value="THREADS">Threads</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Target Rilis <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-canvas text-ink"
              />
            </div>
            
            <hr className="border-black/5" />
            
            <div>
              <label className="block text-[13px] font-bold text-ink-secondary uppercase tracking-wider mb-2">Deskripsi / Catatan Singkat</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-canvas text-ink"
                placeholder="Poin utama, referensi, dll..."
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-bold text-ink-secondary uppercase tracking-wider mb-2">Tag Tema (Opsional)</label>
              <input
                type="text"
                value={themeTag}
                onChange={(e) => setThemeTag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-canvas text-ink"
                placeholder="Misal: Career, Tech, Personal"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
