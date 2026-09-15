import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Job Tracker App — Melacak & Menata Lamaran Kerja',
  description: 'Aplikasi pelacak proses lamaran kerja dan direktori perusahaan target.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        <div className="min-h-screen flex bg-white text-gray-900">
          <Sidebar />
          <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
