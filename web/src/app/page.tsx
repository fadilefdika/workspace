'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Application, DashboardFunnel, DashboardMonthly, DashboardSummary } from '@/types';
import StatCards from '@/components/dashboard/StatCards';
import FunnelChart from '@/components/dashboard/FunnelChart';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import FollowUpReminders from '@/components/dashboard/FollowUpReminders';
import Link from 'next/link';
import { Plus, Building2, Briefcase } from 'lucide-react';

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [funnel, setFunnel] = useState<DashboardFunnel | null>(null);
    const [monthly, setMonthly] = useState<DashboardMonthly[]>([]);
    const [followUps, setFollowUps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [sumData, funData, monData, folData] = await Promise.all([
                    apiClient.get<DashboardSummary>('/dashboard/summary'),
                    apiClient.get<DashboardFunnel>('/dashboard/funnel'),
                    apiClient.get<DashboardMonthly[]>('/dashboard/monthly'),
                    apiClient.get<Application[]>('/dashboard/follow-ups'),
                ]);
                setSummary(sumData);
                setFunnel(funData);
                setMonthly(monData);
                setFollowUps(folData);
            } catch (err) {
                console.error('Failed to load dashboard data', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">Memuat Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-medium text-slate-900">
                        Dashboard Karir & Lamaran
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Pantau ringkasan statistik, progres per tahapan, dan pengingat follow-up
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <Link
                        href="/companies/new"
                        className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-all shadow-sm"
                    >
                        <span>Target Perusahaan</span>
                    </Link>
                    <Link
                        href="/applications/new"
                        className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-sm"
                    >
                        <span>Tambah Lamaran</span>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <StatCards summary={summary} />

            {/* Follow-up Reminders */}
            <FollowUpReminders followUps={followUps} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FunnelChart funnel={funnel} />
                <MonthlyChart monthly={monthly} />
            </div>
        </div>
    );
}

