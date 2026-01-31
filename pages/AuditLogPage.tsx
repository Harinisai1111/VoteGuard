
import React from 'react';
import { History, Search, Download } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../constants';

const AuditLogPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Audit Trail</h1>
          <p className="text-slate-500">Immutable record of all portal actions and decisions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <History className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Action History Log</span>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter logs..."
              className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded text-xs w-48 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Action Type</th>
              <th className="px-6 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {MOCK_AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{log.userName}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{log.userId}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    log.action.includes('Override') ? 'bg-purple-50 text-purple-700' :
                    log.action.includes('Flagged') ? 'bg-orange-50 text-orange-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 leading-relaxed max-w-sm">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogPage;
