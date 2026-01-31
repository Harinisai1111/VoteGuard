
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, AlertTriangle, XCircle, Trash2, UserMinus, RefreshCw, FileText, Fingerprint, Calendar, Clock, Search, Eye, Cpu, ScanSearch, Layers, ArrowRightCircle, CheckCircle2, FileWarning, ShieldAlert, WifiOff } from 'lucide-react';
import { Voter } from '../types';
import { getRiskExplanation, analyzeIdentityOverlap } from '../services/geminiService';

interface VoterDetailPageProps {
  voters: Voter[];
  onUpdateVoter: (v: Voter) => void;
}

const VoterDetailPage: React.FC<VoterDetailPageProps> = ({ voters, onUpdateVoter }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voter, setVoter] = useState<Voter | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<'none' | 'quota' | 'general'>('none');
  
  // Conflict State
  const [conflictingRecords, setConflictingRecords] = useState<Voter[]>([]);
  const [overlapAdvice, setOverlapAdvice] = useState<string>('');
  const [isAnalyzingOverlap, setIsAnalyzingOverlap] = useState(false);

  useEffect(() => {
    const found = voters.find(v => v.id === id);
    if (found) {
      setVoter(found);
      
      // Find other records with same Aadhaar Hash
      if (found.aadhaarMeta?.aadhaarIdHash) {
        const conflicts = voters.filter(v => 
          v.id !== found.id && 
          v.aadhaarMeta?.aadhaarIdHash === found.aadhaarMeta?.aadhaarIdHash &&
          !v.isArchived
        );
        setConflictingRecords(conflicts);
      }

      if (found.isFlagged && !explanation) {
        loadExplanation(found);
      } else {
        setLoading(false);
      }
    }
  }, [id, voters]);

  const loadExplanation = async (v: Voter) => {
    setLoading(true);
    setErrorStatus('none');
    try {
      const res = await getRiskExplanation(v);
      if (res.includes("Rate Limit reached") || res.includes("throttled")) {
        setErrorStatus('quota');
      }
      setExplanation(res);
    } catch (err) {
      setErrorStatus('general');
      setExplanation("Could not load AI analysis at this time.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlapAnalysis = async () => {
    if (!voter || conflictingRecords.length === 0) return;
    setIsAnalyzingOverlap(true);
    const advice = await analyzeIdentityOverlap([voter, ...conflictingRecords]);
    setOverlapAdvice(advice);
    setIsAnalyzingOverlap(false);
  };

  const processRemoval = (reason: 'Shifted' | 'Deceased' | 'Duplicate') => {
    if (!voter) return;
    const updated = { 
      ...voter, 
      status: reason, 
      isArchived: true, 
      riskScore: 0, 
      isFlagged: false 
    };
    onUpdateVoter(updated);
    alert(`System Notice: Record ${voter.id} decommissioned as ${reason}.`);
    navigate('/voters');
  };

  if (!voter) return <div className="p-20 text-center font-black uppercase text-slate-300 tracking-widest">Accessing Secure Datastream...</div>;

  const hasAadhaar = !!voter.aadhaarMeta;
  const hasSecondaryID = !!voter.otherIdMeta;
  const isDocViolation = !hasAadhaar && !hasSecondaryID;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center gap-2">
            ← Registry Roll
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Identity Dossier: {voter.id}</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Electronic Photo Identity Card (EPIC) Record</span>
          </div>
        </div>
        
        <div className="flex gap-4">
           {isDocViolation && (
             <div className="bg-red-600 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-200">
               <FileWarning className="w-4 h-4" />
               No Identity Proof Linked
             </div>
           )}
           {conflictingRecords.length > 0 && (
             <div className="bg-orange-600 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse shadow-lg shadow-orange-200">
               <AlertTriangle className="w-4 h-4" />
               Aadhaar Conflict Detected
             </div>
           )}
           <div className="bg-green-50 text-green-700 border-2 border-green-600 px-5 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" />
             Verified Access
           </div>
        </div>
      </div>

      {errorStatus === 'quota' && (
        <div className="bg-amber-50 border-2 border-amber-600 p-6 flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <WifiOff className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm font-black text-amber-900 uppercase">System Throttled: API Quota Exceeded</p>
              <p className="text-[10px] font-bold text-amber-700 uppercase">
                The AI Decision engine has reached its request limit. Intelligence features may be temporarily limited.
              </p>
            </div>
          </div>
          <button 
            onClick={() => voter && loadExplanation(voter)}
            className="bg-amber-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all"
          >
            Retry Analytics
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          
          {/* CROSS-NODE CONFLICT DASHBOARD */}
          {conflictingRecords.length > 0 && (
            <section className="bg-white border-4 border-orange-600 p-0 shadow-[12px_12px_0px_0px_rgba(234,88,12,1)] overflow-hidden">
              <div className="bg-orange-600 text-white px-8 py-4 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                  <Layers className="w-5 h-5" />
                  Cross-Node Identity Conflict Dashboard
                </h3>
                <span className="text-[9px] font-black uppercase tracking-widest bg-orange-900 px-3 py-1">
                  SHARED AADHAAR: {voter.aadhaarMeta?.aadhaarIdHash}
                </span>
              </div>

              <div className="p-8 space-y-8">
                <p className="text-[11px] font-bold text-orange-900 uppercase leading-tight tracking-wider bg-orange-50 p-4 border-l-4 border-orange-600">
                  SYSTEM ALERT: Multi-EPIC registration detected sharing the same Aadhaar. Verify active habitation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 border-slate-900 p-5 bg-slate-50 relative">
                    <span className="absolute -top-3 left-4 bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest">Current View</span>
                    <div className="space-y-3">
                      <p className="text-sm font-black text-slate-900 uppercase">{voter.name}</p>
                      <div className="space-y-1 text-[10px] font-bold text-slate-500 uppercase">
                        <p className="flex justify-between"><span>ID:</span> <span className="text-slate-900 font-mono">{voter.id}</span></p>
                        <p className="flex justify-between"><span>Aadhaar:</span> <span className="text-green-600">LINKED</span></p>
                        <p className="flex justify-between"><span>Location:</span> <span className="text-slate-900">{voter.state}</span></p>
                      </div>
                    </div>
                  </div>

                  {conflictingRecords.map((conf, idx) => (
                    <div key={idx} className="border-2 border-orange-200 p-5 bg-orange-50/30 relative">
                      <span className="absolute -top-3 left-4 bg-orange-600 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest">Conflict Node</span>
                      <div className="space-y-3">
                        <p className="text-sm font-black text-slate-900 uppercase">{conf.name}</p>
                        <div className="space-y-1 text-[10px] font-bold text-slate-500 uppercase">
                          <p className="flex justify-between"><span>ID:</span> <span className="text-orange-600 font-mono">{conf.id}</span></p>
                          <p className="flex justify-between"><span>Verified:</span> <span className="text-slate-900">{conf.lastVerifiedYear}</span></p>
                          <p className="flex justify-between"><span>Location:</span> <span className="text-slate-900">{conf.state}</span></p>
                        </div>
                        <button 
                          onClick={() => navigate(`/voters/${conf.id}`)}
                          className="w-full mt-2 text-[8px] font-black uppercase text-blue-600 hover:underline flex items-center justify-center gap-1"
                        >
                          View Counter-Record <ArrowRightCircle className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t-2 border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" /> AI Resolution Guidance
                    </h4>
                    {!overlapAdvice && !isAnalyzingOverlap && (
                      <button 
                        onClick={handleOverlapAnalysis}
                        className="bg-blue-600 text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md"
                      >
                        Generate Resolution Strategy
                      </button>
                    )}
                  </div>
                  {isAnalyzingOverlap && (
                    <div className="p-4 bg-slate-50 border border-slate-200 animate-pulse text-[10px] font-black text-slate-400 text-center uppercase">
                      Cross-referencing historical revisions [Retrying for quota]...
                    </div>
                  )}
                  {overlapAdvice && (
                    <div className="p-5 bg-blue-900 text-blue-50 font-mono text-[10px] leading-relaxed uppercase border-l-8 border-blue-400">
                      {overlapAdvice}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Main Identity Card */}
          <section className="bg-white border-[6px] border-slate-900 p-10 shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden group">
            <div className="absolute top-8 right-8 text-[60px] font-black text-slate-50 opacity-20 select-none pointer-events-none uppercase">ECI OFFICIAL</div>
            
            <div className="flex flex-col md:flex-row gap-12 relative z-10">
              <div className="w-40 h-52 bg-slate-100 border-4 border-slate-900 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="text-[10px] text-slate-400 text-center p-4 font-black uppercase tracking-tight leading-tight">Portrait Imagery System Restricted</div>
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white text-[9px] text-center font-black py-2 tracking-widest">SUBJECT PHOTO</div>
              </div>
              
              <div className="flex-1 space-y-8">
                <div>
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 border-b border-slate-100 inline-block">Legal Descriptor</h2>
                  <p className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{voter.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-10">
                   <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Birth Registry</h3>
                     <p className="text-base font-black text-slate-900 uppercase">{voter.dob}</p>
                   </div>
                   <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Administrative Node</h3>
                     <p className="text-base font-black text-slate-900 uppercase">{voter.district}</p>
                   </div>
                   <div className="col-span-2">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Registered Habitation</h3>
                     <p className="text-sm font-black text-slate-900 leading-relaxed uppercase">{voter.address}</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* Identity Metadata Panels */}
          <section className="bg-slate-900 text-white p-8 border-t-8 border-blue-600 shadow-xl space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-blue-400" />
              Verified Identity Proofs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-5 border border-white/10 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aadhaar (UIDAI)</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${hasAadhaar ? 'bg-green-600' : 'bg-red-600'}`}>
                    {hasAadhaar ? 'LINKED' : 'UNLINKED'}
                  </span>
                </div>
                {voter.aadhaarMeta ? (
                  <div className="space-y-2 text-[11px] font-bold text-slate-200">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Revision</span><span>v{voter.aadhaarMeta.syncRevision}.0</span></div>
                    <div className="flex justify-between"><span>Dedupe Hash</span><span className="font-mono text-blue-400">{voter.aadhaarMeta.aadhaarIdHash}</span></div>
                  </div>
                ) : <p className="text-[10px] italic text-slate-500 uppercase tracking-widest">No biometric record.</p>}
              </div>

              <div className={`p-5 border space-y-4 bg-white/5 border-white/10`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Alt Identity Proof</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${hasSecondaryID ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    {hasSecondaryID ? 'SUBMITTED' : 'NOT SUPPLIED'}
                  </span>
                </div>
                {voter.otherIdMeta ? (
                  <div className="space-y-2 text-[11px] font-bold text-slate-100">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>Type</span><span>{voter.otherIdMeta.type}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span>ID No.</span><span>{voter.otherIdMeta.idNumber}</span></div>
                    <div className="flex justify-between"><span>Name on ID</span><span>{voter.otherIdMeta.nameOnId}</span></div>
                  </div>
                ) : (
                   <div className="space-y-2">
                     <p className="text-[9px] font-black text-slate-500 uppercase">Optional Reference</p>
                     <p className="text-[10px] text-slate-400 leading-tight">No alternative documentation linked to this EPIC profile.</p>
                   </div>
                )}
              </div>
            </div>
          </section>

          {/* Protocol Actions */}
          <section className="bg-red-50 border-4 border-red-600 p-8 space-y-6">
             <div className="flex items-center gap-3">
               <Trash2 className="w-6 h-6 text-red-600" />
               <h3 className="text-sm font-black text-red-900 uppercase tracking-[0.2em]">Registry Decommission Terminal</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => processRemoval('Duplicate')} className="bg-white border-2 border-red-600 px-4 py-3 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Resolve Duplicate
                </button>
                <button onClick={() => processRemoval('Deceased')} className="bg-white border-2 border-red-600 px-4 py-3 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                  <UserMinus className="w-4 h-4" /> Mark Deceased
                </button>
                <button onClick={() => processRemoval('Shifted')} className="bg-white border-2 border-red-600 px-4 py-3 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" /> Confirm Shifted
                </button>
             </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Risk Profile Panel */}
          <div className={`p-8 border-4 ${voter.isFlagged || isDocViolation ? 'bg-orange-50 border-orange-600' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Integrity Score</h3>
              <div className={`w-12 h-12 flex items-center justify-center text-lg font-black rounded-full border-4 ${
                voter.riskScore > 80 || isDocViolation ? 'bg-red-600 text-white border-red-900 shadow-lg animate-pulse' :
                'bg-green-500 text-white border-green-700'
              }`}>
                {isDocViolation ? '95' : (conflictingRecords.length > 0 ? '99' : voter.riskScore)}
              </div>
            </div>
            
            {(voter.isFlagged || isDocViolation) ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-orange-900 uppercase tracking-widest">Active Flags</p>
                  {isDocViolation && (
                    <div className="bg-red-600 p-3 border border-red-900 text-[10px] font-black text-white uppercase flex gap-2">
                      <span className="shrink-0 text-white">⚠</span> CRITICAL: NO IDENTITY PROOF FOUND
                    </div>
                  )}
                  {voter.flaggedReasons.map((r, i) => (
                    <div key={i} className="bg-white/80 p-3 border border-orange-200 text-[10px] font-bold text-orange-900 uppercase flex gap-2">
                      <span className="shrink-0 text-red-600">⚠</span> {r}
                    </div>
                  ))}
                </div>
                
                <div className={`p-4 border-2 border-dashed ${errorStatus === 'quota' ? 'bg-amber-50 border-amber-300' : 'bg-orange-100/50 border-orange-300'}`}>
                  <p className="text-[9px] font-black text-orange-900 uppercase mb-2">AI Signal Explanation</p>
                  <p className={`text-[11px] font-bold leading-relaxed italic ${errorStatus === 'quota' ? 'text-amber-800' : 'text-orange-800'}`}>
                    {loading ? 'Performing cluster audit [Pending Quota]...' : explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 opacity-40">
                <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Record</p>
              </div>
            )}
          </div>

          <div className="bg-white border-2 border-slate-900 p-8 space-y-6">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] border-b border-slate-100 pb-2">Administrative Context</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Verification History</p>
                  <p className="text-xs font-black text-slate-900 uppercase">{voter.lastVerifiedYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Registry Status</p>
                  <p className="text-xs font-black text-blue-600 uppercase">{voter.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDetailPage;
