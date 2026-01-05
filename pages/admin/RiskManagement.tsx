
import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, MessageSquare, ChevronRight, 
  RefreshCw, Bot, Gavel, Trash2, CheckCircle2, UserCheck,
  Search, Filter, ArrowRight, Loader2, Zap, Shield,
  // Added missing ShieldCheck and MoreVertical
  ShieldCheck, MoreVertical
} from 'lucide-react';
import { RiskIncident, UserRole } from '../../types';
import { n8nService } from '../../services/n8n';

const RiskManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'red-flags' | 'audits'>('red-flags');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<RiskIncident[]>([
    {
      id: 'ri1', severity: 'License Risk', triggerPhrase: 'sue', status: 'Open',
      transcript: 'Client: "If this inspection repair isn\'t settled by Friday, my lawyer said we will sue for breach of contract. You ignored my last three emails."',
      clientName: 'Alice Freeman', agentName: 'Sarah Smith', dealId: 'd1', timestamp: '10 mins ago', sentimentScore: 0.12
    },
    {
      id: 'ri2', severity: 'Medium', triggerPhrase: 'mistake', status: 'Broker Intervening',
      transcript: 'Client: "There is a massive mistake in the closing disclosure. Why didn\'t you catch this? I am extremely upset."',
      clientName: 'Bob Driller', agentName: 'Mike Ross', dealId: 'd2', timestamp: '2h ago', sentimentScore: 0.28
    },
    {
      id: 'ri3', severity: 'Low', triggerPhrase: 'unhappy', status: 'Resolved',
      transcript: 'Client: "I\'m unhappy with the showing schedule. Can we talk?"',
      clientName: 'Charlie Day', agentName: 'Sarah Smith', dealId: 'd1', timestamp: '1d ago', sentimentScore: 0.45
    }
  ]);

  const handleTakeover = async (id: string) => {
    setIsProcessing(id);
    await n8nService.brokerTakeover(id);
    setTimeout(() => {
        setIncidents(prev => prev.map(ri => ri.id === id ? { ...ri, status: 'Broker Intervening' } : ri));
        setIsProcessing(null);
        alert("DEFCON 1: Broker takeover initiated. Agent has been locked out of the thread. Slack alert dispatched to Legal.");
    }, 1500);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'License Risk': return 'bg-red-600 text-white border-red-700 shadow-lg animate-pulse';
      case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Risk Control.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 143: Sentiment Firefighter protocol</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><RefreshCw size={18}/></button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-red-600">
          <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><ShieldAlert size={180}/></div>
          <div className="relative z-10 max-w-2xl">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Red Flag Inbox.</h3>
              <p className="text-red-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                  Nexus AI monitors all channels for <strong className="text-white underline">Risk Keywords</strong> and critical sentiment drops. Bypassing standard routing to alert you immediately.
              </p>
          </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
              <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" /> Sentiment Priority Queue
              </h3>
          </div>
          <div className="divide-y divide-slate-100">
              {incidents.map(ri => (
                  <div key={ri.id} className={`p-8 hover:bg-slate-50 transition-all group flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 ${ri.sentimentScore < 0.2 ? 'bg-red-50/30' : ''}`}>
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs border-2 transition-all ${getSeverityStyle(ri.severity)}`}>
                              {ri.severity === 'License Risk' ? '!!!' : ri.sentimentScore.toFixed(2)}
                          </div>
                          <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate">{ri.clientName}</h4>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ri.timestamp}</span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${ri.severity === 'License Risk' ? 'bg-red-600 text-white' : 'bg-orange-50 text-orange-700'}`}>{ri.severity}</span>
                              </div>
                              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-inner mb-4">
                                  <p className="text-[10px] text-red-900 font-bold leading-relaxed italic">"{ri.transcript}"</p>
                              </div>
                              <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      <Bot size={12} className="text-indigo-500"/> Trigger: <span className="text-red-600 italic">"{ri.triggerPhrase}"</span>
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      <UserCheck size={12} className="text-indigo-500"/> Agent: {ri.agentName}
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto">
                          {ri.status === 'Broker Intervening' ? (
                              <div className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                                  <ShieldCheck size={14}/> Takeover Active
                              </div>
                          ) : ri.status === 'Resolved' ? (
                              <div className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 shadow-sm">
                                  <CheckCircle2 size={14}/> Mitigated
                              </div>
                          ) : (
                              <button 
                                onClick={() => handleTakeover(ri.id)}
                                disabled={isProcessing === ri.id}
                                className="flex-1 lg:flex-none bg-red-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                              >
                                  {isProcessing === ri.id ? <Loader2 size={14} className="animate-spin"/> : <Gavel size={14}/>}
                                  Take Over Thread
                              </button>
                          )}
                          <button className="p-3 bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl transition-all"><MoreVertical size={20}/></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default RiskManagement;
