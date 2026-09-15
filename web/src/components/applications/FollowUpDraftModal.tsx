'use client';

import { useState } from'react';
import { apiClient, ApiError } from'@/lib/api-client';
import { Copy, Check, Sparkles, AlertCircle, X } from'lucide-react';

interface FollowUpDraftModalProps {
 applicationId: string;
 followUpCount: number;
 onFollowUpCountIncrement?: () => void;
}

export default function FollowUpDraftModal({ applicationId, followUpCount, onFollowUpCountIncrement }: FollowUpDraftModalProps) {
 const [isOpen, setIsOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const [draftText, setDraftText] = useState('');
 const [copied, setCopied] = useState(false);
 const [errorMsg, setErrorMsg] = useState('');

 const handleGenerate = async () => {
 setLoading(true);
 setErrorMsg('');
 try {
 const res = await apiClient.post<{ draftText: string; followUpCount: number }>(
 `/applications/${applicationId}/follow-up-draft`
 );
 setDraftText(res.draftText);
 setIsOpen(true);
 } catch (err: any) {
 if (err instanceof ApiError) {
 setErrorMsg(err.message);
 } else {
 setErrorMsg('Gagal membuat draft follow-up');
 }
 setIsOpen(true);
 } finally {
 setLoading(false);
 }
 };

 const handleCopy = () => {
 navigator.clipboard.writeText(draftText);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const isDisabled = followUpCount >= 2;

 return (
 <>
 <button
 onClick={handleGenerate}
 disabled={isDisabled || loading}
 className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md ${
 isDisabled
 ?'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
 :'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
 }`}
 >
 <Sparkles className="w-4 h-4" />
 <span>{isDisabled ?'Batas Follow-up Tercapai (2/2)':'Generate Follow-up Draft'}</span>
 </button>

 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-150">
 <button
 onClick={() => setIsOpen(false)}
 className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="flex items-center space-x-3 mb-4">
 <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
 <Sparkles className="w-5 h-5 text-indigo-500" />
 </div>
 <div>
 <h3 className="text-lg font-medium text-slate-900">Draft Pesan Follow-up</h3>
 <p className="text-xs text-slate-500">
 Penggunaan Follow-up: {followUpCount}/2
 </p>
 </div>
 </div>

 {errorMsg ? (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center space-x-2 my-4">
 <AlertCircle className="w-5 h-5 flex-shrink-0" />
 <span>{errorMsg}</span>
 </div>
 ) : (
 <>
 <textarea
 readOnly
 value={draftText}
 rows={10}
 className="w-full p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none resize-none leading-relaxed"
 />

 <div className="flex items-center justify-between mt-4">
 <p className="text-[11px] text-slate-400">
 Salin teks di atas dan sesuaikan sebelum dikirim ke HR/Recruiter.
 </p>
 <button
 onClick={handleCopy}
 className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
 >
 {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
 <span>{copied ?'Tersalin!':'Salin Teks'}</span>
 </button>
 </div>
 </>
 )}
 </div>
 </div>
 )}
 </>
 );
}

