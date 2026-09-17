'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Building2, PenTool, Calendar, BarChart2 } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'Find Job',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
        { name: 'Applications', href: '/applications', icon: Briefcase },
        { name: 'Companies', href: '/companies', icon: Building2 },
      ],
    },
    {
      title: 'Content',
      items: [
        { name: 'Dashboard', href: '/content/dashboard', icon: BarChart2 },
        { name: 'Kanban Board', href: '/content', icon: PenTool, exact: true },
        { name: 'Calendar', href: '/content/calendar', icon: Calendar },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-screen sticky top-0 flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Workspace</h1>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h2 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="px-3 py-2 text-xs text-slate-400 font-medium">
          Personal Workspace
        </div>
      </div>
    </aside>
  );
}
