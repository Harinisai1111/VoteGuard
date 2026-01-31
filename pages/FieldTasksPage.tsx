
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileEdit, ClipboardList, MapPin } from 'lucide-react';
import { Voter } from '../types';

interface FieldTasksPageProps {
  voters: Voter[];
  onUpdateVoter: (v: Voter) => void;
}

const FieldTasksPage: React.FC<FieldTasksPageProps> = ({ voters, onUpdateVoter }) => {
  const [searchParams] = useSearchParams();
  const voterId = searchParams.get('id');
  const navigate = useNavigate();

  const tasks = voters.filter(v => v.isFlagged && !v.isArchived);
  const [selectedTask, setSelectedTask] = useState<Voter | null>(
    voterId ? (voters.find(v => v.id === voterId) || null) : null
  );

  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState<Voter['status']>('Pending Verification');
  const [submitted, setSubmitted] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const updated = {
      ...selectedTask,
      status: newStatus,
      flaggedReasons: [],
      isFlagged: false,
      isArchived: (newStatus === 'Shifted' || newStatus === 'Deceased' || newStatus === 'Duplicate'),
      flaggedHistory: [
        ...(selectedTask.flaggedHistory || []),
        {
          timestamp: new Date().toISOString(),
          resolvedBy: 'Field Officer (SIR Protocol)',
          resolution: newStatus,
          remarks: remarks,
          originalFlags: selectedTask.flaggedReasons
        }
      ]
    };

    onUpdateVoter(updated);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRemarks('');
      setSelectedTask(null);
      navigate('/voters');
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-600" />
          Queue: {tasks.length} SIR Tasks
        </h2>
        <div className="space-y-3">
          {tasks.map(task => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`w-full text-left p-4 border-2 transition-all ${selectedTask?.id === task.id ? 'bg-blue-600 border-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' : 'bg-white border-slate-200 hover:border-slate-900'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black uppercase ${selectedTask?.id === task.id ? 'text-blue-200' : 'text-slate-400'}`}>{task.id}</span>
              </div>
              <p className="font-black uppercase tracking-tight truncate">{task.name}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-bold opacity-80 uppercase">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{task.pollingStation}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedTask ? (
          <div className="bg-white border-2 border-slate-900 overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="p-6 border-b-2 border-slate-900 bg-slate-900 text-white">
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">Site Verification Protocol</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 text-[10px] font-bold uppercase">
                <div>
                  <p className="text-slate-400">Subject Name</p>
                  <p className="text-lg">{selectedTask.name}</p>
                </div>
                <div>
                  <p className="text-slate-400">Jurisdiction</p>
                  <p className="text-lg">{selectedTask.state}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Field Observation Outcome</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Verified', 'Shifted', 'Deceased', 'Duplicate'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewStatus(status as any)}
                      className={`py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newStatus === status ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Detailed Case Remarks</label>
                <textarea
                  className="w-full bg-slate-50 border-2 border-slate-200 p-4 text-sm text-slate-900 font-bold outline-none focus:border-slate-900 h-32"
                  placeholder="Mandatory: Document site observations, neighbor statements, and document verification results..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </div>

              <div className="bg-orange-50 p-4 border-2 border-orange-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-[10px] text-orange-900 font-bold uppercase leading-relaxed">
                  Declaration: I hereby certify that the above observations were made in person. Intentional falsification of electoral records is a punishable offense under Indian Law.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 bg-green-100 border-2 border-green-600 text-green-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Protocol Finalized
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-black py-4 uppercase tracking-[0.4em] text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                >
                  <FileEdit className="w-4 h-4" /> Commit to National Roll
                </button>
              )}
            </form>
          </div>
        ) : (
          <div className="h-full bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-12 text-center text-slate-400 uppercase tracking-widest font-black text-xs">
            <ClipboardList className="w-12 h-12 mb-4 opacity-10" />
            <p>Awaiting Task Selection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldTasksPage;
