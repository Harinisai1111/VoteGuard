import React, { useState } from 'react';
import { Mail, Key, ChevronLeft, Fingerprint, AlertCircle, ArrowRight, Shield, Globe } from 'lucide-react';
import { useSignIn } from '@clerk/clerk-react';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoggingIn(true);
    setError('');

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: email,
      });

      const emailCodeFactor = supportedFirstFactors?.find(
        (f) => f.strategy === 'email_code'
      );

      if (emailCodeFactor) {
        // @ts-ignore
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setVerifying(true);
      } else {
        setError('This email does not support code verification. Please contact admin.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        setError('खाता नहीं मिला। कृपया अपने आधिकारिक सरकारी ईमेल का उपयोग करें। (Account not found. Use official Gov email)');
      } else {
        setError('लॉगिन शुरू करने में त्रुटि। (Error initiating login)');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoggingIn(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        console.error(result);
        setError('सत्यापन अधूरा है। (Verification incomplete.)');
      }
    } catch (err: any) {
      console.error(err);
      setError('अमान्य कोड। कृपया पुनः प्रयास करें। (Invalid code. Try again)');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const quickLogin = async (role: UserRole) => {
    setError(`Quick login for ${role} is disabled for security. Use your Email OTP.`);
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
          <div className="mb-10 border-b-2 border-slate-100 pb-6 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 flex items-center gap-4 uppercase tracking-[0.3em]">
              <Fingerprint className="w-6 h-6 text-blue-600" />
              {verifying ? 'Code Verification' : 'Staff Identity terminal'}
            </h2>
            {verifying && (
              <button
                onClick={() => setVerifying(false)}
                className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}
          </div>

          {!verifying ? (
            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Staff Official Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gov.in"
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
                disabled={isLoggingIn || !isLoaded}
                className="w-full bg-slate-900 hover:bg-blue-700 text-white font-black py-5 uppercase tracking-[0.5em] text-xs transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Sending Code...' : 'Send Access Code'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Enter 6-Digit Verification Code</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-none text-sm text-slate-900 font-black focus:border-slate-900 outline-none transition-all placeholder:text-slate-200 tracking-[1em] text-center"
                    required
                  />
                </div>
                <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Verification code sent to <span className="text-slate-900 underline">{email}</span>
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-4 p-4 bg-red-50 border-l-4 border-red-600 text-[11px] text-red-700 font-black uppercase tracking-widest leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn || !isLoaded}
                className="w-full bg-slate-900 hover:bg-blue-700 text-white font-black py-5 uppercase tracking-[0.5em] text-xs transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Verifying...' : 'Validate & Initiate Session'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-100">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-6 text-center italic">Development Access Gateways</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => quickLogin(UserRole.ELECTION_OFFICER)} className="px-2 py-3 bg-slate-50 opacity-50 cursor-not-allowed border border-slate-200 text-[7px] font-black text-slate-500 uppercase tracking-[0.1em] text-center">Officer</button>
              <button onClick={() => quickLogin(UserRole.FIELD_OFFICER)} className="px-2 py-3 bg-slate-50 opacity-50 cursor-not-allowed border border-slate-200 text-[7px] font-black text-slate-500 uppercase tracking-[0.1em] text-center">Field (SIR)</button>
              <button onClick={() => quickLogin(UserRole.MUNICIPAL_OFFICER)} className="px-2 py-3 bg-slate-50 opacity-50 cursor-not-allowed border border-slate-200 text-[7px] font-black text-slate-500 uppercase tracking-[0.1em] text-center">Municipal</button>
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
