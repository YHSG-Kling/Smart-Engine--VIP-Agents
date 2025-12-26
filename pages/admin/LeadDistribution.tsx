
import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, Zap, ArrowRight, RefreshCw, 
  Search, Filter, CheckCircle2, AlertTriangle, 
  Bot, Clock, ShieldCheck, ChevronRight, UserCheck, 
  Settings, Loader2, GitBranch
} from 'lucide-react';
import { RoutingLog, Agent } from '../../types';
import { n8nService } from '../../services/n8n';

const LeadDistribution: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'profiles'>('logs');
  const [isLoading, setIsLoading] = useState(false);
  const [routingLogs, setRoutingLogs] = useState<RoutingLog[]>([
    { id: '1', leadName: 'Tom Hardy', agentName: 'Sarah Smith', agentId: '1', zipCode: '78704', budget: 850000, matchReason: 'Top luxury specialist in 78704. Sold 3 similar properties this month.', timestamp: '10 mins ago', status: 'Assigned' },
    { id: '2', leadName: 'Emma Stone', agentName: 'Mike Ross', agentId: '2', zipCode: '78702', budget: 420000, matchReason: 'Best conversion rate for first-time buyers in East Austin.', timestamp: '1h ago', status: 'Assigned' },
    { id: '3', leadName: 'Ryan Gosling', agentName: 'Jessica Pearson', agentId: '3', zipCode: '78701', budget: 1200000, matchReason: 'Elite Producer with highest closing rate for luxury condos.', timestamp: '4h ago', status: 'Overridden' }
  ]);

  const [agents] = useState<Partial<Agent>[]>([
    { id: '1', name: 'Sarah Smith', serviceAreasZips: ['78704', '78701'], specialties: ['Luxury', 'Seller'], closingRate: 92, status: 'Active' },
    { id: '2', name: 'Mike Ross', serviceAreasZips: ['78702', '78705'], specialties: ['First-Time', 'Relocation'], closingRate: 88, status: 'Active' },
    { id: '3', name: 'Jessica Pearson', serviceAreasZips: ['78701', '78746'], specialties: ['Luxury', 'Investors'], closingRate: 95, status: 'Away' }
  ]);

  const handleOverride = (logId: string) => {
    if (confirm("Manual override will disconnect AI logic for this specific lead. Proceed?")) {
        setRoutingLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'Overridden' } : l));
        alert("Override active. Lead re-routed to round-robin fallback.");
    }
  };

  const handleRetrain = async () => {
    setIsLoading(true);
    // Workflow 100 retrain trigger
    await n8nService.triggerWorkflow('retrain-routing-model', { timestamp: new Date().toISOString() });
    setTimeout(() => {
        setIsLoading(false);
        alert("AI Matching Model refreshed with latest closing data.");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Lead Distribution.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 100: AI "Resume Match" Routing</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Clock size={14}/> Routing Logs
                </button>
                <button onClick={() => setActiveTab('profiles')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'profiles' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Users size={14}/> Agent Profiles
                </button>
            </div>
            <button 
                onClick={handleRetrain}
                disabled={isLoading}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-black active:scale-95 transition-all disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                Retrain Model
            </button>
        </div>
      </div>

      {activeTab === 'logs' && (
          <div className="space-y-6">
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-900 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><GitBranch size={180}/></div>
                  <div className="relative z-10 max-w-xl">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">AI Routing Audit.</h3>
                      <p className="text-indigo-100 text-sm font-medium">Monitoring the "Resume Match" engine. Leads are assigned based on Agent specialties, historical closing rates in target Zips, and current availability.</p>
                  </div>
                  <div className="relative z-10 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-md min-w-[200px] text-center">
                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">TOTAL ASSIGNMENTS (24H)</p>
                        <p className="text-3xl font-black tracking-tighter">12 Leads</p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <ShieldCheck size={18} className="text-indigo-600" /> Recent Intelligent Assignments
                      </h3>
                      <div className="flex gap-2">
                          <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><Search size={14}/></button>
                          <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><Filter size={14}/></button>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <tr>
                                  <th className="p-8">Lead Entity</th>
                                  <th className="p-8">Assigned Agent</th>
                                  <th className="p-8">AI Matching Rationale</th>
                                  <th className="p-8">Status</th>
                                  <th className="p-8 text-right">Control</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                              {routingLogs.map(log => (
                                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                      <td className="p-8">
                                          <div className="font-black text-slate-900 uppercase tracking-tight">{log.leadName}</div>
                                          <div className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">Zip: {log.zipCode} • ${ (log.budget/1000).toFixed(0) }k</div>
                                      </td>
                                      <td className="p-8">
                                          <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">{log.agentName[0]}</div>
                                              <span className="font-black text-slate-800 uppercase">{log.agentName}</span>
                                          </div>
                                      </td>
                                      <td className="p-8">
                                          <div className="flex items-start gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 max-w-sm">
                                              <Bot size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                                              <p className="text-[10px] text-indigo-900 leading-relaxed italic">"{log.matchReason}"</p>
                                          </div>
                                      </td>
                                      <td className="p-8">
                                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                              log.status === 'Assigned' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              log.status === 'Overridden' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                              'bg-slate-50 text-slate-500 border-slate-200'
                                          }`}>
                                              {log.status}
                                          </span>
                                      </td>
                                      <td className="p-8 text-right">
                                          <button 
                                            onClick={() => handleOverride(log.id)}
                                            className="px-4 py-2 border-2 border-slate-200 rounded-xl text-[8px] font-black uppercase tracking-widest hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95"
                                          >
                                              Override
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'profiles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {agents.map(agent => (
                  <div key={agent.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:border-indigo-400 transition-all flex flex-col group relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-6 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700"><UserCheck size={80}/></div>
                      
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl italic">{agent.name![0]}</div>
                          <div>
                              <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1.5">{agent.name}</h4>
                              <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{agent.status}</span>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-4 flex-1">
                          <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Areas (Zips)</p>
                              <div className="flex flex-wrap gap-1.5">
                                  {agent.serviceAreasZips?.map(zip => (
                                      <span key={zip} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black">{zip}</span>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Specialties</p>
                              <div className="flex flex-wrap gap-1.5">
                                  {agent.specialties?.map(s => (
                                      <span key={s} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">{s}</span>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                          <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Closing Rate</p>
                              <p className="text-xl font-black text-emerald-600 tracking-tighter">{agent.closingRate}%</p>
                          </div>
                          <button className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><Settings size={16}/></button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default LeadDistribution;
