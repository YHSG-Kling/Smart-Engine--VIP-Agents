
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle, 
  Search, Filter, ChevronRight, AlertTriangle, 
  BarChart3, RefreshCw, Loader2, Sparkles, Bot, 
  Building2, ArrowRight, Gavel, LayoutList, MessageSquare,
  ThumbsDown, ThumbsUp, Send, CheckSquare, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, ListingApproval } from '../../types';
import { n8nService } from '../../services/n8n';

const ListingApprovals: React.FC = () => {
  const { role, user } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  
  const [approvals, setApprovals] = useState<ListingApproval[]>([
    {
      id: 'ap1', listingId: 'l1', address: '123 Main St', agentName: 'Sarah Smith',
      riskScore: 8, flaggedTerms: ['family-friendly', 'walking distance to church'],
      price: 850000, pricePerSqft: 450, status: 'Needs Review',
      aiFeedback: "High risk of Fair Housing violation. Use of 'family-friendly' implies familial status preference. Reference to 'church' is a religious bias risk.",
      submittedDate: '10 mins ago', description: 'Experience this beautiful family-friendly modern farmhouse. Walking distance to church and tech hub.'
    },
    {
      id: 'ap2', listingId: 'l2', address: '456 Oak Ave', agentName: 'Mike Ross',
      riskScore: 1, flaggedTerms: [],
      price: 420000, pricePerSqft: 310, status: 'Pending AI',
      submittedDate: 'Just Now', description: 'Charming bungalow with updated HVAC and roof. Close to major highways.'
    },
    {
      id: 'ap3', listingId: 'l3', address: '789 Skyline Dr', agentName: 'Jessica Pearson',
      riskScore: 4, flaggedTerms: ['bachelor pad'],
      price: 1200000, pricePerSqft: 650, status: 'Needs Review',
      aiFeedback: "Potential gender bias in 'bachelor pad' terminology. Also price per sqft is 25% higher than neighborhood average.",
      submittedDate: '2h ago', description: 'Ultimate luxury penthouse. The perfect bachelor pad for high-flyers.'
    }
  ]);

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAction = async (id: string, newStatus: ListingApproval['status']) => {
    setIsProcessing(id);
    // Workflow 113 Node 3 path
    await n8nService.triggerWorkflow('listing-approval-final', { id, status: newStatus });
    
    setTimeout(() => {
        setApprovals(prev => prev.map(ap => ap.id === id ? { ...ap, status: newStatus } : ap));
        setIsProcessing(null);
        if (newStatus === 'Approved') alert("Listing approved and dispatched for syndication.");
        else alert("Feedback sent to agent for correction.");
    }, 1500);
  };

  const columns = ['Pending AI', 'Needs Review', 'Approved'];

  const filteredApprovals = useMemo(() => {
    if (isAdmin) return approvals;
    return approvals.filter(a => a.agentName === user?.name || a.agentName === 'Sarah Smith'); // Filter for current agent
  }, [approvals, isAdmin, user]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Listing Approvals.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 113: Compliance Sentinel Active</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                <RefreshCw size={18}/>
            </button>
        </div>
      </div>

      {isAdmin ? (
          /* View A: Admin - Kanban Mode */
          <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-280px)] scrollbar-hide">
              {columns.map(col => (
                  <div key={col} className="bg-slate-100/50 rounded-[2rem] p-4 flex flex-col h-full min-w-[340px] border border-slate-200/50">
                      <div className="flex justify-between items-center mb-6 px-4 pt-2">
                          <h3 className="font-black text-[10px] text-slate-700 uppercase tracking-[0.25em]">{col}</h3>
                          <span className="bg-white px-2.5 py-1 rounded-full text-[9px] font-black text-slate-400 shadow-sm border border-slate-100">
                              {filteredApprovals.filter(a => a.status === col).length}
                          </span>
                      </div>
                      <div className="space-y-4 overflow-y-auto flex-1 px-1 scrollbar-hide">
                          {filteredApprovals.filter(a => a.status === col).map(ap => (
                              <div key={ap.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-200 hover:border-indigo-400 transition-all group relative overflow-hidden">
                                  {ap.riskScore > 5 && ap.status !== 'Approved' && (
                                      <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-xl font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                                          <ShieldAlert size={10}/> High Risk ({ap.riskScore}/10)
                                      </div>
                                  )}
                                  
                                  <div className="mb-4">
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-0.5">{ap.address}</h4>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ap.agentName} • ${ap.price.toLocaleString()}</p>
                                  </div>

                                  {ap.flaggedTerms.length > 0 && ap.status !== 'Approved' && (
                                      <div className="mb-4 flex flex-wrap gap-1.5">
                                          {ap.flaggedTerms.map(term => (
                                              <span key={term} className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-red-100">{term}</span>
                                          ))}
                                      </div>
                                  )}

                                  {ap.aiFeedback && ap.status !== 'Approved' && (
                                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-6">
                                          <p className="text-[10px] text-slate-600 italic leading-relaxed">"{ap.aiFeedback}"</p>
                                      </div>
                                  )}

                                  <div className="flex gap-2">
                                      {ap.status === 'Approved' ? (
                                          <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                              <CheckCircle2 size={12}/> Live on Syndication
                                          </div>
                                      ) : (
                                          <>
                                              <button 
                                                onClick={() => handleAction(ap.id, 'Approved')}
                                                disabled={isProcessing === ap.id}
                                                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                                              >
                                                  {isProcessing === ap.id ? <Loader2 size={12} className="animate-spin mx-auto"/> : 'Approve'}
                                              </button>
                                              <button 
                                                onClick={() => handleAction(ap.id, 'Rejected')}
                                                disabled={isProcessing === ap.id}
                                                className="px-4 py-2 border-2 border-slate-200 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-red-200 hover:text-red-600 transition-all"
                                              >
                                                  Reject
                                              </button>
                                          </>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          /* View B: Agent - Status Tracker */
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <LayoutList size={18} className="text-indigo-600" /> My Compliance Queue
                  </h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-8">Listing Address</th>
                              <th className="p-8">Compliance State</th>
                              <th className="p-8">AI Review Notes</th>
                              <th className="p-8 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {filteredApprovals.map(ap => (
                              <tr key={ap.id} className="hover:bg-slate-50 transition-colors group">
                                  <td className="p-8">
                                      <div className="font-black text-slate-900 uppercase tracking-tight">{ap.address}</div>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Submitted: {ap.submittedDate}</p>
                                  </td>
                                  <td className="p-8">
                                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                                          ap.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                          ap.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                          'bg-indigo-50 text-indigo-700 border-indigo-100'
                                      }`}>
                                          {ap.status === 'Rejected' ? 'Correction Needed' : ap.status}
                                      </span>
                                  </td>
                                  <td className="p-8">
                                      {ap.aiFeedback ? (
                                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl max-w-sm">
                                              <p className="text-[10px] text-slate-600 italic">"{ap.aiFeedback}"</p>
                                          </div>
                                      ) : (
                                          <span className="text-slate-300 italic font-medium tracking-widest text-[9px]">AWAITING AI SCAN...</span>
                                      )}
                                  </td>
                                  <td className="p-8 text-right">
                                      {ap.status === 'Rejected' && (
                                          <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                                              Edit Description
                                          </button>
                                      )}
                                      {ap.status === 'Approved' && (
                                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                                              <ExternalLink size={18}/>
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

const ExternalLink = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
);

export default ListingApprovals;
