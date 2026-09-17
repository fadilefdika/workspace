'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ContentItem } from '@/types';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const data = await apiClient.get<ContentItem[]>('/content');
        setContents(data.filter(c => c.targetDate));
      } catch (err) {
        console.error('Failed to fetch contents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, []);

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getPlatformBadge = (platform: string) => {
    if (platform === 'LINKEDIN') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (platform === 'THREADS') return 'bg-neutral-200 text-neutral-800 border-neutral-300';
    return 'bg-slate-100 text-slate-700';
  };

  const isToday = (date: number) => {
    const t = new Date();
    return date === t.getDate() && currentDate.getMonth() === t.getMonth() && currentDate.getFullYear() === t.getFullYear();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
          <h1 className="text-2xl leading-tight font-semibold text-ink">Content Calendar</h1>
          <p className="text-[13px] text-ink-secondary mt-1">Jadwal rilis konten Anda</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={today} className="px-4 py-1.5 rounded-full text-[13px] font-medium bg-black/[0.04] hover:bg-black/[0.08] text-ink transition-colors">
            Hari ini
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
          {/* Empty cells for start of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-slate-100 bg-slate-50/30 p-2" />
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1).toISOString().split('T')[0];
            const dayContents = contents.filter(c => c.targetDate && c.targetDate.startsWith(dateStr));
            
            // Highlight hari kosong (bukan masa lalu jika hari ini ke depan belum ada konten)
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
            const isFutureOrToday = d.getTime() >= new Date(new Date().setHours(0,0,0,0)).getTime();
            const isEmptyTarget = isFutureOrToday && dayContents.length === 0;

            return (
              <div 
                key={i} 
                className={`border-b border-r border-slate-100 p-2 hover:bg-slate-50 transition-colors group relative flex flex-col
                  ${isEmptyTarget ? 'bg-rose-50/30' : ''}
                `}
              >
                <div className={`text-right mb-2`}>
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                    ${isToday(i + 1) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50'}
                  `}>
                    {i + 1}
                  </span>
                </div>
                
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[150px] no-scrollbar">
                  {dayContents.map(content => (
                    <Link 
                      key={content.id} 
                      href={`/content/${content.id}`}
                      className={`block p-1.5 rounded-lg border text-xs text-left truncate transition-all hover:shadow-md ${getPlatformBadge(content.platform)}`}
                      title={content.title}
                    >
                      <div className="font-semibold truncate">{content.title}</div>
                      <div className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">{content.status}</div>
                    </Link>
                  ))}
                  
                  {isEmptyTarget && (
                    <div className="text-[10px] text-rose-400 font-medium text-center p-2 border border-dashed border-rose-200 rounded-lg bg-rose-50/50">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Empty cells for end of month */}
          {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="border-b border-r border-slate-100 bg-slate-50/30 p-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
