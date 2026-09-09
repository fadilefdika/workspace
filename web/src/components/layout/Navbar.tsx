'use client';

import Link from'next/link';
import { usePathname } from'next/navigation';

export default function Navbar() {
 const pathname = usePathname();

 const navItems = [
 { name:'Dashboard', href:'/'},
 { name:'Applications', href:'/applications'},
 { name:'Companies', href:'/companies'},
 ];

 return (
 <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {/* Logo */}
 <Link href="/" className="flex items-center space-x-3">
 <div>
 <span className="text-xl font-semibold text-gray-900 tracking-tight">
 Workspace
 </span>
 </div>
 </Link>

 {/* Navigation Links */}
 <nav className="flex items-center space-x-1 sm:space-x-4">
 {navItems.map((item) => {
 const isActive = pathname === item.href || (item.href !=='/'&& pathname.startsWith(item.href));

 return (
 <Link
 key={item.href}
 href={item.href}
 className={`px-3 py-2 text-sm font-medium transition-colors ${
 isActive
 ?'text-black border-b-2 border-black'
 :'text-gray-500 hover:text-black'
 }`}
 >
 {item.name}
 </Link>
 );
 })}
 </nav>
 </div>
 </div>
 </header>
 );
}

