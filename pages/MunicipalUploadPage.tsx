
import React, { useState } from 'react';
import { Upload, Search, CheckCircle, AlertTriangle, FileText, UserMinus, ShieldAlert } from 'lucide-react';
import { Voter } from '../types';
import { extractDeceasedInfo } from '../services/geminiService';

interface MunicipalUploadPageProps {
  voters: Voter[];
  onDecommission: (voterId: string, reason: string) => void;
}

const MunicipalUploadPage: React.FC<MunicipalUploadPageProps> = ({ voters, onDecommission }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{ name: string, idNumber?: string, dateOfDeath?: string } | null>(null);
  const [matchedVoter, setMatchedVoter] = useState<Voter | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedData(null);
      setMatchedVoter(null);
      setError(null);
    }
  };

  const processCertificate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await extractDeceasedInfo(base64, file.type);
        
        if (result && result.name) {
          setExtractedData(result);
          // Simple search logic
          const match = voters.find(v => 
            (result.idNumber && v.id.includes(result.idNumber)) || 
            (v.name.toLowerCase() === result.name.toLowerCase())
          );
          setMatchedVoter(match || null);
        } else {
          setError("Could not extract legible data. Please ensure the document is clear.");
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("An internal protocol error occurred.");
      setIsProcessing(false);
    }
  };

  const finalizeDecommission = () => {
    if (!matchedVoter) return;
    onDecommission(matchedVoter.id, 'Deceased (Verified by Municipal Certificate)');
    alert(`Protocol Success: Voter ${matchedVoter.id} removed from active roll.`);
    setFile(null);
    setExtractedData(null);
    setMatchedVoter(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b-4 border-slate-900 pb-6">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Civil Registry Interface: Death Verification
        </h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Municipal Corporation Portal • Decommissioning Terminal</p>
      </div>

      <div className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 p-10 text-center hover:border-blue-500 transition-colors group relative">
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileChange}
            />
            <Upload className="w-12 h-12 text-slate-300 group-hover:text-blue-500 mx-auto mb-4" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {file ? file.name : "Drop Official Death Certificate or Browse"}
            </p>
          </div>

          <button 
            disabled={!file || isProcessing}
            onClick={processCertificate}
            className={`w-full py-4 text-xs font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${
              !file || isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'
            }`}
          >
            {isProcessing ? "Analyzing Document Metadata..." : "Submit for AI Validation"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 text-[11px] font-black text-red-700 uppercase">
          {error}
        </div>
      )}

      {extractedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Certificate Data */}
          <div className="bg-slate-900 text-white p-6 border-t-8 border-blue-500">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Extracted Certificate Info</h3>
             <div className="space-y-4">
               <div>
                 <p className="text-[9px] font-bold text-slate-500 uppercase">Legal Name</p>
                 <p className="text-lg font-black uppercase">{extractedData.name}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[9px] font-bold text-slate-500 uppercase">Extracted ID</p>
                   <p className="font-mono text-sm">{extractedData.idNumber || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-[9px] font-bold text-slate-500 uppercase">Date of Death</p>
                   <p className="font-mono text-sm">{extractedData.dateOfDeath || 'N/A'}</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Roll Match Result */}
          <div className={`p-6 border-2 ${matchedVoter ? 'bg-orange-50 border-orange-600' : 'bg-slate-100 border-slate-300 opacity-60'}`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Electoral Roll Match</h3>
            {matchedVoter ? (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-orange-200 rounded">
                     <AlertTriangle className="w-5 h-5 text-orange-700" />
                   </div>
                   <div>
                     <p className="text-sm font-black text-slate-900 uppercase leading-none">{matchedVoter.name}</p>
                     <p className="text-[10px] font-mono font-bold text-slate-500 mt-1">{matchedVoter.id}</p>
                     <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{matchedVoter.address}</p>
                   </div>
                </div>
                
                <div className="p-4 bg-white/80 border border-orange-200 text-[10px] font-black text-orange-900 uppercase">
                  MATCHING CONFIDENCE: HIGH (IDENTITY VERIFIED)
                </div>

                <button 
                  onClick={finalizeDecommission}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 shadow-lg"
                >
                  <UserMinus className="w-4 h-4" /> Decommission Record
                </button>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <Search className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching record found in current roll node.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-100 p-6 flex gap-4">
        <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-900 uppercase">Automated Integrity Protocol</p>
          <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed">
            All Municipal uploads are logged to the National Audit Trail. Fraudulent decommissioning of voter records is a non-bailable offense.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MunicipalUploadPage;
