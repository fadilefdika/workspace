import type { Metadata } from'next';
import'./globals.css';
import Navbar from'@/components/layout/Navbar';

export const metadata: Metadata = {
 title:'Job Tracker App — Melacak & Menata Lamaran Kerja',
 description:'Aplikasi pelacak proses lamaran kerja dan direktori perusahaan target.',
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="id">
 <body className="antialiased selection:bg-blue-500 selection:text-white">
 <div className="min-h-screen flex flex-col bg-white text-gray-900">
 <Navbar />
 <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {children}
 </main>
 </div>
 </body>
 </html>
 );
}

