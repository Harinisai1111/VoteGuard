
import React, { useState } from 'react';
import { User as UserIcon, Lock, AlertCircle, ArrowRight, Fingerprint, Globe, Shield } from 'lucide-react';
import { MOCK_USERS } from '../constants';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = MOCK_USERS.find(u => 
      u.name.toLowerCase().includes(username.toLowerCase().trim())
    );
    
    if (foundUser && password === 'admin123') {
      onLogin(foundUser);
    } else {
      setError('अमान्य प्रमाण-पत्र। कृपया पुनः प्रयास करें। (Invalid Credentials)');
    }
  };

  const quickLogin = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
         <svg viewBox="0 0 100 100" className="w-[1000px] h-[1000px]">
            <rect x="15" y="25" width="70" height="15" fill="#FF9933" transform="rotate(-45 50 50)" />
            <rect x="15" y="42.5" width="70" height="15" fill="#FFFFFF" transform="rotate(-45 50 50)" />
            <rect x="15" y="60" width="70" height="15" fill="#138808" transform="rotate(-45 50 50)" />
         </svg>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 space-y-6">
          <div className="inline-flex flex-col items-center gap-6">
             <div className="w-32 h-32 bg-white p-4 rounded-full shadow-2xl border-2 border-slate-100">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="15" y="25" width="70" height="15" fill="#FF9933" transform="rotate(-45 50 50)" />
                  <rect x="15" y="42.5" width="70" height="15" fill="#FFFFFF" stroke="#000" strokeWidth="0.5" transform="rotate(-45 50 50)" />
                  <rect x="15" y="60" width="70" height="15" fill="#138808" transform="rotate(-45 50 50)" />
                  <circle cx="75" cy="15" r="5" fill="#A5C9E1" />
                  <circle cx="85" cy="28" r="5" fill="#A5C9E1" />
                  <circle cx="95" cy="41" r="5" fill="#A5C9E1" />
                </svg>
             </div>
             <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">भारत निर्वाचन आयोग</h1>
                <h2 className="text-xl font-bold text-slate-700 tracking-tight uppercase">Election Commission of India</h2>
             </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-0.5 w-10 bg-slate-200" />
            <div className="bg-slate-900 text-white py-1.5 px-6 rounded-none text-[10px] font-black uppercase tracking-[0.4em] shadow-lg">
              VOTEGUARD SECURE PORTAL
            </div>
            <div className="h-0.5 w-10 bg-slate-200" />
          </div>
        </div>

        <div className="bg-white border-[6px] border-slate-900 rounded-none p-10 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="text-xs font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-[0.3em] border-b-2 border-slate-100 pb-6">
            <Fingerprint className="w-6 h-6 text-blue-600" />
            Staff Identity terminal
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Staff Identification Code</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Official ID / Name"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-none text-sm text-slate-900 font-black focus:border-slate-900 outline-none transition-all placeholder:text-slate-200 uppercase tracking-widest"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Access Credential</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-none text-sm text-slate-900 font-black focus:border-slate-900 outline-none transition-all placeholder:text-slate-200"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-4 p-4 bg-red-50 border-l-4 border-red-600 text-[11px] text-red-700 font-black uppercase tracking-widest leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-blue-700 text-white font-black py-5 uppercase tracking-[0.5em] text-xs transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
            >
              Initiate Login <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-100">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-6 text-center italic">Development Access Gateways</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => quickLogin(UserRole.ELECTION_OFFICER)} className="px-2 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[7px] font-black text-slate-500 hover:text-blue-700 transition-all uppercase tracking-[0.1em] text-center">Officer</button>
              <button onClick={() => quickLogin(UserRole.FIELD_OFFICER)} className="px-2 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[7px] font-black text-slate-500 hover:text-blue-700 transition-all uppercase tracking-[0.1em] text-center">Field (SIR)</button>
              <button onClick={() => quickLogin(UserRole.MUNICIPAL_OFFICER)} className="px-2 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[7px] font-black text-slate-500 hover:text-blue-700 transition-all uppercase tracking-[0.1em] text-center">Municipal</button>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center space-y-6">
          <div className="flex items-center justify-center gap-10">
             <div className="flex flex-col items-center group cursor-help">
                <Shield className="w-8 h-8 text-slate-200 group-hover:text-blue-400 transition-colors" />
                <span className="text-[9px] font-black text-slate-400 uppercase mt-2 tracking-widest">SSL Enabled</span>
             </div>
             <div className="flex flex-col items-center group cursor-help">
                <Globe className="w-8 h-8 text-slate-200 group-hover:text-blue-400 transition-colors" />
                <span className="text-[9px] font-black text-slate-400 uppercase mt-2 tracking-widest">National Grid</span>
             </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">
              Ministry of Electronics & Information Technology
            </p>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
              National Informatics Centre (NIC) • Govt. of India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
