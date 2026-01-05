
import React, { useState } from 'react';
import { 
  TrendingUp, ArrowUpRight, LayoutDashboard, ListTodo, 
  ShieldAlert, DollarSign, Briefcase, Bell, Navigation, 
  X, ChevronRight, Activity, Clock, Circle, CheckCircle2,
  Phone, Mail, MessageSquare, Target, UserPlus, AlertTriangle,
  FileText, Landmark, Gauge
} from 'lucide-react';
import { UserContext, Deal } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

type DashboardTab = 'overview' | 'tasks' | 'risk' | 'earnings';

interface AgentDashboardProps {
    userContext?: UserContext | null;
    onNavigate?: (view: string) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ userContext, onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [showingModeEnabled, setShowingModeEnabled] = useState(true);

  const agentStats = {
    activeDeals: 4, pendingGCI: 42500, ytdVolume: 12500000, ytdGCI: 375000, leadsToday: 12
  };

  const activeDeals: Deal[] = [
    { id: '1', address: '123 Main St', price: 850000, stage: 'Under Contract', clientName: 'Alice Freeman', healthScore: 92, healthStatus: 'Healthy', nextTask: 'Order Title', missingDocs: 0, winProbability: 95 },
    { id: '2', address: '456 Oak Ave', price: 420000, stage: 'Active', clientName: 'Bob Driller', healthScore: 45, healthStatus: 'Critical', nextTask: 'Sign Addendum', missingDocs: 2, winProbability: 40 },
    { id: '3', address: '789 Skyline Dr', price: 1200000, stage: 'Negotiation', clientName: 'Charlie Day', healthScore: 78, healthStatus: 'At Risk', nextTask: 'Review Counter', missingDocs: 0, winProbability: 65 }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-full overflow-hidden">
      {/* Field Mode Indicator */}
      {showingModeEnabled && userContext?.predictedIntent === 'Showing Mode' && (
          <div className="bg-indigo-600 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden flex items-center justify-between group border-b-8 border-indigo-900 transition-all animate-fade-in-up">
              <div className="relative z-10 flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                      <Navigation className="text-white animate-pulse" size={24} />
                  </div>
                  <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 leading-none mb-1">Active Showing Path</p>
                      <h2 className="text-lg font-black uppercase tracking-tighter italic truncate leading-none">{userContext.address}</h2>
                      <p className="text-[10px] font-bold text-indigo-100 mt-1 uppercase tracking-widest">Entry: {userContext.lockboxCode}</p>
                  </div>
              </div>
              <button onClick={() => setShowingModeEnabled(false)} className="relative z-10 p-3 bg-black/20 hover:bg-black/40 rounded-2xl transition-all"><X size={20} /></button>
          </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm overflow-x-auto max-w-full scrollbar-hide">
        {[
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'tasks', label: 'Tasks', icon: ListTodo },
          { id: 'risk', label: 'Risk & Audit', icon: ShieldAlert },
          { id: 'earnings', label: 'Earnings', icon: DollarSign }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-indigo-700 hover:bg-slate-50'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MTD Volume</p>
                            <h3 className="text-3xl font-black tracking-tighter text-slate-900 italic tabular-nums">$1.2M</h3>
                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-2 uppercase"><ArrowUpRight size={12}/> +4.2% Growth</span>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
                            <h3 className="text-3xl font-black tracking-tighter text-indigo-700 italic">{agentStats.activeDeals} Units</h3>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl text-white relative overflow-hidden border-b-8 border-indigo-600">
                            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1">Pending GCI</p>
                            <h3 className="text-3xl font-black tracking-tighter italic tabular-nums">${agentStats.pendingGCI.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                            <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2"><Briefcase size={18} className="text-indigo-600" /> Pipeline Matrix</h3>
                            <button onClick={() => onNavigate?.('transactions')} className="text-[10px] font-black uppercase text-indigo-700 hover:underline tracking-widest">Master View</button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {activeDeals.map(deal => (
                                <div key={deal.id} className="p-6 hover:bg-slate-50 transition-all group flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic border shadow-inner ${deal.healthStatus === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : deal.healthStatus === 'At Risk' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {deal.address[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-900 text-base uppercase tracking-tight italic truncate group-hover:text-indigo-700 transition-colors">{deal.address}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{deal.clientName} • Stage: {deal.stage}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${deal.healthStatus === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : deal.healthStatus === 'At Risk' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            {deal.healthStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-md overflow-hidden h-fit">
                        <div className="p-6 bg-slate-800 text-white flex justify-between items-center px-8">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Bell size={18} className="text-indigo-400 animate-pulse" /> Live Pulse
                            </h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red] shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Audit Alert</p>
                                    <p className="text-[11px] text-slate-400 mt-1">123 Main St inspection contingency expires in 4 hours.</p>
                                    <button className="mt-3 text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:underline">Correct Protocol</button>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 border-t border-slate-800 pt-6">
                                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">New Showing Request</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Alice Freeman requested a tour for 789 Skyline Dr.</p>
                                    <button className="mt-3 text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:underline">Approve Slot</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                    <h3 className="text-lg font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2"><Clock size={20} className="text-indigo-600"/> Upcoming Showings</h3>
                    <div className="space-y-4">
                        {[
                            { time: 'Today, 2:00 PM', address: '123 Main St', client: 'Alice Freeman' },
                            { time: 'Tomorrow, 10:00 AM', address: '456 Oak Ave', client: 'Bob Driller' }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-400 transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{s.time}</p>
                                    <h4 className="font-black text-slate-900 uppercase text-sm">{s.address}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{s.client}</p>
                                </div>
                                <button className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all"><Navigation size={18}/></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                    <h3 className="text-lg font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2"><ListTodo size={20} className="text-indigo-600"/> Critical Actions</h3>
                    <div className="space-y-3">
                        {[
                            'Send repair addendum for 123 Main St',
                            'Follow up with lender for Bob Driller',
                            'Order professional photos for new listing',
                            'Call lead: Jessica Pearson (High Intent)'
                        ].map((task, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl group hover:shadow-md transition-all">
                                <button className="w-5 h-5 rounded-md border-2 border-slate-200 group-hover:border-indigo-500 flex items-center justify-center transition-all">
                                    <CheckCircle2 size={12} className="text-indigo-500 opacity-0 group-hover:opacity-100"/>
                                </button>
                                <span className="text-xs font-bold text-slate-700">{task}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'risk' && (
            <div className="space-y-6 animate-fade-in-up">
                <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-8 flex items-start gap-6 shadow-sm">
                    <ShieldAlert size={40} className="text-red-500 shrink-0" />
                    <div>
                        <h4 className="font-black text-red-900 uppercase tracking-tight text-lg mb-1 italic">Vulnerability Audit Active</h4>
                        <p className="text-red-700 text-sm font-medium leading-relaxed">System identified 3 deal health issues and 2 compliance risks across your active pipeline.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeDeals.filter(d => d.healthStatus !== 'Healthy').map(deal => (
                        <div key={deal.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8 group hover:border-red-400 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-black border border-red-100">{deal.address[0]}</div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase text-sm">{deal.address}</h4>
                                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{deal.healthStatus}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">Score: {deal.healthScore}%</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Stall Trigger</p>
                                <p className="text-xs font-bold text-slate-700 italic">"Contract signatures missing on 2 of 14 mandatory disclosures."</p>
                            </div>
                            <button className="w-full py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-red-700 transition-all">Resolve Risk</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'earnings' && (
            <div className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white border-b-8 border-indigo-600">
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">MTD Net Income</p>
                        <h3 className="text-4xl font-black tracking-tighter tabular-nums">$24,500</h3>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-3 uppercase"><ArrowUpRight size={14}/> +12% VS LAST MO</span>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending GCI</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight tabular-nums">$42.5k</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Commission</p>
                        <h3 className="text-3xl font-black text-indigo-600 tracking-tight tabular-nums">2.8%</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Spend (MTD)</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight tabular-nums">$1.2k</h3>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Brokerage Cap Tracker</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Split Tier: 80 / 20 Platinum</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-indigo-600 tabular-nums">$18,000 / $20,000</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Paid Toward Cap</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all duration-1000" style={{ width: '90%' }} />
                    </div>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                            <p className="text-sm font-black text-emerald-600 uppercase italic">90% CAP REACHED</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Est. Cap Date</p>
                            <p className="text-sm font-black text-slate-800 uppercase italic">NOV 15, 2024</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
