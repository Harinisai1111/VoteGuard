
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, ClipboardList, LogOut, ShieldCheck, UserCog, Building2, Map, FileText, Layers } from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.InternalHTMLAttributes<HTMLDivElement>['children'];
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: [UserRole.ELECTION_OFFICER, UserRole.ADMIN] },
    { name: 'National Roll', path: '/voters', icon: Users, roles: [UserRole.ELECTION_OFFICER, UserRole.ADMIN, UserRole.MUNICIPAL_OFFICER] },
    { name: 'Integrity Flags', path: '/flagged', icon: AlertTriangle, roles: [UserRole.ELECTION_OFFICER, UserRole.ADMIN] },
    { name: 'Clash Center', path: '/clashes', icon: Layers, roles: [UserRole.ELECTION_OFFICER, UserRole.ADMIN] },
    { name: 'Death Registry', path: '/municipal-upload', icon: FileText, roles: [UserRole.MUNICIPAL_OFFICER, UserRole.ADMIN] },
    { name: 'Verification Tasks', path: '/field-tasks', icon: ClipboardList, roles: [UserRole.FIELD_OFFICER, UserRole.ADMIN] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 mb-1 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect x="15" y="25" width="70" height="15" fill="#FF9933" transform="rotate(-45 50 50)" />
              <rect x="15" y="42.5" width="70" height="15" fill="#FFFFFF" stroke="#000" strokeWidth="0.5" transform="rotate(-45 50 50)" />
              <rect x="15" y="60" width="70" height="15" fill="#138808" transform="rotate(-45 50 50)" />
              <circle cx="75" cy="15" r="5" fill="#A5C9E1" />
              <circle cx="85" cy="28" r="5" fill="#A5C9E1" />
              <circle cx="95" cy="41" r="5" fill="#A5C9E1" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">भारत निर्वाचन आयोग</h1>
            <h2 className="font-bold text-slate-400 text-[9px] uppercase tracking-widest">Election Commission of India</h2>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {filteredNav.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border-l-4 ${location.pathname === item.path
                ? 'bg-blue-600/10 text-white border-blue-600 shadow-inner'
                : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-slate-950/40 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs font-black text-white shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{user.name}</p>
              <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded bg-red-900/10 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            End Session
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col">
        <header className="h-16 bg-white border-b-2 border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">National Roll Access</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                Decision Support System
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                Ministry of Law & Justice • Govt. of India
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-blue-50/50 px-4 py-2 rounded-none border border-blue-100">
              <Map className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Node: {user.district || 'ALL_INDIA'}</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
                <span className="text-[10px] font-black text-slate-900 uppercase">Secure Connection</span>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">AES-256 Encrypted</span>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto w-full flex-1">
          {children}
        </div>

        <footer className="bg-white border-t border-slate-100 p-4 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">
            Digital India • NIC • Election Commission of India © 2024
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
