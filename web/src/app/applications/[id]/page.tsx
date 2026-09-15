'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Application, ApplicationStatus } from '@/types';
import FitScoreBadge from '@/components/applications/FitScoreBadge';
import InterviewStageList from '@/components/applications/InterviewStageList';
import FollowUpDraftModal from '@/components/applications/FollowUpDraftModal';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    Calendar,
    ExternalLink,
    UserCheck,
    DollarSign,
    FileText,
    Trash2,
    BookOpen,
    Save,
} from 'lucide-react';

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notes, setNotes] = useState('');

    const fetchDetail = async () => {
        try {
            const data = await apiClient.get<Application>(`/applications/${id}`);
            setApplication(data);
            setNotes(data.notes || '');
        } catch (err) {
            console.error('Failed to load application detail', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const handleStatusChange = async (newStatus: ApplicationStatus) => {
        if (!application) return;
        try {
            const updated = await apiClient.patch<Application>(`/applications/${id}`, { status: newStatus });
            setApplication(updated);
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleSaveNotes = async () => {
        try {
            const updated = await apiClient.patch<Application>(`/applications/${id}`, { notes });
            setApplication(updated);
            setEditingNotes(false);
        } catch (err) {
            console.error('Failed to save notes', err);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus lamaran ini?')) return;
        try {
            await apiClient.delete(`/applications/${id}`);
            router.push('/applications');
        } catch (err) {
            console.error('Failed to delete application', err);
        }
    };

    if (loading || !application) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Header */}
            <div className="flex items-center justify-between">
                <Link href="/applications" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center space-x-3">
                    <Link
                        href={`/applications/${id}/prep`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 border border-purple-500/20 font-medium text-xs transition-all"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Interview Prep</span>
                    </Link>
                    <FollowUpDraftModal
                        applicationId={application.id}
                        followUpCount={application.followUpCount}
                        onFollowUpCountIncrement={fetchDetail}
                    />
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                        title="Hapus Lamaran"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Info Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <FitScoreBadge score={application.fitScore} notes={application.fitNotes} />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                {application.source}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-medium text-slate-900">
                            {application.position}
                        </h1>
                        <Link
                            href={`/companies/${application.company?.slug}`}
                            className="inline-flex items-center space-x-2 text-indigo-600 hover:underline font-medium text-sm mt-1"
                        >
                            <Building2 className="w-4 h-4" />
                            <span>{application.company?.name}</span>
                        </Link>
                    </div>

                    <div className="flex flex-col items-start sm:items-end space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status Lamaran</label>
                        <select
                            value={application.status}
                            onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                            className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 text-white focus:outline-none shadow-lg shadow-indigo-500/25"
                        >
                            <option value="APPLIED">APPLIED</option>
                            <option value="SCREENING">SCREENING</option>
                            <option value="INTERVIEW_HR">INTERVIEW HR</option>
                            <option value="INTERVIEW_USER">INTERVIEW USER</option>
                            <option value="OFFER">OFFER</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="GHOSTED">GHOSTED</option>
                        </select>
                        <span className="text-[11px] text-slate-400">
                            Diubah: {new Date(application.statusUpdatedAt).toLocaleDateString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="text-slate-400 font-medium uppercase tracking-wider block mb-1">Tanggal Apply</span>
                        <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span>{new Date(application.appliedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="text-slate-400 font-medium uppercase tracking-wider block mb-1">Range Gaji</span>
                        <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span>{application.salaryRange || 'Tidak dicantumkan'}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="text-slate-400 font-medium uppercase tracking-wider block mb-1">Kontak HR</span>
                        <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                            <UserCheck className="w-4 h-4 text-purple-500" />
                            <span>{application.contactPerson ? `${application.contactPerson} (${application.contactInfo || '-'})` : 'Belum ada'}</span>
                        </div>
                    </div>
                </div>

                {/* Link Lowongan */}
                {application.applicationLink && (
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                        <span className="text-xs text-indigo-600 font-medium">Portal / Link Lowongan Asli</span>
                        <a
                            href={application.applicationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:underline"
                        >
                            <span>Buka Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                )}

                {/* Notes & Archived Job Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm text-slate-900">Catatan Tambahan</h3>
                            <button
                                onClick={() => setEditingNotes(!editingNotes)}
                                className="text-xs text-indigo-500 hover:underline font-medium"
                            >
                                {editingNotes ? 'Batal' : 'Edit Catatan'}
                            </button>
                        </div>
                        {editingNotes ? (
                            <div className="space-y-2">
                                <textarea
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                                />
                                <button
                                    onClick={handleSaveNotes}
                                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Simpan</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 min-h-[80px]">
                                {application.notes || 'Belum ada catatan.'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-sm text-slate-900">Archived Job Description</h3>
                        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
                            {application.archivedJobDescription || 'Tidak ada snapshot deskripsi lowongan.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Interview Stages */}
            <InterviewStageList
                applicationId={application.id}
                stages={application.interviewStages || []}
                onRefresh={fetchDetail}
            />
        </div>
    );
}
