
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, AlertCircle, ArrowRight, UserCheck, ShieldAlert, MapPin, Fingerprint, Calendar } from 'lucide-react';
import { Voter } from '../types';

interface IdentityClashPageProps {
  voters: Voter[];
}

const IdentityClashPage: React.FC<IdentityClashPageProps> = ({ voters }) => {
  const navigate = useNavigate();

  // Group active voters by Aadhaar ID Hash
  const activeVoters = voters.filter(v => !v.isArchived);
  const clashClusters: Record<string, Voter[]> = {};
  
  activeVoters.forEach(v => {
    if (v.aadhaarMeta?.aadhaarIdHash) {
      const hash = v.aadhaarMeta.aadhaarIdHash;
      if (!clashClusters[hash]) clashClusters[hash] = [];
      clashClusters[hash].push(v);
    }
  });

  // Filter only clusters with more than one EPIC record
  const actualClashes = Object.entries(clashClusters).filter(([_, group]) => group.length > 1);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b-4 border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <Layers className="w-8 h-8 text-red-600" />
            Aadhaar Identity Clash Center
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">
            Cross-Node De-duplication Terminal • {actualClashes.length} Detected Clusters
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-red-50 border-2 border-red-600 px-6 py-2 flex flex-col justify-center">
            <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">Critical Anomalies</span>
            <span className="text-xl font-black text-red-900 leading-none">{actualClashes.length}</span>
          </div>
        </div>
      </div>

      {actualClashes.length === 0 ? (
        <div className="py-32 text-center bg-white border-2 border-dashed border-slate-200">
          <UserCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em]">No Multi-ID Clashes Detected</p>
        </div>
      ) : (
        <div className="space-y-12">
          {actualClashes.map(([hash, cluster]) => (
            <div key={hash} className="bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden group">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    CONFLICT CLUSTER
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">
                    AADHAAR ANCHOR: <span className="text-white">{hash}</span>
                  </span>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Detected Overlap: {cluster.length} Records
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cluster.map((voter) => (
                    <div key={voter.id} className="relative border-2 border-slate-100 p-6 hover:border-red-600 hover:bg-red-50/30 transition-all flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase leading-none">{voter.name}</p>
                            <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-tighter">EPIC: {voter.id}</p>
                          </div>
                          <div className={`text-[8px] font-black px-2 py-0.5 rounded ${voter.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {voter.status.toUpperCase()}
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-100 pt-4">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
                             <MapPin className="w-3 h-3 text-blue-500" />
                             <span className="truncate">{voter.state}, {voter.district}</span>
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
                             <Calendar className="w-3 h-3 text-slate-400" />
                             <span>Last verified: {voter.lastVerifiedYear}</span>
                           </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate(`/voters/${voter.id}`)}
                        className="mt-6 w-full py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                      >
                        Inspect Node <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Resolution Guidance Box */}
                  <div className="bg-red-50 border-2 border-dashed border-red-200 p-6 flex flex-col items-center justify-center text-center space-y-3">
                     <AlertCircle className="w-8 h-8 text-red-600 opacity-20" />
                     <p className="text-[10px] font-black text-red-900 uppercase leading-tight tracking-widest">
                       Resolution Protocol Required
                     </p>
                     <p className="text-[9px] font-bold text-red-700 uppercase leading-relaxed">
                       Subject has multiple EPIC registrations across {new Set(cluster.map(v => v.state)).size} state nodes. Compare verification timestamps to identify active habitation.
                     </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-orange-600" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Administrative Alert: Record {cluster[0].id} and {cluster[1].id} sharing Identity Hash {hash} have been flagged for National Inquiry.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-900 text-white p-10 border-l-[12px] border-blue-400">
         <div className="flex items-start gap-6">
            <Fingerprint className="w-10 h-10 text-blue-400 shrink-0" />
            <div className="space-y-2">
               <h3 className="text-sm font-black uppercase tracking-[0.2em]">De-duplication Logic Engine</h3>
               <p className="text-[11px] font-bold text-blue-100 uppercase leading-relaxed tracking-wider">
                 Our system identifies "Shadow Identities" by cross-referencing Aadhaar hashes across all 36 States/UTs. 
                 Voters who migrate and apply for a new EPIC without decommissioning the old one are automatically flagged here. 
                 Election Officers must verify the current residence and decommissioning the redundant node immediately.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default IdentityClashPage;
