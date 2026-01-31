
import React from 'react';
import { AlertTriangle, MapPin, ChevronRight, Fingerprint, History, CheckCircle2, FileText } from 'lucide-react';
import { Voter } from '../types';
import { useNavigate } from 'react-router-dom';

interface FlaggedVotersPageProps {
  voters: Voter[];
}

const FlaggedVotersPage: React.FC<FlaggedVotersPageProps> = ({ voters }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<'active' | 'history'>('active');
  const [filterState, setFilterState] = React.useState('All');

  const states = ['All', ...Array.from(new Set(voters.map(v => v.state)))];

  const flaggedVoters = voters
    .filter(v => v.isFlagged && !v.isArchived)
    .filter(v => filterState === 'All' || v.state === filterState)
    .sort((a, b) => b.riskScore - a.riskScore);

  const historyVoters = voters
    .filter(v => (v.flaggedHistory && v.flaggedHistory.length > 0))
    .filter(v => filterState === 'All' || v.state === filterState)
    .sort((a, b) => {
      const lastA = a.flaggedHistory![a.flaggedHistory!.length - 1].timestamp;
      const lastB = b.flaggedHistory![b.flaggedHistory!.length - 1].timestamp;
      return new Date(lastB).getTime() - new Date(lastA).getTime();
    });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Voter Integrity Intercepts</h1>
          <p className="text-slate-500 text-sm font-medium">Automatic system flagging based on metadata anomalies.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 pl-4 pr-8 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:border-slate-900"
            >
              {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All Jurisdictions' : s}</option>)}
            </select>
            <ChevronRight className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('active')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'active' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
              Active Flags
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center gap-2 ${viewMode === 'history' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
                }`}
            >
              <History className="w-3 h-3" /> Cleared Logs
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'active' ? (
        <div className="space-y-6">
          {flaggedVoters.map((voter) => (
            <div key={voter.id} className="bg-white border-2 border-slate-900 overflow-hidden flex flex-col md:flex-row group hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all">
              <div className={`w-3 shrink-0 ${voter.riskScore >= 90 ? 'bg-red-600' :
                voter.riskScore >= 70 ? 'bg-orange-600' : 'bg-yellow-500'
                }`} />
              <div className="flex-1 p-6 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{voter.name}</h3>
                      <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">{voter.id}</p>
                    </div>
                    <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      Critical Level: {voter.riskScore}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{voter.state} / {voter.district}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" />
                      <span>Aadhaar Rev: {voter.aadhaarMeta?.syncRevision || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 border-l-4 border-slate-900">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inconsistency Report</p>
                    <ul className="space-y-1">
                      {voter.flaggedReasons.map((reason, idx) => (
                        <li key={idx} className="text-[11px] font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-red-600">•</span> {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="w-full md:w-56 flex flex-col justify-between pt-4 md:pt-0">
                  <div className="p-3 bg-slate-900 text-white rounded text-center">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Verification Status</p>
                    <p className="text-[10px] font-black uppercase tracking-widest">Pending Officer Action</p>
                  </div>

                  <button
                    onClick={() => navigate(`/voters/${voter.id}`)}
                    className="w-full mt-4 border-2 border-slate-900 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    Enter Verification Terminal <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {flaggedVoters.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-300 rounded-xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No Active Flags Detected</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {historyVoters.map((voter) => (
            <div key={voter.id} className="bg-white border-2 border-slate-200 shadow-sm p-6 relative">
              <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">Resolved</div>

              {voter.flaggedHistory?.map((log, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 pr-0 md:pr-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase">{voter.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">{voter.id}</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-black uppercase border border-green-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {log.resolution}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">
                      {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">By {log.resolvedBy}</p>
                  </div>

                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="bg-slate-50 p-3 border border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Officer Remarks
                      </p>
                      <p className="text-[11px] font-bold text-slate-700 italic">"{log.remarks}"</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cleared Flags</p>
                      <div className="flex flex-wrap gap-2">
                        {log.originalFlags.map((flag, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-500 px-2 py-1 text-[9px] font-bold uppercase border border-slate-200 line-through decoration-slate-400">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {historyVoters.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-300 rounded-xl">
              <History className="w-12 h-12 mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest">No Resolution History Found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlaggedVotersPage;
