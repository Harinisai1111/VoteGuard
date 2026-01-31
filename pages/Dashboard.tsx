
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, AlertTriangle, CheckCircle, Clock, Layers } from 'lucide-react';
import { Voter } from '../types';

interface DashboardProps {
  voters: Voter[];
}

const Dashboard: React.FC<DashboardProps> = ({ voters }) => {
  const activeVoters = voters.filter(v => !v.isArchived);
  const total = activeVoters.length;
  const flagged = activeVoters.filter(v => v.isFlagged).length;
  const highRisk = activeVoters.filter(v => v.riskScore > 80).length;
  const pending = activeVoters.filter(v => v.status === 'Pending Verification').length;

  // Calculate Aadhaar Identity Conflicts
  const aadhaarGroups: Record<string, number> = {};
  activeVoters.forEach(v => {
    if (v.aadhaarMeta?.aadhaarIdHash) {
      aadhaarGroups[v.aadhaarMeta.aadhaarIdHash] = (aadhaarGroups[v.aadhaarMeta.aadhaarIdHash] || 0) + 1;
    }
  });
  const identityConflicts = Object.values(aadhaarGroups).filter(count => count > 1).length;

  const riskData = [
    { name: 'Critical (80-100)', value: activeVoters.filter(v => v.riskScore >= 80).length, color: '#ef4444' },
    { name: 'High (60-79)', value: activeVoters.filter(v => v.riskScore >= 60 && v.riskScore < 80).length, color: '#f97316' },
    { name: 'Medium (30-59)', value: activeVoters.filter(v => v.riskScore >= 30 && v.riskScore < 60).length, color: '#eab308' },
    { name: 'Low (0-29)', value: activeVoters.filter(v => v.riskScore < 30).length, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">National Integrity Metrics</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Aggregate data from all verified electoral roll nodes.</p>
        </div>
        <div className="bg-red-600 text-white p-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <div className="flex items-center gap-2 mb-1">
             <Layers className="w-4 h-4" />
             <span className="text-[9px] font-black uppercase tracking-widest">Identity Clashes</span>
           </div>
           <p className="text-2xl font-black leading-none">{identityConflicts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Registry', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Inquiry', value: flagged, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Critical Score', value: highRisk, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'SIR Assignment', value: pending, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <stat.icon className={`${stat.color} w-4 h-4`} />
            </div>
            <p className="text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 border-2 border-slate-900">
          <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Risk Profile Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={9} fontWeight="bold" />
                <YAxis fontSize={9} fontWeight="bold" />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 border-2 border-slate-900">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Roll Health Index</h2>
          <div className="space-y-6">
            <div className="text-center py-8">
               <p className="text-6xl font-black text-blue-500">92%</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Data Consistency Rate</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-800">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-slate-400">Deceased Pruning</span>
                  <span className="text-green-500">Optimized</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-slate-400">Aadhaar Sync</span>
                  <span className="text-blue-500">98.2% Link</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-slate-400">Identity Clashes</span>
                  <span className={identityConflicts > 0 ? 'text-red-500' : 'text-green-500'}>
                    {identityConflicts > 0 ? `${identityConflicts} Active` : 'Zero Det.'}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
