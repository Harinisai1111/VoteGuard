
import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ChevronDown, Globe, Map, ShieldAlert, Fingerprint } from 'lucide-react';
import { Voter } from '../types';
import { useNavigate } from 'react-router-dom';

interface VoterListPageProps {
  voters: Voter[];
}

const VoterListPage: React.FC<VoterListPageProps> = ({ voters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterZone, setFilterZone] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [showInactive, setShowInactive] = useState(false);
  const navigate = useNavigate();

  const filteredVoters = voters.filter(v => {
    const matchesSearch = (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.id.includes(searchTerm));
    const matchesState = filterState === 'All' || v.state === filterState;
    const matchesZone = filterZone === 'All' || v.zone === filterZone;
    const matchesDistrict = filterDistrict === 'All' || v.district === filterDistrict;
    const matchesActive = showInactive || (!v.isArchived && v.status !== 'Deceased' && v.status !== 'Duplicate' && v.status !== 'Shifted');
    
    return matchesSearch && matchesState && matchesZone && matchesDistrict && matchesActive;
  });

  const states = ['All', ...Array.from(new Set(voters.map(v => v.state)))];
  const zones = ['All', ...Array.from(new Set(voters.map(v => v.zone)))];
  const districts = ['All', ...Array.from(new Set(voters.map(v => v.district)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">National Electoral Roll</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Official Registry • {filteredVoters.length} Live Records</p>
        </div>
        
        <div className="flex items-center gap-3">
           <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase cursor-pointer">
             <input 
               type="checkbox" 
               checked={showInactive} 
               onChange={(e) => setShowInactive(e.target.checked)}
               className="w-4 h-4 border-2 border-slate-900 text-slate-900 focus:ring-0" 
             />
             Audit Removed Nodes
           </label>
        </div>
      </div>

      {/* Official Multi-Filter Bar */}
      <div className="bg-white p-6 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Identity / EPIC"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none focus:border-slate-900 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 text-[10px] font-black text-slate-900 uppercase tracking-widest appearance-none outline-none focus:border-slate-900"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="All">All Jurisdictions</option>
            {states.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="relative">
          <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 text-[10px] font-black text-slate-900 uppercase tracking-widest appearance-none outline-none focus:border-slate-900"
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
          >
            <option value="All">All Zones</option>
            {zones.filter(z => z !== 'All').map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div className="relative">
           <div className="bg-slate-900 text-white p-3 text-[9px] font-black uppercase text-center flex items-center justify-center gap-2">
              <Fingerprint className="w-4 h-4" /> Policy: Aadhaar First Enabled
           </div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-[10px] font-black text-slate-100 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-6 py-4">EPIC / EPIC Hash</th>
              <th className="px-6 py-4">Legal Name</th>
              <th className="px-6 py-4">Admin Hub</th>
              <th className="px-6 py-4">Linked ID Proofs</th>
              <th className="px-6 py-4">Roll Status</th>
              <th className="px-6 py-4">Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {filteredVoters.map((voter) => (
              <tr key={voter.id} className={`hover:bg-slate-50 transition-colors ${voter.isArchived ? 'bg-slate-50/50 grayscale' : ''}`}>
                <td className="px-6 py-4">
                  <div className="text-[10px] font-mono font-black text-slate-900">{voter.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-slate-900 text-[11px] uppercase">{voter.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[10px] font-black text-slate-900 uppercase">{voter.state}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{voter.district}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {voter.aadhaarMeta && (
                      <span className="text-[8px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 inline-block uppercase w-fit">Aadhaar Linked</span>
                    )}
                    {voter.otherIdMeta && (
                      <span className="text-[8px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 inline-block uppercase w-fit">{voter.otherIdMeta.type} Sub.</span>
                    )}
                    {!voter.aadhaarMeta && !voter.otherIdMeta && (
                      <span className="text-[8px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 inline-block uppercase w-fit">No Proof Found</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-tighter border ${
                     voter.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                     voter.status === 'Duplicate' || (!voter.aadhaarMeta && !voter.otherIdMeta) ? 'bg-red-50 text-red-700 border-red-200' :
                     'bg-orange-50 text-orange-700 border-orange-200'
                   }`}>
                     {(!voter.aadhaarMeta && !voter.otherIdMeta) ? 'Incomplete' : voter.status}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => navigate(`/voters/${voter.id}`)}
                    className="p-2 bg-slate-100 hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoterListPage;
