
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Phone, Award, 
  TrendingUp, Briefcase, ChevronRight,
  Loader2, Trophy, Star, Sparkles, Zap, Crown,
  LayoutGrid, List, ArrowRight, BarChart3, Search, Filter,
  ShieldCheck, Target, TrendingDown, Medal,
  GitGraph, Network, UserCheck, MessageSquare, Mail,
  MoreHorizontal, Plus, Video, Palette, Save, X, CheckSquare,
  Clock, Image as ImageIcon, Film, Activity, DollarSign, 
  ExternalLink, RefreshCw, AlertTriangle, Bot
} from 'lucide-react';
import { Agent } from '../../types';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';

const AgentRoster: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'performance' | 'compliance' | 'personas'>('performance');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mockAgents: Agent[] = [
    { id: '1', name: 'Sarah Smith', role: 'Elite Producer', email: 'sarah@nexus.com', phone: '512-555-0101', volume: 12500000, deals: 24, capProgress: 100, capPaid: 20000, capTotal: 20000, status: 'Active', availability: 'Online', dailyLeadCap: 5, leadsReceivedToday: 2, badges: ['top_closer', 'five_star', 'volume_titan'], teamLead: 'Jessica Pearson', serviceAreasZips: ['78704', '78701'], specialties: ['Luxury', 'Seller'], closingRate: 92, heyGenAvatarId: 'sarah_avatar_01', heyGenVoiceId: 'en_us_sarah', defaultVideoBackgroundType: 'solid_color', defaultVideoBackgroundValue: '#4f46e5', onboardingChecklist: { videoConfigured: true } },
    { id: '2', name: 'Mike Ross', role: 'Associate', email: 'mike@nexus.com', phone: '512-555-0102', volume: 4200000, deals: 8, capProgress: 45, capPaid: 9000, capTotal: 20000, status: 'Active', availability: 'In Field', dailyLeadCap: 3, leadsReceivedToday: 1, badges: ['fast_starter'], teamLead: 'Harvey Specter', serviceAreasZips: ['78702', '78705'], specialties: ['First-Time', 'Relocation'], closingRate: 88, onboardingChecklist: { videoConfigured: false } },
    { id: '3', name: 'Jessica Pearson', role: 'Managing Partner', email: 'jessica@nexus.com', phone: '512-555-0103', volume: 28000000, deals: 42, capProgress: 100, capPaid: 20000, capTotal: 20000, status: 'Active', availability: 'Online', dailyLeadCap: 0, leadsReceivedToday: 0, badges: ['legend', 'volume_titan'], serviceAreasZips: ['78701', '78746'], specialties: ['Luxury', 'Developments'], closingRate: 95, onboardingChecklist: { videoConfigured: true } }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await airtableService.getAgents();
      setAgents(data && data.length > 0 ? data : mockAgents);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleUpdateAgentPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    
    setIsLoading(true);
    const isConfigured = !!(editingAgent.heyGenAvatarId && editingAgent.heyGenVoiceId);
    const updatedAgent = {
        ...editingAgent,
        onboardingChecklist: {
            ...editingAgent.onboardingChecklist,
            videoConfigured: isConfigured
        }
    } as Agent;

    await n8nService.triggerWorkflow('wf-admin-avatar-01-setup', updatedAgent);
    
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    
    setTimeout(() => {
        setIsLoading(false);
        setEditingAgent(null);
        alert("Digital Identity Synchronized: Agent Persona & Onboarding Registry Updated.");
    }, 800);
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      {/* Header & Main Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Agent Command.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Roster Management & Identity Architecture</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
            {[
                { id: 'performance', label: 'Performance Logic', icon: TrendingUp },
                { id: 'compliance', label: 'Compliance Audit', icon: ShieldCheck },
                { id: 'personas', label: 'Digital Personas', icon: Bot },
            ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <tab.icon size={14}/> {tab.label}
                </button>
            ))}
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95 border-b-4 border-indigo-600">
            <UserPlus size={16}/> Onboard New Professional
        </button>
      </div>

      {/* Roster Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          {/* Internal Table Header */}
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 px-10">
              <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                  <div className="relative w-full max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input 
                        type="text" 
                        placeholder="FILTER BY NAME, ROLE, OR SPECIALTY..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                      />
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><Filter size={18}/></button>
                  <button onClick={() => window.location.reload()} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><RefreshCw size={18}/></button>
              </div>
          </div>

          <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-white border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      <tr>
                          <th className="p-8">Professional Entity</th>
                          {activeTab === 'performance' && (
                              <>
                                  <th className="p-8">YTD Production</th>
                                  <th className="p-8 text-center">Closing Rate</th>
                                  <th className="p-8">Cap Progress</th>
                              </>
                          )}
                          {activeTab === 'compliance' && (
                              <>
                                  <th className="p-8">License Number</th>
                                  <th className="p-8 text-center">Onboarding Audit</th>
                                  <th className="p-8 text-right">CE Progress</th>
                              </>
                          )}
                          {activeTab === 'personas' && (
                              <>
                                  <th className="p-8">HeyGen Identity</th>
                                  <th className="p-8">Voice Profile</th>
                                  <th className="p-8">Default Canvas</th>
                              </>
                          )}
                          <th className="p-8 text-right">Control</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {filteredAgents.map(agent => (
                          <tr key={agent.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="p-8">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-xl italic shadow-2xl relative shrink-0">
                                          {agent.name[0]}
                                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${agent.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                      </div>
                                      <div className="min-w-0">
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-base italic leading-none mb-1.5 truncate">{agent.name}</h4>
                                          <div className="flex flex-wrap gap-1.5">
                                              <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase border border-indigo-100">{agent.role}</span>
                                              {agent.badges?.slice(0,1).map(b => (
                                                  <span key={b} className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase border border-amber-100 flex items-center gap-1"><Trophy size={8}/> {b.replace('_', ' ')}</span>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </td>

                              {/* PERFORMANCE TAB VIEW */}
                              {activeTab === 'performance' && (
                                  <>
                                      <td className="p-8">
                                          <div className="font-black text-slate-900 text-lg tabular-nums tracking-tighter italic">${(agent.volume / 1000000).toFixed(1)}M</div>
                                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{agent.deals} Closings YTD</p>
                                      </td>
                                      <td className="p-8 text-center">
                                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black italic shadow-inner ${agent.closingRate > 90 ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 bg-indigo-50'}`}>
                                              {agent.closingRate}%
                                          </div>
                                      </td>
                                      <td className="p-8">
                                          <div className="flex items-center gap-4">
                                              <div className="flex-1 w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                                                  <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000" style={{ width: `${agent.capProgress}%` }} />
                                              </div>
                                              <span className="text-xs font-black text-slate-700 tracking-tighter tabular-nums">{agent.capProgress}%</span>
                                          </div>
                                          <p className="text-[8px] text-slate-400 font-black uppercase mt-1.5 tracking-widest">${agent.capPaid.toLocaleString()} / ${agent.capTotal.toLocaleString()}</p>
                                      </td>
                                  </>
                              )}

                              {/* COMPLIANCE TAB VIEW */}
                              {activeTab === 'compliance' && (
                                  <>
                                      <td className="p-8">
                                          <div className="font-mono text-xs text-slate-600 font-bold uppercase tracking-widest">TX-9928410</div>
                                          <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Exp: Oct 2025</p>
                                      </td>
                                      <td className="p-8 text-center">
                                          {agent.onboardingChecklist?.videoConfigured ? (
                                              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100 shadow-sm">
                                                  <CheckSquare size={12}/> V2 Verified
                                              </span>
                                          ) : (
                                              <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-100 animate-pulse shadow-sm">
                                                  <AlertTriangle size={12}/> Incomplete
                                              </span>
                                          )}
                                      </td>
                                      <td className="p-8 text-right">
                                          <div className="flex justify-end items-center gap-3">
                                              <span className="text-xs font-black text-slate-700">18 / 24</span>
                                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
                                              </div>
                                          </div>
                                      </td>
                                  </>
                              )}

                              {/* PERSONAS TAB VIEW */}
                              {activeTab === 'personas' && (
                                  <>
                                      <td className="p-8">
                                          {agent.heyGenAvatarId ? (
                                              <div className="flex items-center gap-3">
                                                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner border border-emerald-100">
                                                      <Video size={18}/>
                                                  </div>
                                                  <div className="min-w-0">
                                                      <p className="text-[10px] font-black text-slate-900 uppercase">Synced</p>
                                                      <p className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[120px]">{agent.heyGenAvatarId}</p>
                                                  </div>
                                              </div>
                                          ) : (
                                              <div className="flex items-center gap-3 opacity-40">
                                                  <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl border border-slate-200">
                                                      <Video size={18}/>
                                                  </div>
                                                  <span className="text-[10px] font-black text-slate-400 uppercase italic">Unlinked</span>
                                              </div>
                                          )}
                                      </td>
                                      <td className="p-8">
                                          <span className="text-xs font-black text-slate-600 uppercase tracking-tighter bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                              {agent.heyGenVoiceId || 'TBD'}
                                          </span>
                                      </td>
                                      <td className="p-8">
                                          <div className="flex items-center gap-2">
                                              <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: agent.defaultVideoBackgroundValue || '#ccc' }} />
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.defaultVideoBackgroundType || 'None'}</span>
                                          </div>
                                      </td>
                                  </>
                              )}

                              <td className="p-8 text-right">
                                  <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={() => setEditingAgent(agent)}
                                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
                                        title="Configure Identity"
                                      >
                                          <Bot size={20}/>
                                      </button>
                                      <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                                          <ChevronRight size={20}/>
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* PERSONA ARCHITECT MODAL */}
      {editingAgent && (
          <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] p-10 max-w-xl w-full shadow-[0_30px_100px_rgba(0,0,0,0.4)] animate-scale-in border border-white/20">
                  <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center font-black text-2xl italic text-indigo-600 shadow-inner shrink-0">
                              {editingAgent.name[0]}
                          </div>
                          <div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Persona Architect.</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-1.5"><Bot size={12} className="text-indigo-500"/> WF-ADMIN-AVATAR-01: Agent Identity Sync</p>
                          </div>
                      </div>
                      <button onClick={() => setEditingAgent(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20}/></button>
                  </div>

                  <form onSubmit={handleUpdateAgentPersona} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 flex justify-between">
                                HeyGen Avatar ID
                                <a href="https://app.heygen.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">Get ID <ExternalLink size={8}/></a>
                              </label>
                              <div className="relative group">
                                  <input 
                                    required
                                    value={editingAgent.heyGenAvatarId || ''}
                                    onChange={e => setEditingAgent({...editingAgent, heyGenAvatarId: e.target.value})}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all group-hover:bg-white" 
                                    placeholder="Paste Avatar ID..."
                                  />
                                  <Video size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">HeyGen Voice ID</label>
                              <div className="relative group">
                                  <input 
                                    required
                                    value={editingAgent.heyGenVoiceId || ''}
                                    onChange={e => setEditingAgent({...editingAgent, heyGenVoiceId: e.target.value})}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all group-hover:bg-white" 
                                    placeholder="Paste Voice ID..."
                                  />
                                  <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Default Canvas Type</label>
                              <div className="relative">
                                  <select 
                                    value={editingAgent.defaultVideoBackgroundType || 'solid_color'}
                                    onChange={e => setEditingAgent({...editingAgent, defaultVideoBackgroundType: e.target.value as any})}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                                  >
                                      <option value="solid_color">Solid Color</option>
                                      <option value="image_url">Branded Image</option>
                                      <option value="video_url">Branded Video</option>
                                  </select>
                                  <Film size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                      <ChevronRight className="rotate-90" size={16}/>
                                  </div>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Canvas Value</label>
                              <div className="relative group">
                                  <input 
                                    value={editingAgent.defaultVideoBackgroundValue || ''}
                                    onChange={e => setEditingAgent({...editingAgent, defaultVideoBackgroundValue: e.target.value})}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all group-hover:bg-white" 
                                    placeholder="#hex or https://..."
                                  />
                                  <Palette size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                              </div>
                          </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 rounded-[1.5rem] p-6">
                          <h4 className="font-black text-[11px] text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={16} className="text-indigo-600"/> Onboarding Progress</h4>
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${editingAgent.heyGenAvatarId && editingAgent.heyGenVoiceId ? 'bg-emerald-500 border-emerald-600 shadow-lg' : 'bg-white border-slate-200 shadow-inner'}`}>
                                  {editingAgent.heyGenAvatarId && editingAgent.heyGenVoiceId ? <CheckSquare className="text-white" size={24}/> : <Clock className="text-slate-200" size={24}/>}
                              </div>
                              <div>
                                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">AI Identity Linked</span>
                                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Task updates automatically upon valid ID entry</p>
                              </div>
                          </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 border-b-8 border-indigo-600"
                      >
                          {isLoading ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18}/>}
                          Authorize & Sync Identity
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AgentRoster;
