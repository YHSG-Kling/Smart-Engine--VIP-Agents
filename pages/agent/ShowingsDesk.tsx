
import React, { useState } from 'react';
import { 
  Calendar, MapPin, Users, Zap, Clock, Globe, 
  Link as LinkIcon, Filter, Search, MoreVertical, 
  CheckCircle2, XCircle, ChevronRight, AlertTriangle, 
  Bot, RefreshCw, Smartphone, Mail, MousePointerClick,
  LayoutList, ClipboardCheck, ArrowRight, Kanban as KanbanIcon,
  Loader2, Key, ShieldCheck, Eye, EyeOff, Send, FileDown,
  Home, Sparkles,
  ChevronLeft, MessageSquare, AlertCircle, UserX, History,
  Phone, Navigation, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Showing } from '../../types';
import { n8nService } from '../../services/n8n';

const ShowingsDesk: React.FC = () => {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'itinerary' | 'reports'>('queue');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const [showings, setShowings] = useState<Showing[]>([
    { id: 'sh1', propertyId: 'l1', leadId: 'lead1', address: '123 Main St', leadName: 'Alice Freeman', requestedTime: 'Saturday, 2:00 PM', status: 'Requested', isPreQualified: true },
    { id: 'sh2', propertyId: 'l2', leadId: 'lead2', address: '456 Oak Ave', leadName: 'Bob Driller', requestedTime: 'Sunday, 11:00 AM', status: 'Pending Seller Confirm', isPreQualified: true },
    { id: 'sh3', propertyId: 'l1', leadId: 'lead3', address: '123 Main St', leadName: 'Charlie Day', requestedTime: 'Saturday, 4:00 PM', status: 'Confirmed', isPreQualified: true, lockboxCode: '1992', alarmCode: 'None' },
  ]);

  const handleApproveAndPropose = async (showingId: string) => {
      setIsProcessing(showingId);
      await n8nService.triggerAvailabilityProposal(showingId);
      setTimeout(() => {
          setShowings(prev => prev.map(s => s.id === showingId ? { ...s, status: 'Picking Slots' } : s));
          setIsProcessing(null);
          alert("Smart Engine AI: Showing approved. I've cross-referenced your calendar and proposed 3 slots to the client via SMS.");
      }, 1500);
  };

  const handleGenBriefing = async (id: string) => {
    setIsProcessing(id);
    await n8nService.triggerBriefingGeneration(id);
    setTimeout(() => {
        setIsProcessing(null);
        alert("Smart Engine AI: Personalized property briefing sent to Client's portal.");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Showings Hub.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 122: Autonomous Confirmation Protocols</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                <button onClick={() => setActiveTab('queue')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <LayoutList size={14}/> Incoming Queue
                </button>
                <button onClick={() => setActiveTab('itinerary')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'itinerary' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Navigation size={14}/> Routing Plan
                </button>
            </div>
        </div>
      </div>

      {activeTab === 'queue' && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Depth</p>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{showings.length} Requests</h3>
                  </div>
                  <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-center border-b-8 border-indigo-900 relative overflow-hidden">
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12"><Zap size={120}/></div>
                      <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Auto-Confirm Rate</p>
                      <h3 className="text-3xl font-black tracking-tighter">84%</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Showing</p>
                      <h3 className="text-3xl font-black text-emerald-600 tracking-tighter italic uppercase leading-none">In 24m</h3>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-600" /> Showing Operations Queue
                      </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {showings.map(s => (
                          <div key={s.id} className="p-8 hover:bg-slate-50 transition-all group flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                              <div className="flex items-center gap-6 flex-1 min-w-0">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic border shadow-inner ${
                                      s.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                      s.status === 'Requested' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                      'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}>
                                      {s.address[0]}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-base italic truncate group-hover:text-indigo-600 transition-colors">{s.address}</h4>
                                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                              s.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              s.status === 'Requested' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                              'bg-slate-100 text-slate-500'
                                          }`}>{s.status}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          <span className="flex items-center gap-1.5"><Users size={12} className="text-indigo-500"/> {s.leadName}</span>
                                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500"/> {s.requestedTime}</span>
                                      </div>
                                      {s.lockboxCode && (
                                          <div className="mt-4 p-3 bg-slate-900 rounded-xl text-white inline-flex items-center gap-6">
                                              <div className="flex items-center gap-2"><Key size={14} className="text-indigo-400"/> <span className="font-mono text-xs">{s.lockboxCode}</span></div>
                                              <div className="flex items-center gap-2"><AlertCircle size={14} className="text-indigo-400"/> <span className="font-black uppercase text-[9px]">{s.alarmCode}</span></div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto">
                                  {s.status === 'Requested' ? (
                                      <button 
                                        onClick={() => handleApproveAndPropose(s.id)}
                                        disabled={isProcessing === s.id}
                                        className="flex-1 lg:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-b-4 border-indigo-800"
                                      >
                                          {isProcessing === s.id ? <Loader2 size={14} className="animate-spin"/> : <Zap size={14}/>}
                                          Initiate Propose
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={() => handleGenBriefing(s.id)}
                                        disabled={isProcessing === s.id}
                                        className="flex-1 lg:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                      >
                                          {isProcessing === s.id ? <Loader2 size={14} className="animate-spin"/> : <Bot size={14}/>}
                                          Generate AI Briefing
                                      </button>
                                  )}
                                  <button className="p-3 bg-white border-2 border-slate-100 text-slate-300 hover:text-indigo-600 rounded-2xl transition-all"><MoreVertical size={20}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ShowingsDesk;
