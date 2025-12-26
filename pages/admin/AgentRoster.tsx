
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Phone, Award, 
  TrendingUp, Briefcase, ChevronRight,
  Loader2, Trophy, Star, Sparkles, Zap, Crown,
  LayoutGrid, List, ArrowRight, BarChart3, Search, Filter,
  ShieldCheck, Target, TrendingDown, Medal,
  GitGraph, Network, UserCheck, MessageSquare, Mail,
  Kanban as KanbanIcon, MoreHorizontal, Plus
} from 'lucide-react';
import { Agent } from '../../types';
import { airtableService } from '../../services/airtable';

interface RecruitingLead {
  id: string;
  name: string;
  source: string;
  volume: string;
  status: 'New' | 'Interview' | 'Offer' | 'Hired';
  lastTouch: string;
}

const AgentRoster: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roster' | 'recruiting' | 'structure' | 'performance'>('roster');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fix: Updated mockAgents with missing properties from Agent interface
  const mockAgents: Agent[] = [
    { id: '1', name: 'Sarah Smith', role: 'Elite Producer', email: 'sarah@nexus.com', phone: '512-555-0101', volume: 12500000, deals: 24, capProgress: 100, capPaid: 20000, capTotal: 20000, status: 'Active', availability: 'Online', dailyLeadCap: 5, leadsReceivedToday: 2, badges: ['top_closer', 'five_star', 'volume_titan'], teamLead: 'Jessica Pearson', serviceAreasZips: ['78704', '78701'], specialties: ['Luxury', 'Seller'], closingRate: 92 },
    { id: '2', name: 'Mike Ross', role: 'Associate', email: 'mike@nexus.com', phone: '512-555-0102', volume: 4200000, deals: 8, capProgress: 45, capPaid: 9000, capTotal: 20000, status: 'Active', availability: 'In Field', dailyLeadCap: 3, leadsReceivedToday: 1, badges: ['fast_starter'], teamLead: 'Harvey Specter', serviceAreasZips: ['78702', '78705'], specialties: ['First-Time', 'Relocation'], closingRate: 88 },
    { id: '3', name: 'Jessica Pearson', role: 'Team Lead', email: 'jessica@nexus.com', phone: '512-555-0103', volume: 28000000, deals: 42, capProgress: 100, capPaid: 20000, capTotal: 20000, status: 'Active', availability: 'Online', dailyLeadCap: 10, leadsReceivedToday: 0, badges: ['top_closer', 'volume_titan', 'cap_crusader'], serviceAreasZips: ['78701', '78746'], specialties: ['Luxury', 'Investors'], closingRate: 95 },
    { id: '4', name: 'Harvey Specter', role: 'Elite Producer', email: 'harvey@nexus.com', phone: '512-555-0104', volume: 15000000, deals: 18, capProgress: 80, capPaid: 16000, capTotal: 20000, status: 'Active', availability: 'Online', dailyLeadCap: 5, leadsReceivedToday: 4, badges: ['top_closer', 'volume_titan'], teamLead: 'Jessica Pearson', serviceAreasZips: ['78704', '78703'], specialties: ['Luxury', 'Seller'], closingRate: 90 }
  ];

  const [recruits] = useState<RecruitingLead[]>([
    { id: 'r1', name: 'Leslie Knope', source: 'LinkedIn', volume: '$12M', status: 'Offer', lastTouch: '2h ago' },
    { id: 'r2', name: 'Ron Swanson', source: 'Referral', volume: '$8M', status: 'Interview', lastTouch: '1d ago' },
    { id: 'r3', name: 'Ann Perkins', source: 'Cold Outreach', volume: '$4M', status: 'New', lastTouch: '3d ago' },
    { id: 'r4', name: 'Chris Traeger', source: 'LinkedIn', volume: '$15M', status: 'Hired', lastTouch: 'Just now' },
  ]);

  const badgeConfig: Record<string, { label: string; icon: React.FC<any>; style: string; color: string }> = {
    top_closer: { label: 'Top Closer', icon: Crown, style: 'bg-yellow-50 text-yellow-700 border-yellow-100', color: 'text-yellow-600' },
    volume_titan: { label: 'Volume Titan', icon: TrendingUp, style: 'bg-blue-50 text-blue-700 border-blue-100', color: 'text-blue-600' },
    five_star: { label: '5-Star Service', icon: Star, style: 'bg-orange-50 text-orange-700 border-orange-100', color: 'text-orange-600' },
    fast_starter: { label: 'Fast Starter', icon: Zap, style: 'bg-purple-50 text-purple-700 border-purple-100', color: 'text-purple-600' },
    cap_crusader: { label: 'Cap Crusader', icon: Trophy, style: 'bg-emerald-50 text-emerald-700 border-emerald-100', color: 'text-emerald-600' },
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await airtableService.getAgents();
      setAgents(data && data.length > 0 ? data : mockAgents);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const renderRecruitingKanban = () => {
    const columns: RecruitingLead['status'][] = ['New', 'Interview', 'Offer', 'Hired'];
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in h-[calc(100vh-280px)] overflow-hidden">
        {columns.map(col => (
          <div key={col} className="bg-slate-100/50 rounded-2xl p-3 flex flex-col h-full border border-slate-200/50">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="font-black text-slate-400 text-[9px] uppercase tracking-[0.2em]">{col}</h3>
              <span className="bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-indigo-600 shadow-sm border border-slate-100">
                {recruits.filter(r => r.status === col).length}
              </span>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-hide">
              {recruits.filter(r => r.status === col).map(recruit => (
                <div key={recruit.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">{recruit.name}</h4>
                    <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={12}/></button>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-indigo-600 uppercase tracking-widest">{recruit.volume} Vol</span>
                    <span className="text-slate-400 uppercase tracking-widest">{recruit.source}</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[8px] text-slate-400 font-medium italic">{recruit.lastTouch}</span>
                    <div className="flex gap-1">
                      <button className="p-1 bg-slate-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"><Phone size={10}/></button>
                      <button className="p-1 bg-slate-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"><Mail size={10}/></button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white transition-all text-[9px] font-black uppercase tracking-widest">
                <Plus size={12} /> Add Prospect
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTeamHierarchy = () => {
    const teamLeads = agents.filter(a => a.role === 'Team Lead' || !a.teamLead);
    return (
      <div className="space-y-6 animate-fade-in">
        {teamLeads.map(lead => (
          <div key={lead.id} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-slate-900 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-lg">
                  {lead.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{lead.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-indigo-400 font-black uppercase text-[8px] tracking-[0.2em]">Lead Strategist</span>
                    <div className="flex text-yellow-400 gap-0.5">
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                      <Star size={10} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center">
                   <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Team Vol</p>
                   <p className="text-lg font-black text-white tracking-tighter">$42.5M</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center">
                   <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Size</p>
                   <p className="text-lg font-black text-white tracking-tighter">{agents.filter(a => a.teamLead === lead.name).length + 1}</p>
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50">
              {agents.filter(a => a.teamLead === lead.name).map(member => (
                <div key={member.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-indigo-200 transition-all group">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {member.name[0]}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 uppercase tracking-tight text-[11px] truncate">{member.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                   </div>
                   <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                </div>
              ))}
              <button className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all group">
                <Network size={16} />
                <span className="font-black uppercase tracking-widest text-[10px]">Add Member</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Agent Console.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-0.5">Recognition, Production & Talent Hub</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">
                <UserPlus size={14} /> Onboard
            </button>
            <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm">
                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><List size={16}/></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutGrid size={16}/></button>
            </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-hide w-full border-b border-slate-100">
          {[
            { id: 'roster', label: 'Roster' },
            { id: 'recruiting', label: 'Recruiting' },
            { id: 'structure', label: 'Hierarchy' },
            { id: 'performance', label: 'Apex' }
          ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                  {tab.label}
              </button>
          ))}
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm">
              <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] italic">Syncing Production Data...</p>
          </div>
      ) : activeTab === 'roster' ? (
          <>
            {viewMode === 'table' ? (
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-5">Professional</th>
                                <th className="p-5">Volume (YTD)</th>
                                <th className="p-5">Cap Progress</th>
                                <th className="p-5">Activity</th>
                                <th className="p-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agents.map(agent => (
                                <tr key={agent.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-indigo-100 shadow-inner">
                                                {agent.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-slate-900 uppercase tracking-tight text-sm truncate group-hover:text-indigo-600 transition-colors">{agent.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{agent.role}</span>
                                                    {agent.badges?.slice(0, 2).map(b => (
                                                        <div key={b} className={`p-0.5 rounded ${badgeConfig[b]?.style}`} title={badgeConfig[b]?.label}>
                                                            {badgeConfig[b] && React.createElement(badgeConfig[b].icon, { size: 8 })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-black text-slate-800 text-lg tracking-tight">${(agent.volume / 1000000).toFixed(1)}M</p>
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{agent.deals} Deals</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5 shadow-inner">
                                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${agent.capProgress}%` }} />
                                        </div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{agent.capProgress}% TO CAP</p>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            agent.availability === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                            {agent.availability}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                                            <ChevronRight size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {agents.map(agent => (
                        <div key={agent.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all group flex flex-col">
                            <div className="p-6 text-center md:text-left flex-1">
                                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-700 text-2xl border border-indigo-100 shadow-inner">
                                        {agent.name[0]}
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap justify-center md:justify-end">
                                        {agent.badges?.slice(0,3).map(b => (
                                            <div key={b} className={`p-2 rounded-xl border ${badgeConfig[b]?.style || 'bg-slate-50'} shadow-sm`} title={badgeConfig[b]?.label}>
                                                {badgeConfig[b] && React.createElement(badgeConfig[b].icon, { size: 14 })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <h3 className="font-black text-xl text-slate-900 tracking-tighter italic uppercase truncate">{agent.name}</h3>
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1 mb-6">{agent.role}</p>

                                <div className="mt-4 pt-6 border-t border-slate-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Badge Vault</p>
                                        <Trophy size={12} className="text-yellow-500" />
                                    </div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {Object.keys(badgeConfig).map(badgeKey => {
                                            const hasBadge = agent.badges?.includes(badgeKey);
                                            const config = badgeConfig[badgeKey];
                                            return (
                                                <div 
                                                    key={badgeKey} 
                                                    className={`aspect-square rounded-xl flex items-center justify-center border transition-all duration-500 ${
                                                        hasBadge ? `border-indigo-100 bg-white shadow-md scale-110` : 'border-slate-50 bg-slate-50/30 opacity-20 grayscale'
                                                    }`}
                                                    title={config.label}
                                                >
                                                    <config.icon size={hasBadge ? 16 : 14} className={hasBadge ? config.color : 'text-slate-300'} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Volume</p>
                                        <p className="font-black text-lg tracking-tighter">${(agent.volume / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Deals</p>
                                        <p className="font-black text-lg tracking-tighter">{agent.deals}</p>
                                    </div>
                                </div>
                                <button className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-xl active:scale-95 group-hover:rotate-6">
                                    <ArrowRight size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </>
      ) : activeTab === 'recruiting' ? (
        renderRecruitingKanban()
      ) : activeTab === 'structure' ? (
        renderTeamHierarchy()
      ) : activeTab === 'performance' ? (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><BarChart3 size={200} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <span className="bg-indigo-600 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full mb-3 inline-block">Monthly Season</span>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Production <br/> Apex.</h2>
                        <p className="text-slate-400 mt-4 max-w-xs text-xs font-medium leading-relaxed">Stack ranking based on GCI, Volume, and CSAT logic.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 w-full md:w-[320px]">
                        {agents.sort((a,b) => b.volume - a.volume).slice(0, 3).map((a, i) => (
                            <div key={a.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-4 hover:bg-white/10 transition-all cursor-default">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                    i === 0 ? 'bg-yellow-400 text-slate-900' : 
                                    i === 1 ? 'bg-slate-300 text-slate-900' : 'bg-orange-400 text-slate-900'
                                }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-xs uppercase tracking-tight truncate">{a.name}</p>
                                    <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">${(a.volume / 1000000).toFixed(1)}M</p>
                                </div>
                                <Trophy size={14} className={i === 0 ? 'text-yellow-400' : 'text-white/20'} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Efficiency</p>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl font-black text-slate-800">92%</div>
                        <div className="text-emerald-500 flex items-center gap-1 font-bold text-[10px]"><TrendingUp size={12}/> +4%</div>
                    </div>
                    <div className="mt-3 h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Market Rank</p>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl font-black text-slate-800">Top 5%</div>
                        <ShieldCheck size={24} className="text-indigo-600" />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium mt-3 italic uppercase tracking-widest">Global Benchmarking</p>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CSAT Index</p>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl font-black text-slate-800">4.92</div>
                        <div className="flex text-yellow-400"><Star size={20} fill="currentColor"/></div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium mt-3 uppercase tracking-widest">1.2k Aggregate Reviews</p>
                </div>
            </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[1.5rem] border border-dashed border-slate-200">
            <Sparkles size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Tab Data Hydrating...</p>
        </div>
      )}
    </div>
  );
};

export default AgentRoster;
