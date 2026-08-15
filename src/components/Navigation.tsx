"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, QrCode, Settings, LayoutDashboard, Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function Navigation({ session }: { session: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const isTeacher = session?.user?.role === "TEACHER";

  const closeMenu = () => setMobileMenuOpen(false);

  const NavLinks = () => (
    <>
      <div className="p-6 md:p-6 p-4">
        <h1 className="text-3xl font-bold tracking-wider text-indigo-300">SPTA</h1>
        <p className="text-xs text-indigo-400 mt-1 uppercase tracking-widest font-semibold">Management System</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-2 md:mt-6">
        <Link href="/" onClick={closeMenu} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/' ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20' : 'hover:bg-indigo-900 text-slate-300'}`}>
          <LayoutDashboard size={20} className={pathname === '/' ? 'text-indigo-400' : 'text-slate-400'} />
          <span className="font-medium text-sm tracking-wide">Dashboard</span>
        </Link>
        {!isTeacher && (
          <>
            <Link href="/parents" onClick={closeMenu} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith('/parents') ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20' : 'hover:bg-indigo-900 text-slate-300'}`}>
              <Users size={20} className={pathname.startsWith('/parents') ? 'text-indigo-400' : 'text-slate-400'} />
              <span className="font-medium text-sm tracking-wide">Parents</span>
            </Link>
            <Link href="/finances" onClick={closeMenu} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith('/finances') ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20' : 'hover:bg-indigo-900 text-slate-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={pathname.startsWith('/finances') ? 'text-indigo-400' : 'text-slate-400'}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="font-medium text-sm tracking-wide">Finances</span>
            </Link>
          </>
        )}
        <Link href="/events" onClick={closeMenu} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith('/events') ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20' : 'hover:bg-indigo-900 text-slate-300'}`}>
          <Calendar size={20} className={pathname.startsWith('/events') ? 'text-indigo-400' : 'text-slate-400'} />
          <span className="font-medium text-sm tracking-wide">Events</span>
        </Link>
        <Link href="/scanner" onClick={closeMenu} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith('/scanner') ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20' : 'hover:bg-indigo-900 text-slate-300'}`}>
          <QrCode size={20} className={pathname.startsWith('/scanner') ? 'text-indigo-400' : 'text-slate-400'} />
          <span className="font-medium text-sm tracking-wide">QR Scanner</span>
        </Link>
      </nav>
      <div className="p-4 space-y-2">
        {!isTeacher && (
          <Link href="/settings" onClick={closeMenu} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/settings' ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20' : 'hover:bg-indigo-900 text-slate-300'}`}>
            <Settings size={20} className={pathname === '/settings' ? 'text-indigo-400' : 'text-slate-400'} />
            <span className="font-medium text-sm tracking-wide">Settings</span>
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/settings/users" onClick={closeMenu} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${pathname.startsWith('/settings/users') ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20' : 'hover:bg-indigo-900 text-slate-300'}`}>
            <Users size={20} className={pathname.startsWith('/settings/users') ? 'text-indigo-400' : 'text-slate-400'} />
            <span className="font-medium text-sm tracking-wide">User Management</span>
          </Link>
        )}
        <LogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="w-64 bg-indigo-950 text-white flex-col hidden md:flex h-full shrink-0 z-20 relative">
        <NavLinks />
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex justify-between items-center p-4 bg-indigo-950 text-white shadow-md z-20 relative">
        <h1 className="text-xl font-bold tracking-wider text-indigo-300">SPTA</h1>
        <button 
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="p-2 text-indigo-200 hover:text-white transition-colors flex items-center space-x-2"
        >
          <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-indigo-950 text-white flex justify-around items-center p-2 pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <Link href="/" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${pathname === '/' ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-300'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] mt-1 font-medium">Dashboard</span>
        </Link>
        {!isTeacher && (
          <>
            <Link href="/parents" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${pathname.startsWith('/parents') ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-300'}`}>
              <Users size={24} />
              <span className="text-[10px] mt-1 font-medium">Parents</span>
            </Link>
            <Link href="/finances" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${pathname.startsWith('/finances') ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-[10px] mt-1 font-medium">Finances</span>
            </Link>
          </>
        )}
        <Link href="/scanner" className={`flex flex-col items-center p-2 rounded-xl transition-colors -mt-6 bg-indigo-600 rounded-full shadow-lg border-4 border-slate-50 ${pathname.startsWith('/scanner') ? 'text-white bg-indigo-500' : 'text-indigo-50 hover:bg-indigo-500'}`}>
          <div className="p-2">
            <QrCode size={28} />
          </div>
        </Link>
        <Link href="/events" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${pathname.startsWith('/events') ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-300'}`}>
          <Calendar size={24} />
          <span className="text-[10px] mt-1 font-medium">Events</span>
        </Link>
        {!isTeacher && (
          <Link href="/settings" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${pathname.startsWith('/settings') ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-300'}`}>
            <Settings size={24} />
            <span className="text-[10px] mt-1 font-medium">Settings</span>
          </Link>
        )}
      </nav>
    </>
  );
}
